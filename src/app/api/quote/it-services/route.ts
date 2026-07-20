import { NextResponse } from "next/server"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { formatAUD } from "@/lib/formatters"
import { discounted } from "@/lib/promo"
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

type PkgSel = { id: string; price: number } | null

interface QuoteBody {
  services: string[]
  packages: { web: PkgSel; app: PkgSel; ai: PkgSel }
  details: {
    web: { webPages: string; webDeadline: string; webDomain: string; webContent: string }
    app: { appPlatform: string; appType: string; appFeatures: string[] }
    ai: { aiPurpose: string; aiVolume: string; aiIntegrations: string[] }
    consulting: { conTopic: string; conHours: string; conFormat: string }
  }
  budget: string | null
  timeline: string | null
  discountPercent?: number
  contact: {
    fname: string
    lname: string
    email: string
    phone: string
    company?: string
    suburb?: string
    description: string
    source?: string
  }
  estimate: { total: number; range: string }
}

const SERVICE_LABELS: Record<string, string> = {
  web: "Web Development",
  app: "App Development",
  ai: "AI Automation",
  consulting: "IT Consulting",
}
const PKG_NAMES: Record<string, Record<string, string>> = {
  web: { starter: "Starter", business: "Business", ecommerce: "E-Commerce" },
  app: { mvp: "MVP App", full: "Full App" },
  ai: { chatbot: "AI Chat Agent", workflow: "Workflow Automation", custom: "Custom AI" },
}
const BUDGET_LABELS: Record<string, string> = {
  under3k: "Under $3,000",
  "3k-10k": "$3,000–$10,000",
  "10k-30k": "$10,000–$30,000",
  "30k+": "$30,000+",
}
const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1month": "Within 1 month",
  "3months": "1–3 months",
  flexible: "Flexible",
}

function serviceLine(svc: string, body: QuoteBody): { name: string; price: string } {
  const pct = body.discountPercent ?? 0
  const d = (n: number) => (pct ? discounted(n, pct) : n)
  let name = SERVICE_LABELS[svc] ?? svc
  let price = ""
  if (svc === "web" && body.packages.web) {
    name += ` — ${PKG_NAMES.web[body.packages.web.id] ?? ""}`
    price = body.packages.web.price ? `From ${formatAUD(d(body.packages.web.price))}` : "—"
  } else if (svc === "app" && body.packages.app) {
    name += ` — ${PKG_NAMES.app[body.packages.app.id] ?? ""}`
    price = body.packages.app.price ? `From ${formatAUD(d(body.packages.app.price))}` : "—"
  } else if (svc === "ai" && body.packages.ai) {
    name += ` — ${PKG_NAMES.ai[body.packages.ai.id] ?? ""}`
    price =
      body.packages.ai.id === "custom"
        ? "Custom quote"
        : body.packages.ai.price
          ? `From ${formatAUD(d(body.packages.ai.price))}`
          : "—"
  } else if (svc === "consulting") {
    price = `${formatAUD(d(150))}/hr`
  }
  return { name, price }
}

async function logLead(body: QuoteBody) {
  await appendLead({
    id: Date.now().toString(),
    name: `${body.contact.fname} ${body.contact.lname}`.trim(),
    phone: body.contact.phone,
    email: body.contact.email,
    service: body.services.map((s) => SERVICE_LABELS[s] ?? s).join(" + "),
    message: `${body.contact.description} | Budget: ${
      body.budget ? BUDGET_LABELS[body.budget] : "—"
    } | Estimate: ${body.estimate.range}`,
    date: new Date().toISOString(),
    status: "New",
    page: "/services/it-services/quote",
    source: "quote_form",
  })
}

function buildEmail(body: QuoteBody): string {
  const rows = body.services
    .map((svc) => {
      const { name, price } = serviceLine(svc, body)
      return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${price}</td>
      </tr>`
    })
    .join("")

  const c = body.contact
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
    <div style="background:#7f85f7;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">${SITE_FULL}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.85">IT &amp; AI Services Quote Request</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p>Hi ${c.fname}, thank you for your quote request.</p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
        <thead>
          <tr style="text-align:left;background:#f7f7f7">
            <th style="padding:8px">Service</th>
            <th style="padding:8px;text-align:right">Starting from</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      ${
        body.discountPercent
          ? `<p style="background:#e1f5ee;color:#0f6e56;padding:10px;border-radius:6px;font-size:13px;text-align:center;font-weight:bold;margin:0 0 12px">
        🏷️ ${body.discountPercent}% launch discount applied — prices above already include it.
      </p>`
          : ""
      }

      <p style="font-size:13px;color:#555;margin:4px 0">
        Budget range: <strong>${body.budget ? BUDGET_LABELS[body.budget] : "—"}</strong><br/>
        Timeline: <strong>${body.timeline ? TIMELINE_LABELS[body.timeline] : "—"}</strong>
      </p>

      <p style="font-size:13px;color:#555;margin:12px 0">
        <strong>Project description</strong><br/>${c.description}
      </p>

      <p style="background:#eeedfe;color:#534ab7;padding:14px;border-radius:8px;font-size:15px;text-align:center;margin:16px 0">
        Indicative range: <strong>${body.estimate.range}</strong><br/>
        <span style="font-size:12px">+ GST · estimate only, confirmed after a free consultation</span>
      </p>

      <p style="background:#eeedfe;color:#534ab7;padding:10px;border-radius:6px;font-size:13px;text-align:center">
        Estimate valid for 7 days · Our team will call you within 1 business day.
      </p>

      <p style="font-size:12px;color:#777">
        Contact: ${c.fname} ${c.lname}${c.company ? ` · ${c.company}` : ""}${
          c.suburb ? ` · ${c.suburb}` : ""
        }<br/>
        Questions? Call ${SITE_PHONE} or email ${SITE_EMAIL}.
      </p>
    </div>
  </div>`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as QuoteBody
    const c = body.contact
    if (!c?.fname || !c?.email || !c?.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email is attempted first, but is never allowed to block the customer.
    if (isSmtpConfigured()) {
      const html = buildEmail(body)
      // 1. Send the quote to the customer.
      try {
        await sendEmail(
          c.email,
          `Your IT & AI Quote from ${SITE_FULL}`,
          html
        )
      } catch (emailErr) {
        console.error("IT quote customer email failed:", (emailErr as Error)?.message)
      }
      // 2. Send a copy of the quote to the business inbox (the lead).
      const owner = process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER
      if (owner) {
        try {
          await sendEmail(
            owner,
            `New IT lead: ${c.fname} ${c.lname} — ${body.estimate.range}`,
            html
          )
        } catch (ownerErr) {
          console.error("IT quote owner email failed:", (ownerErr as Error)?.message)
        }
      }
    } else {
      console.log("SMTP not configured — skipping email send. Lead will be saved to dashboard.")
    }

    // Best-effort storage: a disk failure must not turn a successful
    // submission into an error for the customer.
    try {
      await logLead(body)
    } catch (err) {
      console.error("IT lead log failed (non-critical):", err)
    }

    // Always return success — the customer never sees an error.
    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as { message?: string; code?: string; stack?: string }
    console.error("IT quote API error:", {
      message: e?.message,
      code: e?.code,
      stack: e?.stack,
    })
    return NextResponse.json(
      { error: "Failed to send quote", detail: e?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
