import Stripe from "stripe"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { insertActiveRental } from "@/lib/db"
import { SITE_EMAIL, SITE_PHONE } from "@/data/site"

export const runtime = "nodejs"

export async function POST(req: Request) {
  // Constructed per-request rather than at module scope: Next.js evaluates
  // route modules during the build's page-data collection, and the Stripe
  // SDK throws immediately if no key is configured yet.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-07-29.dahlia",
  })

  const body = await req.text()
  const sig = req.headers.get("stripe-signature") || ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook sig failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const meta = (event.data.object as Stripe.PaymentIntent).metadata || {}

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent

    try {
      await sendEmail(
        SITE_EMAIL,
        `✅ PAYMENT RECEIVED — ${meta.vehicleName} — ${meta.customerName}`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0">✅ Payment Received</h1>
          </div>
          <div style="padding:24px">
            <h3 style="color:#0f6e56">$${(pi.amount / 100).toFixed(2)} AUD received</h3>
            <table style="width:100%;border-collapse:collapse">
              ${[
                ["Customer", meta.customerName],
                ["Email", meta.customerEmail],
                ["Phone", meta.customerPhone],
                ["Vehicle", meta.vehicleName],
                ["Rego", meta.vehicleRego],
                ["Weekly Rent", `$${meta.weeklyRent}`],
                ["Bond (2 weeks)", `$${meta.bondAmount}`],
                ["Total Charged", `$${meta.totalCharged}`],
                ["Stripe ID", pi.id],
              ]
                .map(
                  ([k, v]) => `
                <tr>
                  <td style="padding:8px;background:#f8f8f8;font-size:12px;font-weight:bold;color:#666;width:35%;border-bottom:1px solid #eee">${k}</td>
                  <td style="padding:8px;font-size:14px;color:#1a1a2e;border-bottom:1px solid #eee">${v}</td>
                </tr>`
                )
                .join("")}
            </table>
            ${
              meta.bondPaidOnline === "true"
                ? `<div style="background:#e1f5ee;border-radius:8px;padding:12px;margin-top:12px">
                    <p style="margin:0;color:#085041;font-size:13px;font-weight:bold">
                      ✅ Bond paid online — no bond collection needed at pickup.
                    </p>
                  </div>`
                : `<div style="background:#fff3cd;border-radius:8px;padding:12px;margin-top:12px">
                    <p style="margin:0;color:#856404;font-size:13px;font-weight:bold">
                      ⚠️ Bond NOT paid online — collect $${(Number(meta.weeklyRent) * 2).toFixed(2)} bond in person at vehicle pickup.
                    </p>
                  </div>`
            }
            <div style="background:#e1f5ee;border-radius:8px;padding:14px;margin-top:16px">
              <p style="margin:0;color:#085041;font-weight:bold">
                Next: Call ${meta.customerName} on ${meta.customerPhone} to arrange vehicle pickup.
              </p>
            </div>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Admin email:", e)
    }

    try {
      await sendEmail(
        meta.customerEmail,
        `✅ Payment Confirmed — Pak Oz Rentals`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0">Payment Confirmed ✅</h1>
            <p style="color:#a8e6cf;margin:4px 0 0">Pak Oz Rentals · Brisbane</p>
          </div>
          <div style="padding:24px">
            <p>Hi ${(meta.customerName || "").split(" ")[0]},</p>
            <p>Your payment has been received. We will contact you within 2 hours to arrange vehicle pickup.</p>
            <div style="background:#f8f8f8;border-radius:12px;padding:16px;margin:16px 0">
              <h3 style="color:#1a1a2e;margin:0 0 12px">Payment Summary</h3>
              <table style="width:100%">
                ${[
                  ["Vehicle", meta.vehicleName],
                  ["Registration", meta.vehicleRego],
                  ["Weekly Rent", `$${meta.weeklyRent}/week`],
                  ["Security Bond", `$${meta.bondAmount} (2 weeks, refundable)`],
                  ["Total Charged", `$${meta.totalCharged} AUD`],
                ]
                  .map(
                    ([k, v]) => `
                  <tr>
                    <td style="padding:7px 0;font-size:13px;color:#666;width:45%">${k}</td>
                    <td style="padding:7px 0;font-size:13px;font-weight:600;color:#1a1a2e">${v}</td>
                  </tr>`
                  )
                  .join("")}
              </table>
            </div>
            ${
              meta.bondPaidOnline === "true"
                ? `<div style="background:#e1f5ee;border-radius:8px;padding:14px;margin:16px 0">
                    <p style="margin:0;color:#085041;font-size:13px">
                      <strong>Bond:</strong> Your security bond has been paid and will be refunded in full at the end of your rental, provided no damage occurs.
                    </p>
                  </div>`
                : `<div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                    <p style="margin:0;color:#856404;font-size:13px">
                      <strong>Bond due at pickup:</strong> Please bring $${(Number(meta.weeklyRent) * 2).toFixed(2)} for the security bond when you collect your vehicle. This is fully refundable at the end of your rental.
                    </p>
                  </div>`
            }
            <p style="color:#666;font-size:13px">
              Questions? Call us:<br/>
              <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong>
            </p>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Customer email:", e)
    }

    try {
      await appendLead({
        id: pi.id,
        name: meta.customerName || "",
        phone: meta.customerPhone || "",
        email: meta.customerEmail || "",
        service: "car-rental",
        message: `${meta.vehicleName} (${meta.vehicleRego}) — $${meta.totalCharged} received by card`,
        date: new Date().toISOString(),
        status: "Won",
        page: "/services/car-rental",
        source: "quote_form",
      })
    } catch (e) {
      console.error("Lead save:", e)
    }

    try {
      await insertActiveRental({
        id: pi.id,
        vehicleId: meta.vehicleId || "",
        vehicleName: meta.vehicleName || "",
        vehicleRego: meta.vehicleRego || "",
        customerName: meta.customerName || "",
        customerEmail: meta.customerEmail || "",
        customerPhone: meta.customerPhone || "",
        weeklyRent: Number(meta.weeklyRent) || 0,
      })
    } catch (e) {
      console.error("Active rental save error:", e)
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent
    const reason = pi.last_payment_error?.message || "Payment declined"

    try {
      await sendEmail(
        SITE_EMAIL,
        `❌ PAYMENT FAILED — ${meta.vehicleName} — ${meta.customerName}`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#c62828;padding:20px;text-align:center">
            <h1 style="color:white;margin:0">❌ Payment Failed</h1>
          </div>
          <div style="padding:24px">
            <p><strong>Customer:</strong> ${meta.customerName}</p>
            <p><strong>Email:</strong> ${meta.customerEmail}</p>
            <p><strong>Phone:</strong> ${meta.customerPhone}</p>
            <p><strong>Vehicle:</strong> ${meta.vehicleName} (${meta.vehicleRego})</p>
            <p><strong>Amount:</strong> $${meta.totalCharged}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Admin fail email:", e)
    }

    try {
      await sendEmail(
        meta.customerEmail,
        `Payment unsuccessful — Pak Oz Rentals`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#c62828;padding:20px;text-align:center">
            <h1 style="color:white;margin:0">Payment Unsuccessful</h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${(meta.customerName || "").split(" ")[0]},</p>
            <p>Unfortunately your payment of $${meta.totalCharged} could not be processed.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <div style="background:#f8f8f8;border-radius:12px;padding:16px;margin:16px 0">
              <p style="font-size:14px;color:#444;margin:0 0 10px">You can pay via direct bank transfer instead:</p>
              <table style="width:100%">
                ${[
                  ["Bank", "Westpac"],
                  ["Account Name", "Pak Oz Solutions Pty Ltd"],
                  ["BSB", "034-076"],
                  ["Account", "841442"],
                  ["PayID", "0424948512"],
                  ["Amount", `$${meta.totalCharged} AUD`],
                  ["Reference", meta.vehicleRego],
                ]
                  .map(
                    ([k, v]) => `
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#666;width:40%">${k}</td>
                    <td style="padding:6px 0;font-size:13px;font-weight:700;color:#1a1a2e">${v}</td>
                  </tr>`
                  )
                  .join("")}
              </table>
            </div>
            <p style="color:#666;font-size:13px">
              Call us for help:<br/>
              <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong>
            </p>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Customer fail email:", e)
    }
  }

  return NextResponse.json({ received: true })
}
