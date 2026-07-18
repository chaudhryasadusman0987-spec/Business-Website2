import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

interface QuoteItem {
  name: string
  category: string
  qty: number
  unitPrice: number
  originalPrice: number
  isOnSale: boolean
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
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">
          ${i.name}
          <div style="font-size:11px;color:#888">${i.category}</div>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">
          ${formatAUD(i.unitPrice)}
          ${
            i.isOnSale
              ? `<div style="font-size:11px;color:#999;text-decoration:line-through">was ${formatAUD(
                  i.originalPrice
                )}</div>`
              : ""
          }
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(i.lineTotal)}</td>
      </tr>`
    )
    .join("")

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
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
        <thead>
          <tr style="text-align:left;background:#f7f7f7">
            <th style="padding:8px">Product</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Unit</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr>
            <td colspan="3" style="padding:8px;text-align:right">Installation & labour</td>
            <td style="padding:8px;text-align:right">${formatAUD(body.installFee)}</td>
          </tr>
        </tbody>
      </table>
      <p style="text-align:right;font-size:13px;margin:4px 0">Subtotal (ex. GST): <strong>${formatAUD(body.subtotal)}</strong></p>
      <p style="text-align:right;font-size:13px;margin:4px 0">GST (10%): <strong>${formatAUD(body.gst)}</strong></p>
      <p style="text-align:right;font-size:18px;margin:8px 0">Total (AUD): <strong>${formatAUD(body.total)}</strong></p>
      <p style="background:#E1F5EE;color:#085041;padding:10px;border-radius:6px;font-size:13px;text-align:center">
        Quote valid for 30 days · Our team will follow up within 1 business day.
      </p>
      <p style="font-size:12px;color:#777">Questions? Call ${SITE_PHONE} or email ${SITE_EMAIL}.</p>
    </div>
  </div>`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as QuoteBody
    if (!body.fname || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendEmail(
      body.email,
      `Your Security Quote from ${SITE_FULL}`,
      buildEmail(body)
    )
    // Best-effort storage: the quote email has already been sent, so don't let
    // a KV/disk failure turn a successful send into an error for the customer.
    try {
      await logLead(body)
    } catch (err) {
      console.error("Security lead log failed (email already sent):", err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Security quote API error:", err)
    return NextResponse.json(
      { error: "Could not send quote" },
      { status: 500 }
    )
  }
}
