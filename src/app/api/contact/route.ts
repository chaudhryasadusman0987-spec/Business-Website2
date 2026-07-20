import { NextResponse } from "next/server"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

interface ContactBody {
  name: string
  email: string
  phone: string
  service?: string
  message: string
}

async function logLead(body: ContactBody) {
  await appendLead({
    id: Date.now().toString(),
    name: body.name,
    phone: body.phone,
    email: body.email,
    service: body.service || "general",
    message: body.message,
    date: new Date().toISOString(),
    status: "New",
    page: "/contact",
    source: "contact_form",
  })
}

function buildEmail(body: ContactBody): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
    <div style="background:#7f85f7;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">${SITE_FULL}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.85">Thanks for getting in touch</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p>Hi ${body.name}, thank you for contacting us. Here is a copy of your enquiry:</p>
      <p style="font-size:13px;color:#555;margin:12px 0">
        ${body.service ? `Service: <strong>${body.service}</strong><br/>` : ""}
        Phone: <strong>${body.phone}</strong>
      </p>
      <p style="font-size:13px;color:#555;margin:12px 0">
        <strong>Your message</strong><br/>${body.message}
      </p>
      <p style="background:#eeedfe;color:#534ab7;padding:10px;border-radius:6px;font-size:13px;text-align:center">
        We will be in touch within 1 business day.
      </p>
      <p style="font-size:12px;color:#777">Questions? Call ${SITE_PHONE} or email ${SITE_EMAIL}.</p>
    </div>
  </div>`
}

function buildOwnerEmail(body: ContactBody): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
    <div style="background:#1a1a2e;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">New website enquiry</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.85">${SITE_FULL}</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px;font-size:14px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#888;width:120px">Name</td><td style="padding:6px 0"><strong>${body.name}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0"><a href="mailto:${body.email}">${body.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#888">Phone</td><td style="padding:6px 0"><a href="tel:${body.phone}">${body.phone}</a></td></tr>
        <tr><td style="padding:6px 0;color:#888">Service</td><td style="padding:6px 0">${body.service || "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;vertical-align:top">Message</td><td style="padding:6px 0;white-space:pre-wrap">${body.message}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Received</td><td style="padding:6px 0">${new Date().toLocaleString("en-AU")}</td></tr>
      </table>
    </div>
  </div>`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email is attempted first, but is never allowed to block the customer.
    if (isSmtpConfigured()) {
      // Confirmation to the customer.
      try {
        await sendEmail(
          body.email,
          `We received your message — ${SITE_FULL}`,
          buildEmail(body)
        )
      } catch (e) {
        console.error("Contact customer email failed:", (e as Error)?.message)
      }

      // Notification to the business owner.
      const owner = process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER
      if (owner) {
        try {
          await sendEmail(
            owner,
            `New enquiry from ${body.name} — ${SITE_FULL} website`,
            buildOwnerEmail(body)
          )
        } catch (e) {
          console.error("Contact owner email failed:", (e as Error)?.message)
        }
      }
    } else {
      console.log("SMTP not configured — skipping email send. Lead will be saved to dashboard.")
    }

    // Best-effort storage: a KV/disk failure must not turn a successful
    // submission into an error for the customer.
    try {
      await logLead(body)
    } catch (err) {
      console.error("Contact lead log failed (non-critical):", err)
    }

    // Always return success — the customer never sees an error.
    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as { message?: string; code?: string; stack?: string }
    console.error("Contact API error:", {
      message: e?.message,
      code: e?.code,
      stack: e?.stack,
    })
    return NextResponse.json(
      { error: "Could not send message", detail: e?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
