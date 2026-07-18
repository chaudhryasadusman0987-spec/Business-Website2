import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sendEmail(
      body.email,
      `New Enquiry — ${SITE_FULL} Website`,
      buildEmail(body)
    )
    // Storage is best-effort: the customer's email has already gone out, so a
    // KV/disk failure must not turn a successful send into an error response.
    try {
      await logLead(body)
    } catch (err) {
      console.error("Contact lead log failed (email already sent):", err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json({ error: "Could not send message" }, { status: 500 })
  }
}
