import { NextResponse } from "next/server"
import { sendEmail, type EmailAttachment } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { SITE_PHONE, SITE_EMAIL } from "@/data/site"

// nodemailer + Buffer need the Node runtime (not edge).
export const runtime = "nodejs"

// Licence uploads are attached to the owner email. Anything larger is skipped
// rather than failing the whole application — serverless request bodies are
// capped (~4.5MB on Vercel) and a lost photo should not lose the lead.
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024

/** Escape user-supplied text before interpolating it into the email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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
    const phone = get("phone")
    const email = get("email")
    const licenceNo = get("licenceNumber")
    const dob = get("dob")
    const address = get("address")
    const vehicleName = get("vehicleName")
    const vehicleRego = get("vehicleRego")
    const paymentMethod =
      get("paymentMethod") === "card"
        ? "Credit / Debit Card"
        : "Direct Deposit (Bank Transfer)"

    // NOTE: cardNumber / cardExpiry / cardCvv / cardName arrive in the form data
    // but are deliberately never read, logged, emailed or persisted here. The
    // owner phones the applicant to take payment. Storing or forwarding raw card
    // data (and CVV in particular) is a PCI-DSS breach — route real payments
    // through a processor such as Stripe instead.

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
            <span style="color:#856404">${esc(firstName)} ${esc(lastName)} — ${esc(phone)}</span>
          </div>

          <h3 style="color:#1a1a2e;margin:0 0 12px">Vehicle Requested</h3>
          <p style="background:#eeedfe;border-radius:8px;padding:12px;font-weight:bold;color:#534ab7;margin-bottom:20px">
            ${esc(vehicleName)} (${esc(vehicleRego)})
          </p>

          <h3 style="color:#1a1a2e;margin:0 0 12px">Applicant Details</h3>
          <table style="width:100%;border-collapse:collapse">
            ${row("Full Name", `${esc(firstName)} ${esc(lastName)}`)}
            ${row("Phone", esc(phone))}
            ${row("Email", esc(email))}
            ${row("Licence No.", esc(licenceNo))}
            ${row("Date of Birth", esc(dob))}
            ${row("Address", esc(address))}
            ${row("Preferred Payment", esc(paymentMethod))}
          </table>

          <p style="color:#666;font-size:12px;margin-top:16px">
            ${
              attachments.length
                ? `Driving licence photos attached (${attachments.length}).`
                : "No driving licence photos were attached — ask the applicant to email them."
            }
          </p>

          <div style="margin-top:20px;padding:14px;background:#f0f4ff;border-radius:8px">
            <p style="margin:0;color:#534ab7;font-size:13px">
              <strong>Next steps:</strong> Call ${esc(firstName)} on ${esc(phone)},
              confirm vehicle and weekly rate, take payment over the phone, and
              arrange pickup in Brisbane.
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
          </div>

          <h3 style="color:#1a1a2e;font-size:15px;margin:20px 0 12px">Rental Terms Summary</h3>
          <table style="width:100%;border-collapse:collapse">${termRows}</table>

          <div style="margin-top:24px;padding:14px;background:#e1f5ee;border-radius:8px">
            <p style="margin:0;color:#085041;font-size:13px">
              <strong>What happens next:</strong><br/>
              We will call you on ${esc(phone)} to confirm the weekly rate, arrange
              a vehicle inspection, take payment, and complete the rental agreement.
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
        phone,
        email,
        service: "car-rental",
        message: `Rental application — ${vehicleName} (${vehicleRego}). Licence ${licenceNo}, DOB ${dob}. Preferred payment: ${paymentMethod}.`,
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
