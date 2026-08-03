import { NextResponse } from "next/server"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

interface QuoteItem {
  name: string
  description: string
  category: string
  qty: number
  unitPrice: number
  originalPrice: number
  isOnSale: boolean
  discountPercent: number
  lineTotal: number
}

interface QuoteBody {
  fname: string
  lname: string
  email: string
  phone: string
  suburb: string
  source: string
  propertyType: string | null
  timing: string | null
  items: QuoteItem[]
  installFee: number
  // Per-unit install rate and the unit count behind `installFee`. Optional so a
  // stale tab posting the old payload still renders a valid email.
  installPerUnit?: number
  totalQty?: number
  subtotal: number
  gst: number
  total: number
}

async function logLead(body: QuoteBody) {
  await appendLead({
    id: Date.now().toString(),
    name: `${body.fname} ${body.lname}`.trim(),
    phone: body.phone,
    email: body.email,
    service: "security-solutions",
    message: `Quote: ${body.items
      .map((i) => `${i.name} ×${i.qty}`)
      .join(", ")} — total ${formatAUD(body.total)}`,
    date: new Date().toISOString(),
    status: "New",
    page: "/services/security-solutions/quote",
    source: "quote_form",
  })
}

function buildEmail(body: QuoteBody): string {
  const rows = body.items
    .map(
      (i, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#f9fffe"}">
        <td style="padding:12px;border-bottom:1px solid #e0f0ea">
          <strong style="font-size:14px;color:#1a1a2e">${i.name}</strong>
          ${
            i.description
              ? `<br/><span style="font-size:12px;color:#666;margin-top:3px;display:block">${i.description}</span>`
              : ""
          }
          ${
            i.discountPercent > 0
              ? `<span style="background:#e1f5ee;color:#0f6e56;font-size:10px;font-weight:bold;padding:2px 8px;border-radius:99px;margin-top:4px;display:inline-block">${i.discountPercent}% OFF</span>`
              : ""
          }
        </td>
        <td style="padding:12px;border-bottom:1px solid #e0f0ea;font-size:13px;color:#666">${i.category}</td>
        <td style="padding:12px;border-bottom:1px solid #e0f0ea;text-align:center;font-size:14px;font-weight:600;color:#1a1a2e">${i.qty}</td>
        <td style="padding:12px;border-bottom:1px solid #e0f0ea;text-align:right;font-size:13px;color:#666">
          ${
            i.discountPercent > 0
              ? `<span style="text-decoration:line-through;color:#999">${formatAUD(
                  i.originalPrice
                )}</span><br/><span style="color:#0f6e56;font-weight:600">${formatAUD(
                  i.unitPrice
                )}</span>`
              : formatAUD(i.unitPrice)
          }
        </td>
        <td style="padding:12px;border-bottom:1px solid #e0f0ea;text-align:right;font-weight:600;font-size:14px;color:#0f6e56">${formatAUD(
          i.lineTotal
        )}</td>
      </tr>`
    )
    .join("")

  // Fall back to the item quantities when the client didn't send a unit count.
  const totalQty =
    body.totalQty ?? body.items.reduce((n, i) => n + i.qty, 0)
  const installPerUnit = body.installPerUnit ?? 0
  const installBreakdown =
    installPerUnit > 0
      ? `<br/><span style="font-size:12px;color:#999">${totalQty} unit${
          totalQty === 1 ? "" : "s"
        } &times; ${formatAUD(installPerUnit)} per unit</span>`
      : ""

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
    <div style="background:#0F6E56;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">${SITE_FULL}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.85">Security Solutions Quote</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p>Hi ${body.fname}, thank you for your quote request.</p>
      <p style="font-size:13px;color:#555">
        Property type: <strong>${body.propertyType ?? "—"}</strong><br/>
        Preferred timing: <strong>${body.timing ?? "—"}</strong>
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#e1f5ee">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#085041;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #5dcaa5">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#085041;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #5dcaa5">Category</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#085041;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #5dcaa5">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#085041;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #5dcaa5">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#085041;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #5dcaa5">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="padding:10px 12px;text-align:right;color:#666;font-size:13px">Installation &amp; Labour${installBreakdown}</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;color:#666">${formatAUD(
              body.installFee
            )}</td>
          </tr>
          <tr>
            <td colspan="4" style="padding:8px 12px;text-align:right;color:#666;font-size:13px">Subtotal (ex GST)</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;color:#666">${formatAUD(
              body.subtotal
            )}</td>
          </tr>
          <tr>
            <td colspan="4" style="padding:8px 12px;text-align:right;color:#666;font-size:13px">GST (10%)</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;color:#666">${formatAUD(
              Math.round(body.gst)
            )}</td>
          </tr>
          <tr style="background:#e1f5ee">
            <td colspan="4" style="padding:14px 12px;text-align:right;font-weight:700;font-size:16px;color:#085041">Total (AUD)</td>
            <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:18px;color:#0f6e56">${formatAUD(
              Math.round(body.total)
            )}</td>
          </tr>
        </tfoot>
      </table>
      <p style="background:#E1F5EE;color:#085041;padding:10px;border-radius:6px;font-size:13px;text-align:center">
        Quote valid for 30 days · Our team will follow up within 1 business day.
      </p>
      <p style="font-size:12px;color:#777">Questions? Call ${SITE_PHONE} or email ${SITE_EMAIL}.</p>
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

  if (!body.fname || !body.email || !body.phone) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  // Always save the lead first — a submission must reach the dashboard even if
  // email later fails.
  try {
    await logLead(body)
  } catch (err) {
    console.error("Security lead log failed (non-critical):", err)
  }

  // Try to send email — failure never shows an error to the customer.
  try {
    if (isSmtpConfigured()) {
      const html = buildEmail(body)
      // 1. Send the quote to the customer.
      try {
        await sendEmail(
          body.email,
          `Your Security Quote from ${SITE_FULL}`,
          html
        )
      } catch (emailErr) {
        console.error("Security quote customer email failed:", (emailErr as Error)?.message)
      }
      // 2. Send a copy of the quote to the business inbox (the lead).
      const owner = process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER
      if (owner) {
        try {
          await sendEmail(
            owner,
            `New security lead: ${body.fname} ${body.lname} — ${formatAUD(body.total)}`,
            html
          )
        } catch (ownerErr) {
          console.error("Security quote owner email failed:", (ownerErr as Error)?.message)
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
