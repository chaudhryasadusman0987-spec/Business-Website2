import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { getRentalsDueForReminder, markReminderSent } from "@/lib/db"
import {
  SITE_PHONE,
  SITE_FULL,
  BANK_NAME,
  BANK_BSB,
  BANK_ACCOUNT,
  BANK_PAYID,
} from "@/data/site"

export const runtime = "nodejs"

// Manual reminder only — this never charges a card. It emails the customer
// that next week's rent is due and how to pay it (bank transfer or a call).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rentals = await getRentalsDueForReminder()
    let sentCount = 0

    for (const rental of rentals) {
      try {
        await sendEmail(
          rental.customerEmail,
          `Reminder: Next week's rent due — ${SITE_FULL}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#7f85f7;padding:20px;text-align:center">
              <h1 style="color:white;margin:0;font-size:20px">🔔 Weekly Rent Reminder</h1>
              <p style="color:#c5c8fd;margin:4px 0 0">Pak Oz Rentals</p>
            </div>
            <div style="padding:24px">
              <p>Hi ${(rental.customerName || "").split(" ")[0]},</p>
              <p>This is a friendly reminder that your weekly rent for
                <strong>${rental.vehicleName}</strong> (${rental.vehicleRego}) is due.</p>

              <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:16px 0">
                <p style="font-size:13px;color:#666;margin:0 0 8px">Amount due</p>
                <p style="font-size:24px;font-weight:bold;color:#7f85f7;margin:0">
                  $${rental.weeklyRent.toFixed(2)} AUD
                </p>
              </div>

              <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:16px 0">
                <p style="font-size:12px;font-weight:bold;color:#1a1a2e;margin:0 0 10px">
                  Pay by bank transfer:
                </p>
                <table style="width:100%">
                  <tr>
                    <td style="padding:4px 0;font-size:12px;color:#666;width:40%">Bank</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:700;color:#1a1a2e">${BANK_NAME}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:12px;color:#666">BSB</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:700;color:#1a1a2e">${BANK_BSB}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:12px;color:#666">Account</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:700;color:#1a1a2e">${BANK_ACCOUNT}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:12px;color:#666">PayID (ABN)</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:700;color:#1a1a2e">${BANK_PAYID}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-size:12px;color:#666">Reference</td>
                    <td style="padding:4px 0;font-size:13px;font-weight:700;color:#f5a623">${rental.vehicleRego}</td>
                  </tr>
                </table>
              </div>

              <p style="color:#666;font-size:13px">
                Prefer to pay by card instead? Call us:<br/>
                <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong>
              </p>
            </div>
          </div>`
        )

        await markReminderSent(rental.id)
        sentCount++
      } catch (e) {
        console.error("Reminder send failed for", rental.id, e)
      }
    }

    return NextResponse.json({ success: true, remindersSent: sentCount })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Reminder job error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
