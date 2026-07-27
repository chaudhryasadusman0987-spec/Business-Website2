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
  extras: { name: string; icon?: string; detail?: string; amount: number }[]
  payment: "credit" | "debit" | null
  youngDriver: boolean
  young: number
  base: number
  baseOriginal?: number
  discountPercent?: number
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
  const hasDiscount =
    !!body.discountPercent && (body.baseOriginal ?? 0) > body.base

  // One styled row of the cost breakdown. `detail` renders as a grey sub-line.
  const costRow = (label: string, amount: number, detail?: string) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #dceefb;font-size:13px;color:#444">
          ${label}
          ${
            detail
              ? `<br/><span style="font-size:11px;color:#8aa4bf">${detail}</span>`
              : ""
          }
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #dceefb;text-align:right;font-size:13px;color:#185fa5">${formatAUD(
          amount
        )}</td>
      </tr>`

  const extraRows = body.extras
    .map((e) => costRow(`${e.icon ?? ""} ${e.name}`.trim(), e.amount, e.detail))
    .join("")

  const surchargeRows = [
    body.locationSurcharge > 0
      ? costRow(`📍 ${body.location} surcharge`, body.locationSurcharge)
      : "",
    body.oneway > 0 ? costRow("🔀 One-way fee", body.oneway) : "",
    body.young > 0
      ? costRow(
          "⚠️ Young driver surcharge",
          body.young,
          `× ${body.rentalDays} day${body.rentalDays === 1 ? "" : "s"}`
        )
      : "",
  ].join("")

  // Key/value line inside the vehicle details box.
  const detailRow = (label: string, value: string, strong = false) => `
    <tr>
      <td style="font-size:13px;color:#185fa5;padding:4px 0;width:40%">${label}</td>
      <td style="font-size:${strong ? "14px" : "13px"};color:${
        strong ? "#0c447c" : "#444"
      };${strong ? "font-weight:600" : ""}">${value}</td>
    </tr>`

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

      <!-- VEHICLE DETAILS BOX -->
      <div style="background:#e6f1fb;border-radius:12px;padding:20px;margin:20px 0">
        <h3 style="color:#0c447c;font-size:15px;font-weight:700;margin:0 0 12px">🚗 Vehicle Details</h3>
        <table style="width:100%">
          ${detailRow("Vehicle Class", body.vehicle?.name ?? "—", true)}
          ${detailRow("Example Model", body.vehicle?.example ?? "—")}
          ${detailRow("Pick-up Location", body.location)}
          ${detailRow(
            "Pick-up Date",
            `${body.pickupDate} ${body.pickupTime ?? ""}`.trim()
          )}
          ${detailRow(
            "Return Date",
            `${body.returnDate} ${body.returnTime ?? ""}`.trim() +
              (body.sameLoc ? " (same location)" : " (different location)")
          )}
          ${detailRow(
            "Total Days",
            `${body.rentalDays} day${body.rentalDays === 1 ? "" : "s"}`,
            true
          )}
          ${detailRow("Licence", body.licence || "—")}
          ${detailRow("Purpose", body.purpose || "—")}
          ${body.notes ? detailRow("Special Requests", body.notes) : ""}
        </table>
      </div>

      <!-- COST BREAKDOWN TABLE -->
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#e6f1fb">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#0c447c;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #90caf9">Item</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#0c447c;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #90caf9">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #dceefb;font-size:14px;color:#1a1a2e;font-weight:600">
              ${body.vehicle?.name ?? "Vehicle"} × ${body.rentalDays} day${
    body.rentalDays === 1 ? "" : "s"
  }
              ${
                hasDiscount
                  ? `<span style="background:#e1f5ee;color:#0f6e56;font-size:10px;font-weight:bold;padding:2px 8px;border-radius:99px;margin-left:6px">${body.discountPercent}% OFF</span>
              <br/><span style="font-size:12px;color:#999;text-decoration:line-through">was ${formatAUD(
                body.baseOriginal ?? body.base
              )}</span>`
                  : ""
              }
            </td>
            <td style="padding:12px;border-bottom:1px solid #dceefb;text-align:right;font-weight:600;color:#185fa5">${formatAUD(
              body.base
            )}</td>
          </tr>
          ${extraRows}
          ${surchargeRows}
          <tr>
            <td style="padding:10px 12px;text-align:right;color:#666;font-size:13px">Subtotal (ex GST)</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;color:#666">${formatAUD(
              Math.round(body.subtotal)
            )}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;text-align:right;color:#666;font-size:13px">GST (10%)</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;color:#666">${formatAUD(
              Math.round(body.gst)
            )}</td>
          </tr>
          <tr style="background:#e6f1fb">
            <td style="padding:14px 12px;font-weight:700;font-size:16px;color:#0c447c">Total to pay at pick-up</td>
            <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:18px;color:#1565c0">${formatAUD(
              Math.round(body.total)
            )}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECURITY BOND BOX -->
      <div style="background:#fff3cd;border-left:4px solid #f0ad4e;border-radius:0 10px 10px 0;padding:14px 16px;margin:16px 0">
        <p style="font-weight:700;color:#856404;font-size:14px;margin:0 0 6px">💳 Security Bond — Important</p>
        <p style="font-size:13px;color:#856404;margin:0 0 8px;line-height:1.6">
          A security bond of <strong>${formatAUD(
            body.bond
          )}</strong> will be held on your card at pick-up as a pre-authorisation.
          This is NOT a charge — funds are released within 3–10 business days of
          return, provided no damage occurs${
            body.payment === "debit"
              ? ". Note that with a debit card the bond is debited then refunded within 5–10 business days"
              : ""
          }.
        </p>
        <ul style="font-size:12px;color:#856404;padding-left:18px;margin:0 0 8px">
          ${timelineRows}
        </ul>
        <p style="font-size:14px;color:#856404;font-weight:bold;margin:0">
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
  let body: QuoteBody
  try {
    body = (await req.json()) as QuoteBody
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!body.firstName || !body.email || !body.phone) {
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
    console.error("Car rental lead log failed (non-critical):", err)
  }

  // Try to send email — failure never shows an error to the customer.
  try {
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
      console.log("SMTP not configured — skipping email send. Lead saved to dashboard.")
    }
  } catch (e) {
    console.error("Email failed:", e)
    // Do not throw — the customer still sees success.
  }

  // Always return success — the customer never sees an error.
  return NextResponse.json({ success: true })
}
