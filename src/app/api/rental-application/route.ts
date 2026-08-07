import { NextResponse } from "next/server"
import { sendEmail, type EmailAttachment } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { getVehicle } from "@/lib/db"
import {
  MAX_UPLOAD_BYTES,
  licenceStateName,
  validateEmail,
  validateLicence,
  validateMobile,
} from "@/lib/rental-validation"
import {
  SITE_PHONE,
  SITE_EMAIL,
  BANK_NAME,
  BANK_BSB,
  BANK_ACCOUNT,
  BANK_PAYID,
} from "@/data/site"

// nodemailer + Buffer need the Node runtime (not edge).
export const runtime = "nodejs"

// Licence uploads are attached to the owner email. Anything larger is skipped
// rather than failing the whole application — serverless request bodies are
// capped (~4.5MB on Vercel) and a lost photo should not lose the lead.
const MAX_ATTACHMENT_BYTES = MAX_UPLOAD_BYTES

/**
 * Re-run a browser-side format check here. The client validates for the
 * customer's benefit, but anyone can POST straight at this route, so the value
 * the owner reads in the email is the normalised one where it passes — and is
 * flagged, not dropped, where it does not. A malformed number is still a lead
 * worth chasing, so nothing here rejects the request.
 */
function normalised(
  raw: string,
  check: (v: string) => { ok: boolean; value: string },
): string {
  if (!raw) return ""
  const result = check(raw)
  return result.ok ? result.value : `${raw} ⚠️ unverified format`
}

/** Escape user-supplied text before interpolating it into the email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Format an amount the browser claimed to have transferred. Anything missing or
 * unparseable reads "TBC" rather than "$NaN" — the owner checks the bank
 * account against the reference regardless of what this says.
 */
function money(raw: string): string {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return "TBC"
  return `$${n.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function row(k: string, v: string): string {
  return `
    <tr>
      <td style="padding:9px 12px;background:#f8f8ff;font-size:12px;font-weight:600;color:#666;width:35%;border-bottom:1px solid #eee;text-transform:uppercase;letter-spacing:.04em">${k}</td>
      <td style="padding:9px 12px;font-size:14px;color:#1a1a2e;border-bottom:1px solid #eee">${v}</td>
    </tr>`
}

async function toAttachment(
  value: FormDataEntryValue | null,
  filename: string
): Promise<EmailAttachment | null> {
  if (!value || typeof value === "string") return null
  const file = value as File
  if (file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) return null
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
  return {
    filename: `${filename}.${ext}`,
    content: Buffer.from(await file.arrayBuffer()),
    contentType: file.type || "application/octet-stream",
  }
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const get = (k: string) => ((fd.get(k) as string) || "").trim()

    const firstName = get("firstName")
    const lastName = get("lastName")
    const dob = get("dob")
    const address = get("address")

    // Format-checked and tidied for the owner's email. `phone` keeps the raw
    // value for tel: links and the lead record; `phoneLabel` is what is shown.
    const phone = get("phone")
    const email = get("email")
    const licenceState = get("licenceState") || "QLD"
    const licenceNo = get("licenceNumber")

    const phoneCheck = validateMobile(phone)
    // The owner sees the flag; the customer never does.
    const phoneLabel = normalised(phone, validateMobile)
    const phoneClean = phoneCheck.ok ? phoneCheck.value : phone
    const emailLabel = normalised(email, validateEmail)
    const licenceLabel = licenceNo
      ? `${normalised(licenceNo, (v) => validateLicence(v, licenceState))} (${licenceStateName(licenceState)})`
      : ""
    const vehicleName = get("vehicleName")
    const vehicleRego = get("vehicleRego")

    // Price the quote from the database rather than from the submitted form —
    // the browser could send anything, and the owner sets the weekly rate in
    // the dashboard. A DB hiccup just omits the price; the call confirms it.
    let weeklyLabel = ""
    let bondLabel = ""
    try {
      const vehicle = get("vehicleId") ? await getVehicle(get("vehicleId")) : null
      if (vehicle) {
        if (vehicle.weeklyRate > 0) {
          weeklyLabel = `$${vehicle.weeklyRate.toLocaleString("en-AU")} per week`
        }
        if (vehicle.bond > 0) {
          bondLabel = `$${vehicle.bond.toLocaleString("en-AU")}`
        }
      }
    } catch (e) {
      console.error("Vehicle price lookup failed:", e)
    }

    // Direct deposit is the only method the rental flow offers. No card details
    // are collected, so nothing here can leak them — a deliberate choice, since
    // storing or forwarding a PAN or CVV would be a PCI-DSS breach. Route any
    // future card payments through a processor such as Stripe instead.
    const paymentMethod = "Direct Deposit / PayID"

    // What the customer says they transferred. Unverified by definition — the
    // owner reconciles it against the bank account before releasing the car,
    // which is what the ACTION banner in their email exists to prompt.
    const weeklyRent = money(get("weeklyRent"))
    const bondAmount = money(get("bondAmount"))
    const totalAmount = money(get("totalAmount"))

    const attachments = (
      await Promise.all([
        toAttachment(fd.get("licenceFront"), `licence-front-${lastName || "applicant"}`),
        toAttachment(fd.get("licenceBack"), `licence-back-${lastName || "applicant"}`),
      ])
    ).filter((a): a is EmailAttachment => a !== null)

    const ownerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#7f85f7;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🚗 New Rental Application</h1>
          <p style="color:#c5c8fd;margin:4px 0 0">Pak Oz Rentals</p>
        </div>
        <div style="padding:28px">
          <div style="background:#fff3cd;border-left:4px solid #f0ad4e;padding:14px;border-radius:0 8px 8px 0;margin-bottom:20px">
            <strong style="color:#856404">⚠️ Call within 2 hours:</strong>
            <span style="color:#856404">${esc(firstName)} ${esc(lastName)} — ${esc(phoneLabel)}</span>
          </div>

          <h3 style="color:#1a1a2e;margin:0 0 12px">Vehicle Requested</h3>
          <div style="background:#eeedfe;border-radius:8px;padding:12px;margin-bottom:20px">
            <p style="font-weight:bold;color:#534ab7;margin:0">
              ${esc(vehicleName)} (${esc(vehicleRego)})
            </p>
            <p style="color:#534ab7;font-size:13px;margin:6px 0 0">
              ${weeklyLabel ? esc(weeklyLabel) : "No weekly rate published — set one in the dashboard"}
              ${bondLabel ? ` · ${esc(bondLabel)} bond` : ""}
            </p>
          </div>

          <h3 style="color:#1a1a2e;margin:0 0 12px">Applicant Details</h3>
          <table style="width:100%;border-collapse:collapse">
            ${row("Full Name", `${esc(firstName)} ${esc(lastName)}`)}
            ${row("Mobile", esc(phoneLabel))}
            ${row("Email", esc(emailLabel))}
            ${row("Licence No.", esc(licenceLabel))}
            ${row("Date of Birth", esc(dob))}
            ${row("Address", esc(address))}
          </table>

          <div style="background:#1a1a2e;border-radius:12px;padding:20px;margin-top:20px">
            <h3 style="color:#7f85f7;margin:0 0 12px;font-size:15px">💰 Payment Claimed</h3>
            <table style="width:100%">
              ${[
                ["Vehicle", `${esc(vehicleName)} (${esc(vehicleRego)})`],
                ["Weekly Rent", weeklyRent],
                ["Bond (2 weeks)", bondAmount],
                ["Total Transferred", totalAmount],
                ["Reference", esc(vehicleRego)],
                ["Payment Method", esc(paymentMethod)],
              ]
                .map(
                  ([k, val]) => `
                <tr>
                  <td style="color:#9496a8;font-size:12px;padding:6px 0;width:40%">${k}</td>
                  <td style="color:white;font-weight:bold;font-size:13px;padding:6px 0">${val}</td>
                </tr>`
                )
                .join("")}
            </table>
            <div style="background:#f5a623;border-radius:8px;padding:12px;margin-top:12px">
              <p style="margin:0;color:#1a1a2e;font-weight:bold;font-size:13px">
                ⚠️ ACTION: Check ${BANK_NAME} account for transfer with reference
                ${esc(vehicleRego)} before confirming rental to customer.
              </p>
            </div>
          </div>

          <p style="color:#666;font-size:12px;margin-top:16px">
            ${
              attachments.length
                ? `Driving licence photos attached (${attachments.length}).`
                : "No driving licence photos were attached — ask the applicant to email them."
            }
          </p>

          <div style="margin-top:20px;padding:14px;background:#f0f4ff;border-radius:8px">
            <p style="margin:0;color:#534ab7;font-size:13px">
              <strong>Next steps:</strong> Confirm the transfer has landed, call
              ${esc(firstName)} on ${esc(phoneLabel)} to confirm the vehicle and
              weekly rate, and arrange pickup in Brisbane.
            </p>
          </div>
        </div>
      </div>`

    const termRows = [
      ["Payment", "Weekly in advance"],
      ["Minimum period", "4 weeks"],
      ["Security bond", "Refunded at end of rental"],
      ["Insurance excess", "$1,300 AUD"],
      ["Road assistance", "Included"],
      ["Maintenance", "Included"],
    ]
      .map(
        ([k, v]) => `
        <tr>
          <td style="padding:8px 12px;font-size:13px;color:#666;border-bottom:1px solid #eee">${k}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1a1a2e;border-bottom:1px solid #eee">${v}</td>
        </tr>`
      )
      .join("")

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#7f85f7;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">Your Rental Application</h1>
          <p style="color:#c5c8fd;margin:4px 0 0">Pak Oz Rentals · Brisbane</p>
        </div>
        <div style="padding:28px">
          <p style="color:#1a1a2e;font-size:15px">Hi <strong>${esc(firstName)}</strong>,</p>
          <p style="color:#555;font-size:14px;line-height:1.7">
            Thank you for your rental application. We have received your details
            and will call you within <strong>2 hours</strong> to confirm
            availability and weekly pricing for your requested vehicle.
          </p>

          <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:20px 0">
            <p style="font-size:12px;color:#9496a8;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px">
              Vehicle Requested
            </p>
            <p style="font-weight:700;font-size:16px;color:#1a1a2e;margin:0">${esc(vehicleName)}</p>
            <p style="font-size:12px;color:#9496a8;margin:4px 0 0">Rego: ${esc(vehicleRego)}</p>
            ${
              weeklyLabel
                ? `<p style="font-weight:700;font-size:15px;color:#7f85f7;margin:10px 0 0">${esc(weeklyLabel)}${
                    bondLabel
                      ? `<span style="font-weight:400;font-size:12px;color:#9496a8"> · ${esc(bondLabel)} bond</span>`
                      : ""
                  }</p>`
                : ""
            }
          </div>

          <h3 style="color:#1a1a2e;font-size:15px;margin:20px 0 12px">Rental Terms Summary</h3>
          <table style="width:100%;border-collapse:collapse">${termRows}</table>

          <div style="background:#1a1a2e;border-radius:12px;padding:20px;margin:20px 0">
            <h3 style="color:white;margin:0 0 12px;font-size:15px">🏦 Payment Details</h3>
            <table style="width:100%">
              <tr>
                <td style="color:#9496a8;font-size:12px;padding:6px 0;width:40%">Bank</td>
                <td style="color:white;font-weight:bold;font-size:13px;padding:6px 0">${BANK_NAME}</td>
              </tr>
              <tr>
                <td style="color:#9496a8;font-size:12px;padding:6px 0">BSB</td>
                <td style="color:#7f85f7;font-weight:bold;font-size:16px;padding:6px 0">${BANK_BSB}</td>
              </tr>
              <tr>
                <td style="color:#9496a8;font-size:12px;padding:6px 0">Account</td>
                <td style="color:#7f85f7;font-weight:bold;font-size:16px;padding:6px 0">${BANK_ACCOUNT}</td>
              </tr>
              <tr>
                <td style="color:#9496a8;font-size:12px;padding:6px 0">PayID</td>
                <td style="color:#5dcaa5;font-weight:bold;font-size:16px;padding:6px 0">${BANK_PAYID}</td>
              </tr>
              <tr>
                <td style="color:#f5a623;font-size:12px;padding:6px 0;font-weight:bold">Your Reference ⚠️</td>
                <td style="color:#f5a623;font-weight:bold;font-size:18px;padding:6px 0">${esc(vehicleRego)}</td>
              </tr>
            </table>
          </div>

          <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
            <p style="margin:0;color:#856404;font-size:13px;line-height:1.6">
              <strong>Weekly payments:</strong>
              After your first payment your rent will be due every week in
              advance. We will remind you before each payment is due.<br/><br/>
              <strong>Bond refund:</strong>
              Your security bond will be refunded in full within 5 business days
              of returning the vehicle in good condition.
            </p>
          </div>

          <div style="margin-top:24px;padding:14px;background:#e1f5ee;border-radius:8px">
            <p style="margin:0;color:#085041;font-size:13px">
              <strong>What happens next:</strong><br/>
              We verify your transfer, then call you on ${esc(phoneClean)} within
              2 hours to arrange a vehicle inspection and complete the rental
              agreement.
            </p>
          </div>

          <p style="margin-top:20px;color:#666;font-size:13px">
            Questions? Call us:<br/>
            <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong>
          </p>
        </div>
        <div style="background:#f8f8ff;padding:16px;text-align:center;font-size:11px;color:#9496a8">
          Pak Oz Rentals · Brisbane QLD · pakozsolutions.com.au
        </div>
      </div>`

    try {
      await sendEmail(
        SITE_EMAIL,
        `🚗 New Rental Application — ${firstName} ${lastName} — ${vehicleName}`,
        ownerHtml,
        attachments
      )
    } catch (e) {
      console.error("Owner email failed:", e)
    }

    if (email) {
      try {
        await sendEmail(
          email,
          "Your Rental Application — Pak Oz Rentals",
          customerHtml
        )
      } catch (e) {
        console.error("Customer email failed:", e)
      }
    }

    try {
      await appendLead({
        id: Date.now().toString(),
        name: `${firstName} ${lastName}`.trim(),
        phone: phoneClean,
        email,
        service: "car-rental",
        message:
          `Rental application — ${vehicleName} (${vehicleRego})` +
          `${weeklyLabel ? ` at ${weeklyLabel}` : ""}. ` +
          `Licence ${licenceLabel || "not supplied"}, DOB ${dob}. ` +
          `Payment: ${paymentMethod} — claims ${totalAmount} transferred ` +
          `(rent ${weeklyRent} + bond ${bondAmount}), reference ${vehicleRego}.`,
        date: new Date().toISOString(),
        status: "New",
        page: "/services/car-rental",
        source: "quote_form",
      })
    } catch (e) {
      console.error("Lead save failed:", e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Rental API error:", err)
    // Still report success to the applicant: the owner is notified by email and
    // a hard failure here would only lose the enquiry.
    return NextResponse.json({ success: true })
  }
}
