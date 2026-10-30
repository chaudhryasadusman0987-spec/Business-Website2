import { NextResponse } from "next/server"
import { sendRentalEmail } from "@/lib/rental-mail"
import { escapeHtml as esc } from "@/lib/html"
import {
  getRentalAgreement,
  getRentalEvidence,
  getRentalFile,
  markRentalAgreementReturned,
  upsertRentalEvidence,
} from "@/lib/db"
import { parseChecklist } from "@/lib/rental-checklist"
import { generateReturnConfirmationPdf } from "@/lib/rental-evidence-pdf"
import { stripeClient } from "@/lib/stripe-server"

export const runtime = "nodejs"

// Admin-only (middleware). Records the return checklist, ends weekly billing,
// and emails the customer a PDF return confirmation — which doubles as
// dispute evidence of when the rental ended and what was still owed.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { agreementId, lastPaymentAmount, lastPaymentDate } = body

    if (!agreementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const agreement = await getRentalAgreement(agreementId)
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 })
    }

    // Validate the checklist before touching Stripe, so a missing signature
    // doesn't leave billing cancelled with no return record.
    const parsed = await parseChecklist(agreement.id, "return", body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const returnRecord = await upsertRentalEvidence(parsed.value)
    const returnDate = returnRecord.recordedAt

    const stripe = stripeClient()

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

    let emailed = false
    try {
      const pickupRecord = (await getRentalEvidence(agreement.id)).find((e) => e.kind === "pickup") ?? null
      const signature = returnRecord.signatureFileId
        ? await getRentalFile(returnRecord.signatureFileId)
        : null
      const pdf = await generateReturnConfirmationPdf({
        rental: agreement,
        returnRecord,
        pickupRecord,
        signature,
        daysUsed,
        refundAmount,
      })
      const owed = returnRecord.amountOwed ?? 0

      await sendRentalEmail(
        agreement.id,
        "return_confirmation",
        agreement.customerEmail,
        `Vehicle returned — confirmation — Pak Oz Rentals`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">Thanks for renting with us!</h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${esc(agreement.customerName.split(" ")[0])},</p>
            <p>We've confirmed the return of ${esc(agreement.vehicleName)}
              (${esc(agreement.vehicleRego)}) on
              ${esc(returned.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }))}.
              Your weekly billing has been cancelled and your card/bank details
              removed from our system. Your return confirmation is attached.</p>
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
              ${
                owed > 0
                  ? `<p style="margin:10px 0 0;font-size:13px;color:#666">Amount still owed</p>
                    <p style="margin:2px 0;font-size:20px;font-weight:bold;color:#c62828">
                      $${owed.toFixed(2)}
                    </p>`
                  : ""
              }
            </div>
            <p>Thanks again, and we hope to see you again soon!</p>
          </div>
        </div>`,
        [
          {
            filename: `Pak-Oz-Rentals-Return-${agreement.vehicleRego}.pdf`,
            content: Buffer.from(pdf),
            contentType: "application/pdf",
          },
        ],
      )
      emailed = true
    } catch (e) {
      console.error("Return email error:", e)
    }

    return NextResponse.json({ success: true, daysUsed, owedForDaysUsed, refundAmount, emailed })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Return vehicle error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
