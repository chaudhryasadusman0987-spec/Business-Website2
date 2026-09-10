import Stripe from "stripe"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { getRentalAgreement, markRentalAgreementReturned } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { agreementId, returnDate, lastPaymentAmount, lastPaymentDate } = await req.json()

    if (!agreementId || !returnDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const agreement = await getRentalAgreement(agreementId)
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 })
    }

    // Constructed per-request — see create-intent/route.ts for why.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-07-29.dahlia",
    })

    if (agreement.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(agreement.stripeSubscriptionId)
      } catch (e) {
        console.error("Subscription cancel error:", e)
      }
    }

    // Detach the payment method entirely — removes the saved card/bank details.
    if (agreement.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(agreement.stripePaymentMethodId)
      } catch (e) {
        console.error("Detach payment method error:", e)
      }
    }

    // Pro-rate: days used in the current paid week vs 7 days.
    const amount = Number(lastPaymentAmount) || agreement.agreedWeeklyRate
    const paidFrom = lastPaymentDate ? new Date(lastPaymentDate) : new Date(agreement.startDate)
    const returned = new Date(returnDate)
    const daysUsed = Math.max(
      1,
      Math.ceil((returned.getTime() - paidFrom.getTime()) / (1000 * 60 * 60 * 24))
    )
    const dailyRate = amount / 7
    const owedForDaysUsed = Math.round(dailyRate * Math.min(daysUsed, 7) * 100) / 100
    const refundAmount = Math.max(0, Math.round((amount - owedForDaysUsed) * 100) / 100)

    try {
      await markRentalAgreementReturned(agreementId, returnDate)
    } catch (e) {
      console.error("Agreement return save error:", e)
    }

    try {
      await sendEmail(
        agreement.customerEmail,
        `Vehicle returned — thank you! — Pak Oz Rentals`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">Thanks for renting with us!</h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${agreement.customerName.split(" ")[0]},</p>
            <p>We've confirmed the return of ${agreement.vehicleName}
              (${agreement.vehicleRego}). Your weekly billing has been
              cancelled and your card/bank details removed from our system.</p>
            <div style="background:#f8f8f8;border-radius:10px;padding:16px;margin:16px 0">
              <p style="margin:0;font-size:13px;color:#666">Days used this week</p>
              <p style="margin:2px 0;font-size:16px;font-weight:bold">${daysUsed} of 7 days</p>
              ${
                refundAmount > 0
                  ? `<p style="margin:10px 0 0;font-size:13px;color:#666">Refund owed</p>
                    <p style="margin:2px 0;font-size:20px;font-weight:bold;color:#0f6e56">
                      $${refundAmount.toFixed(2)}
                    </p>
                    <p style="font-size:12px;color:#666">
                      This will be refunded to your original payment method
                      within 5-10 business days.
                    </p>`
                  : ""
              }
            </div>
            <p>Thanks again, and we hope to see you again soon!</p>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Return email error:", e)
    }

    return NextResponse.json({ success: true, daysUsed, owedForDaysUsed, refundAmount })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Return vehicle error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
