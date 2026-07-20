import { NextResponse } from "next/server"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

interface QuoteBody {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  suburb: string
  licence: string
  purpose: string
  notes: string
  location: string
  locationSurcharge: number
  pickupDate: string
  returnDate: string
  pickupTime: string
  returnTime: string
  rentalDays: number
  sameLoc: boolean
  oneway: number
  vehicle: {
    name: string
    example: string
    dailyRate: number
    weeklyRate: number
    bond: number
  } | null
  extras: { name: string; amount: number }[]
  payment: "credit" | "debit" | null
  youngDriver: boolean
  young: number
  base: number
  extrasTotal: number
  subtotal: number
  gst: number
  total: number
  bond: number
  totalCard: number
}

const bondTimeline = [
  ["Return day", "Vehicle inspected — bond release begins if no damage."],
  ["Days 1–3", "Final rental charge is confirmed on your statement."],
  ["Within 10 days", "Bank releases the hold; available balance restored."],
  ["Still held?", "Contact your bank — release times vary by provider."],
]

async function logLead(body: QuoteBody) {
  await appendLead({
    id: Date.now().toString(),
    name: `${body.firstName} ${body.lastName}`.trim(),
    phone: body.phone,
    email: body.email,
    service: "car-rental",
    message: `Car rental: ${body.vehicle?.name ?? "—"} for ${
      body.rentalDays
    } day(s) from ${body.location} — total ${formatAUD(
      body.total
    )} + bond ${formatAUD(body.bond)}`,
    date: new Date().toISOString(),
    status: "New",
    page: "/services/car-rental/quote",
    source: "quote_form",
  })
}

function buildEmail(body: QuoteBody): string {
  const extraRows = body.extras
    .map(
      (e) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${e.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(
          e.amount
        )}</td>
      </tr>`
    )
    .join("")

  const surchargeRows = `
    ${
      body.locationSurcharge > 0
        ? `<tr><td style="padding:8px;border-bottom:1px solid #eee">${body.location} surcharge</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(
            body.locationSurcharge
          )}</td></tr>`
        : ""
    }
    ${
      body.oneway > 0
        ? `<tr><td style="padding:8px;border-bottom:1px solid #eee">One-way fee</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(
            body.oneway
          )}</td></tr>`
        : ""
    }
    ${
      body.young > 0
        ? `<tr><td style="padding:8px;border-bottom:1px solid #eee">Young driver surcharge</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(
            body.young
          )}</td></tr>`
        : ""
    }`

  const timelineRows = bondTimeline
    .map(
      ([label, text]) =>
        `<li style="margin:4px 0"><strong>${label}:</strong> ${text}</li>`
    )
    .join("")

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
    <div style="background:#1565c0;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px">${SITE_FULL}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.85">Car Rental Quote — Brisbane</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <p>Hi ${body.firstName}, thank you for your car rental enquiry.</p>
      <p style="font-size:13px;color:#555">
        Vehicle: <strong>${body.vehicle?.name ?? "—"}</strong> (${
    body.vehicle?.example ?? "—"
  })<br/>
        Pick-up: <strong>${body.location}</strong> on <strong>${
    body.pickupDate
  } ${body.pickupTime ?? ""}</strong><br/>
        Return: <strong>${body.returnDate} ${body.returnTime ?? ""}</strong> ${
    body.sameLoc ? "(same location)" : "(different location)"
  }<br/>
        Duration: <strong>${body.rentalDays} day(s)</strong><br/>
        Licence: <strong>${body.licence ?? "—"}</strong> &nbsp;|&nbsp;
        Purpose: <strong>${body.purpose ?? "—"}</strong>${
    body.notes
      ? `<br/>Special requests: <strong>${body.notes}</strong>`
      : ""
  }
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
        <thead>
          <tr style="text-align:left;background:#f7f7f7">
            <th style="padding:8px">Item</th>
            <th style="padding:8px;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${
              body.vehicle?.name ?? "Vehicle"
            } × ${body.rentalDays} day(s)</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatAUD(
              body.base
            )}</td>
          </tr>
          ${extraRows}
          ${surchargeRows}
        </tbody>
      </table>

      <p style="text-align:right;font-size:13px;margin:4px 0">Subtotal (ex. GST): <strong>${formatAUD(
        body.subtotal
      )}</strong></p>
      <p style="text-align:right;font-size:13px;margin:4px 0">GST (10%): <strong>${formatAUD(
        body.gst
      )}</strong></p>
      <p style="text-align:right;font-size:16px;margin:8px 0">Total to pay at pick-up: <strong>${formatAUD(
        body.total
      )}</strong></p>

      <!-- Security bond section — prominently displayed -->
      <div style="background:#e6f1fb;border:1px solid #90caf9;border-radius:8px;padding:16px;margin:20px 0">
        <h2 style="margin:0 0 6px;font-size:15px;color:#0c447c">Security bond: ${formatAUD(
          body.bond
        )} (held — not charged)</h2>
        <p style="font-size:13px;color:#185fa5;margin:0 0 8px">
          Your security bond is a pre-authorisation hold on your card. The funds
          are reserved, not debited${
            body.payment === "debit"
              ? " — note that with a debit card the bond is debited then refunded within 5–10 business days"
              : ""
          }.
        </p>
        <ul style="font-size:12px;color:#185fa5;padding-left:18px;margin:0">
          ${timelineRows}
        </ul>
        <p style="font-size:14px;color:#0c447c;font-weight:bold;margin:10px 0 0">
          Total card reservation needed: ${formatAUD(body.totalCard)}
        </p>
      </div>

      <p style="background:#e6f1fb;color:#0c447c;padding:10px;border-radius:6px;font-size:13px;text-align:center">
        Quote valid for 48 hours · Our team will confirm availability within 2 hours.
      </p>
      <p style="font-size:12px;color:#777">Questions? Call ${SITE_PHONE} or email ${SITE_EMAIL}.</p>
    </div>
  </div>`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as QuoteBody
    if (!body.firstName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Email is attempted first, but is never allowed to block the customer.
    if (isSmtpConfigured()) {
      const html = buildEmail(body)
      // 1. Send the quote to the customer.
      try {
        await sendEmail(
          body.email,
          `Your Car Rental Quote from ${SITE_FULL} — Brisbane`,
          html
        )
      } catch (emailErr) {
        console.error("Car rental quote customer email failed:", (emailErr as Error)?.message)
      }
      // 2. Send a copy of the quote to the business inbox (the lead).
      const owner = process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER
      if (owner) {
        try {
          await sendEmail(
            owner,
            `New car rental lead: ${body.firstName} ${body.lastName} — ${formatAUD(body.total)}`,
            html
          )
        } catch (ownerErr) {
          console.error("Car rental quote owner email failed:", (ownerErr as Error)?.message)
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
      console.error("Car rental lead log failed (non-critical):", err)
    }

    // Always return success — the customer never sees an error.
    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as { message?: string; code?: string; stack?: string }
    console.error("Car rental quote API error:", {
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
