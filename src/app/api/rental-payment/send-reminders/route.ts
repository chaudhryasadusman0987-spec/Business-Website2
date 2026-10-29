import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import {
  getRentalsDueForReminder,
  getStripeRentalsForReminder,
  markReminderSent,
  markRentalReminderPeriod,
} from "@/lib/db"
import { sendRentalEmail } from "@/lib/rental-mail"
import { escapeHtml as esc } from "@/lib/html"
import { RENTAL_STATEMENT_SUFFIX, stripeClient } from "@/lib/stripe-server"
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
  // An unset CRON_SECRET must not turn "Bearer undefined" into a valid key.
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    const chargeRemindersSent = await sendStripeChargeReminders()

    return NextResponse.json({
      success: true,
      remindersSent: sentCount,
      chargeRemindersSent,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Reminder job error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// The cron runs once a day, so "2 days before" means the charge falls between
// 36 and 60 hours from now — each upcoming charge lands in exactly one run.
const REMIND_FROM_MS = 36 * 3600_000
const REMIND_TO_MS = 60 * 3600_000

/**
 * Stripe-billed rentals: a heads-up 2 days before each automatic weekly
 * charge. Customers who know a charge is coming don't dispute it as
 * unrecognised. reminder_period_end stops a period being reminded twice.
 */
async function sendStripeChargeReminders(): Promise<number> {
  if (!process.env.STRIPE_SECRET_KEY) return 0
  const stripe = stripeClient()
  let sent = 0
  for (const rental of await getStripeRentalsForReminder()) {
    try {
      const sub = await stripe.subscriptions.retrieve(rental.stripeSubscriptionId!)
      if (sub.status !== "active" || sub.cancel_at_period_end) continue
      const nextCharge = sub.items.data[0]?.current_period_end
      if (!nextCharge || rental.reminderPeriodEnd === nextCharge) continue
      const msUntil = nextCharge * 1000 - Date.now()
      if (msUntil < REMIND_FROM_MS || msUntil > REMIND_TO_MS) continue

      const when = new Date(nextCharge * 1000).toLocaleDateString("en-AU", {
        timeZone: "Australia/Brisbane",
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      const method =
        rental.paymentMethod === "au_becs_debit"
          ? `bank account ending ${rental.cardLast4 ?? ""}`
          : `card ending ${rental.cardLast4 ?? ""}`
      const subject = `Upcoming charge: $${rental.agreedWeeklyRate.toFixed(2)} on ${when} — Pak Oz Rentals`
      await sendRentalEmail(
        rental.id,
        "charge_reminder",
        rental.customerEmail,
        subject,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#7f85f7;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">🔔 Weekly Rent — Charge in 2 Days</h1>
            <p style="color:#c5c8fd;margin:4px 0 0">Pak Oz Rentals</p>
          </div>
          <div style="padding:24px">
            <p>Hi ${esc(rental.customerName.split(" ")[0])},</p>
            <p>Just a heads-up: your weekly rent for <strong>${esc(rental.vehicleName)}</strong>
              (${esc(rental.vehicleRego)}) will be charged automatically on
              <strong>${when}</strong>.</p>
            <div style="background:#f8f8ff;border-radius:12px;padding:16px;margin:16px 0">
              <p style="font-size:13px;color:#666;margin:0 0 8px">Amount</p>
              <p style="font-size:24px;font-weight:bold;color:#7f85f7;margin:0">
                $${rental.agreedWeeklyRate.toFixed(2)} AUD
              </p>
              <p style="font-size:12px;color:#666;margin:8px 0 0">
                From your ${esc(method)} · appears on your statement as
                <strong>${RENTAL_STATEMENT_SUFFIX}</strong>
              </p>
            </div>
            <p style="font-size:13px;color:#666">No action needed. You'll get a receipt once it's paid.
              Charges continue weekly until the vehicle is returned.</p>
            <p style="color:#666;font-size:13px">Questions? Call us:<br/>
              <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong></p>
          </div>
        </div>`,
      )
      await markRentalReminderPeriod(rental.id, nextCharge)
      sent++
    } catch (e) {
      console.error("Charge reminder failed for", rental.id, e)
    }
  }
  return sent
}
