import { NextResponse } from "next/server"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { IT_BRAND, SITE_FULL, SITE_EMAIL, SITE_PHONE } from "@/data/site"

// IT & AI project brief endpoint.
//
// The form is a brief, not a quote calculator: nothing is priced here. The
// customer picks one of the three services (or the free consultation), tells us
// what they want, and we email the brief to the admin and a confirmation to
// them. Any range mentioned is the guide range shown on the website and is
// labelled as an estimate in both emails.

export const dynamic = "force-dynamic"

interface BriefBody {
  service?: string
  serviceName?: string
  estimatedRange?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  projectTitle?: string
  projectDescription?: string
  targetAudience?: string
  keyFeatures?: string
  existingWebsite?: string
  budgetRange?: string
  timeline?: string
  consultationPreference?: string
  preferredTime?: string
  hearAboutUs?: string
}

const CONSULTATION_LABELS: Record<string, string> = {
  "video-call": "Video call (Zoom/Teams)",
  "phone-call": "Phone call",
  "in-person": "In person (Brisbane)",
}

/** The brief is pasted straight into an HTML email — never trust it raw. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const cellKey =
  "padding:8px 12px;background:#f8f8f8;font-size:12px;font-weight:bold;color:#666;width:35%;border-bottom:1px solid #eee"
const cellVal =
  "padding:8px 12px;font-size:14px;color:#1a1a2e;border-bottom:1px solid #eee"

function rows(pairs: [string, string][]): string {
  return pairs
    .map(
      ([k, v]) =>
        `<tr><td style="${cellKey}">${esc(k)}</td><td style="${cellVal}">${esc(v)}</td></tr>`
    )
    .join("")
}

function block(title: string, body: string): string {
  return `
    <div style="background:#f0f0ff;border-radius:12px;padding:16px;margin-bottom:16px">
      <p style="font-size:12px;font-weight:bold;color:#534ab7;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em">${esc(
        title
      )}</p>
      <p style="font-size:14px;color:#1a1a2e;line-height:1.7;margin:0;white-space:pre-wrap">${esc(
        body
      )}</p>
    </div>`
}

function buildAdminEmail(b: BriefBody, isConsulting: boolean, customerName: string): string {
  const consultation =
    CONSULTATION_LABELS[b.consultationPreference ?? ""] ??
    b.consultationPreference ??
    "—"

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#7f85f7;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:22px">
        ${isConsulting ? "📅 New Consultation Request" : "📋 New Project Brief"}
      </h1>
      <p style="color:#c5c8fd;margin:4px 0 0">${IT_BRAND}</p>
    </div>
    <div style="padding:28px">

      <div style="background:#eeedfe;border-radius:12px;padding:16px;margin-bottom:20px">
        <h3 style="color:#534ab7;margin:0 0 10px">Service: ${esc(b.serviceName)}</h3>
        ${
          isConsulting
            ? ""
            : `<p style="color:#534ab7;margin:0;font-size:14px">
                 <strong>Estimated range:</strong> ${esc(b.estimatedRange)}<br/>
                 <em style="font-size:12px;color:#7f85f7">
                   This is the guide price shown on the website. Real price to be
                   confirmed in consultation.
                 </em>
               </p>`
        }
      </div>

      <h3 style="color:#1a1a2e;margin:0 0 12px">Contact Details</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        ${rows([
          ["Name", customerName],
          ["Email", b.email ?? "—"],
          ["Phone", b.phone ?? "—"],
          ["Company", b.company || "—"],
          ["Consultation", consultation],
          ["Preferred time", b.preferredTime || "Flexible"],
          ["How found us", b.hearAboutUs || "—"],
        ])}
      </table>

      ${
        isConsulting
          ? block("What they need help with", b.projectDescription ?? "")
          : `
        <h3 style="color:#1a1a2e;margin:0 0 12px">Project Brief</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          ${rows([
            ["Project title", b.projectTitle || "—"],
            ["Budget range", b.budgetRange || "Not specified"],
            ["Timeline", b.timeline || "Not specified"],
            ["Target audience", b.targetAudience || "—"],
            ["Existing website", b.existingWebsite || "None"],
          ])}
        </table>
        ${block("Project description", b.projectDescription ?? "")}
        ${b.keyFeatures ? block("Key features required", b.keyFeatures) : ""}`
      }

      <div style="background:#e1f5ee;border-radius:8px;padding:14px;margin-top:20px">
        <p style="margin:0;color:#085041;font-weight:bold;font-size:13px">
          ⚡ Action: Call ${esc(customerName)} on ${esc(b.phone)} within 24 hours to
          schedule a ${isConsulting ? "free consultation" : "discovery call"}.
        </p>
      </div>
    </div>
  </div>`
}

function buildCustomerEmail(b: BriefBody, isConsulting: boolean): string {
  const summary = rows([
    ["Service", b.serviceName ?? "—"],
    ["Guide price range", `${b.estimatedRange ?? "—"} (estimate only)`],
    ["Your budget", b.budgetRange || "Not specified"],
    ["Timeline", b.timeline || "Not specified"],
  ])

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#7f85f7;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:22px">
        ${isConsulting ? "Consultation Request Received" : "Project Brief Received ✅"}
      </h1>
      <p style="color:#c5c8fd;margin:4px 0 0">${IT_BRAND}</p>
    </div>
    <div style="padding:28px">
      <p style="color:#1a1a2e;font-size:15px">Hi <strong>${esc(b.firstName)}</strong>,</p>

      ${
        isConsulting
          ? `<p style="color:#555;font-size:14px;line-height:1.7">
               Thank you for booking a free consultation. We have received your
               request and will call you on <strong>${esc(b.phone)}</strong> within
               24 hours to confirm your session time.
             </p>`
          : `<p style="color:#555;font-size:14px;line-height:1.7">
               Thank you for sending us your project brief. Our team will review
               your requirements and send you an <strong>estimated price
               range</strong> within <strong>24 hours</strong>.
             </p>

             <div style="background:#fff3cd;border-left:4px solid #f0c040;padding:14px;border-radius:0 10px 10px 0;margin:20px 0">
               <p style="margin:0;color:#856404;font-size:13px;font-weight:bold">
                 ⚠️ About the estimated price
               </p>
               <p style="margin:6px 0 0;color:#856404;font-size:13px;line-height:1.6">
                 The price range we send you is an <strong>estimate based on
                 typical projects</strong> like yours. Your final price is
                 confirmed after our free 30-minute consultation where we discuss
                 your exact requirements. There is no obligation to proceed.
               </p>
             </div>

             <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:20px 0">
               <p style="font-size:12px;font-weight:bold;color:#534ab7;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em">
                 Your Project Summary
               </p>
               <table style="width:100%;border-collapse:collapse">${summary}</table>
             </div>`
      }

      <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:20px 0">
        <p style="font-size:13px;font-weight:bold;color:#1a1a2e;margin:0 0 10px">
          What happens next:
        </p>
        ${
          isConsulting
            ? `<p style="font-size:13px;color:#555;line-height:1.8;margin:0">
                 1. We call you on ${esc(b.phone)} within 24 hours<br/>
                 2. Free 30-min consultation — no obligation<br/>
                 3. We give you our honest recommendation<br/>
                 4. You decide if you want to proceed
               </p>`
            : `<p style="font-size:13px;color:#555;line-height:1.8;margin:0">
                 1. We review your brief today<br/>
                 2. Estimated price range sent to ${esc(b.email)} within 24 hours<br/>
                 3. Free 30-min consultation call to discuss details<br/>
                 4. Final price agreed before any work starts
               </p>`
        }
      </div>

      <p style="color:#666;font-size:13px">
        Questions? Call us anytime:<br/>
        <a href="tel:${SITE_PHONE.replace(/\s/g, "")}" style="color:#7f85f7;font-weight:bold;font-size:16px">
          ${SITE_PHONE}
        </a>
      </p>
    </div>
    <div style="background:#f8f8ff;padding:16px;text-align:center;font-size:11px;color:#9496a8">
      ${IT_BRAND} — part of ${SITE_FULL} · pakozsolutions.com.au
    </div>
  </div>`
}

export async function POST(req: Request) {
  let body: BriefBody
  try {
    body = (await req.json()) as BriefBody
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!body.firstName || !body.email || !body.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const isConsulting = body.service === "it-consulting"
  const serviceName = body.serviceName || "IT & AI Services"
  const customerName = `${body.firstName} ${body.lastName ?? ""}`.trim()

  // Save the lead first — a brief must reach the dashboard even if email fails.
  try {
    await appendLead({
      id: Date.now().toString(),
      name: customerName,
      phone: body.phone,
      email: body.email,
      company: body.company || "",
      service: `IT & AI — ${serviceName}`,
      message: [
        body.projectTitle ? `Title: ${body.projectTitle}` : "",
        body.projectDescription ?? "",
        body.budgetRange ? `Budget: ${body.budgetRange}` : "",
        body.timeline ? `Timeline: ${body.timeline}` : "",
        isConsulting ? "" : `Estimate shown: ${body.estimatedRange ?? "—"}`,
      ]
        .filter(Boolean)
        .join(" | "),
      date: new Date().toISOString(),
      status: "New",
      page: "/services/it-services/quote",
      // Lead["source"] is a fixed union; the consultation-vs-brief distinction
      // is carried by `service` ("IT & AI — IT Consulting") instead.
      source: "quote_form",
    })
  } catch (err) {
    console.error("IT brief lead log failed (non-critical):", err)
  }

  if (isSmtpConfigured()) {
    const admin =
      process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER || SITE_EMAIL
    try {
      await sendEmail(
        admin,
        isConsulting
          ? `📅 Consultation Request — ${customerName} — ${serviceName}`
          : `📋 Project Brief — ${customerName} — ${serviceName}`,
        buildAdminEmail(body, isConsulting, customerName)
      )
    } catch (err) {
      console.error("IT brief admin email failed:", (err as Error)?.message)
    }

    try {
      await sendEmail(
        body.email,
        isConsulting
          ? `Consultation Request Confirmed — ${SITE_FULL}`
          : `Your Project Brief — ${SITE_FULL}`,
        buildCustomerEmail(body, isConsulting)
      )
    } catch (err) {
      console.error("IT brief customer email failed:", (err as Error)?.message)
    }
  } else {
    console.log("SMTP not configured — skipping email send. Brief saved to dashboard.")
  }

  // Email problems are ours, not the customer's — the brief is already saved.
  return NextResponse.json({ success: true })
}
