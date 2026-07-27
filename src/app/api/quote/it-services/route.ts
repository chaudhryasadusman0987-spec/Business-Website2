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
// Mirrors the package cards in ITQuoteForm — the client only posts
// { id, price }, so the label/description/badge are resolved here.
type PkgMeta = { name: string; desc: string; badge?: string }
const PKG_META: Record<string, Record<string, PkgMeta>> = {
  web: {
    starter: { name: "Starter", desc: "5 pages · Contact form · SEO" },
    business: { name: "Business", desc: "15 pages · CMS · Analytics", badge: "Most Popular" },
    ecommerce: { name: "E-Commerce", desc: "Online store · Payments" },
  },
  app: {
    mvp: { name: "MVP App", desc: "1 platform · Core features" },
    full: { name: "Full App", desc: "iOS + Android · All features", badge: "Most Popular" },
  },
  ai: {
    chatbot: { name: "AI Chat Agent", desc: "Website chatbot · Lead capture", badge: "Best Value" },
    workflow: { name: "Workflow Automation", desc: "Automate manual processes" },
    custom: { name: "Custom AI", desc: "Bespoke AI solution" },
  },
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

interface ServiceRow {
  name: string
  packageName: string
  packageDescription: string
  badge?: string
  startingFrom: string
  originalPrice: string
  discountedPrice: string
  discountPercent: number
}

function serviceLine(svc: string, body: QuoteBody): ServiceRow {
  const pct = body.discountPercent ?? 0
  const d = (n: number) => (pct ? discounted(n, pct) : n)
  const name = SERVICE_LABELS[svc] ?? svc

  const sel =
    svc === "web" ? body.packages.web
    : svc === "app" ? body.packages.app
    : svc === "ai" ? body.packages.ai
    : null
  const meta = sel ? PKG_META[svc]?.[sel.id] : undefined

  // Consulting is hourly and has no package card.
  if (svc === "consulting") {
    return {
      name,
      packageName: "Hourly consulting",
      packageDescription: "Technology audit and roadmap",
      startingFrom: `${formatAUD(d(150))}/hr`,
      originalPrice: `${formatAUD(150)}/hr`,
      discountedPrice: `${formatAUD(d(150))}/hr`,
      discountPercent: pct,
    }
  }

  // "Custom AI" is quoted individually — no headline price to discount.
  const isCustom = svc === "ai" && sel?.id === "custom"
  const base = sel?.price ?? 0
  const priceLabel =
    isCustom ? "Custom quote"
    : base ? `From ${formatAUD(d(base))}`
    : "—"

  return {
    name,
    packageName: meta?.name ?? "—",
    packageDescription: meta?.desc ?? "",
    badge: meta?.badge,
    startingFrom: priceLabel,
    originalPrice: base ? `From ${formatAUD(base)}` : priceLabel,
    discountedPrice: priceLabel,
    // Only flag a discount when there is a real price it applies to.
    discountPercent: !isCustom && base && pct ? pct : 0,
  }
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
    .map((svc, idx) => {
      const s = serviceLine(svc, body)
      return `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#f9f9ff"}">
        <td style="padding:12px;border-bottom:1px solid #eeeeff">
          <strong style="font-size:14px;color:#1a1a2e">${s.name}</strong>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eeeeff">
          <span style="font-size:13px;font-weight:600;color:#534ab7">${s.packageName}</span>
          ${
            s.badge
              ? `<span style="background:#eeedfe;color:#534ab7;font-size:10px;font-weight:bold;padding:2px 8px;border-radius:99px;margin-left:6px">${s.badge}</span>`
              : ""
          }
          ${
            s.packageDescription
              ? `<br/><span style="font-size:12px;color:#666;margin-top:4px;display:block">${s.packageDescription}</span>`
              : ""
          }
        </td>
        <td style="padding:12px;border-bottom:1px solid #eeeeff;text-align:right">
          ${
            s.discountPercent > 0
              ? `<span style="text-decoration:line-through;color:#999;font-size:12px;display:block">${s.originalPrice}</span>
             <span style="font-weight:700;font-size:15px;color:#0f6e56">${s.discountedPrice}</span>
             <span style="background:#e1f5ee;color:#0f6e56;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:99px;display:inline-block;margin-top:3px">${s.discountPercent}% OFF</span>`
              : `<span style="font-weight:700;font-size:15px;color:#7f85f7">${s.startingFrom}</span>`
          }
        </td>
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

      <!-- SERVICES SELECTED TABLE -->
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#eeedfe">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#534ab7;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #7f85f7">Service</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#534ab7;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #7f85f7">Package Selected</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#534ab7;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #7f85f7">Starting From</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#eeedfe">
            <td colspan="2" style="padding:14px 12px;font-weight:700;font-size:15px;color:#534ab7">Indicative Total Range</td>
            <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:17px;color:#7f85f7">${
              body.estimate.range
            }</td>
          </tr>
        </tfoot>
      </table>

      ${
        body.discountPercent
          ? `<p style="background:#e1f5ee;color:#0f6e56;padding:10px;border-radius:6px;font-size:13px;text-align:center;font-weight:bold;margin:0 0 12px">
        🏷️ ${body.discountPercent}% launch discount applied — prices above already include it.
      </p>`
          : ""
      }

      <!-- PROJECT DETAILS -->
      <div style="background:#f9f9ff;border-radius:12px;padding:18px;margin:16px 0">
        <h3 style="color:#534ab7;font-size:14px;font-weight:700;margin:0 0 12px">📋 Your Project Details</h3>
        <table style="width:100%">
          <tr>
            <td style="font-size:12px;color:#9496a8;padding:4px 0;width:35%;text-transform:uppercase;letter-spacing:.04em">Budget Range</td>
            <td style="font-size:13px;color:#1a1a2e;font-weight:500">${
              body.budget ? BUDGET_LABELS[body.budget] : "—"
            }</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#9496a8;padding:4px 0;text-transform:uppercase;letter-spacing:.04em">Timeline</td>
            <td style="font-size:13px;color:#1a1a2e;font-weight:500">${
              body.timeline ? TIMELINE_LABELS[body.timeline] : "—"
            }</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#9496a8;padding:4px 0;text-transform:uppercase;letter-spacing:.04em">Description</td>
            <td style="font-size:13px;color:#1a1a2e">${c.description}</td>
          </tr>
        </table>
      </div>

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
  let body: QuoteBody
  try {
    body = (await req.json()) as QuoteBody
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const c = body.contact
  if (!c?.fname || !c?.email || !c?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Always save the lead first — a submission must reach the dashboard even if
  // email later fails.
  try {
    await logLead(body)
  } catch (err) {
    console.error("IT lead log failed (non-critical):", err)
  }

  // Try to send email — failure never shows an error to the customer.
  try {
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
      console.log("SMTP not configured — skipping email send. Lead saved to dashboard.")
    }
  } catch (e) {
    console.error("Email failed:", e)
    // Do not throw — the customer still sees success.
  }

  // Always return success — the customer never sees an error.
  return NextResponse.json({ success: true })
}
