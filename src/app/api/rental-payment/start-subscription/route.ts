import Stripe from "stripe"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { sendRentalEmail } from "@/lib/rental-mail"
import { appendLead } from "@/lib/leads-store"
import {
  activatePendingRental,
  getRentalAgreement,
  isTrustedRenter,
  listRentalFiles,
} from "@/lib/db"
import { SITE_EMAIL, SITE_PHONE } from "@/data/site"
import { escapeHtml as esc } from "@/lib/html"
import { RENTAL_STATEMENT_SUFFIX, stripeClient } from "@/lib/stripe-server"
import { compareNames } from "@/lib/rental-name-check"

export const runtime = "nodejs"

// Step 3 of the card / BECS checkout, after the customer has accepted the
// terms and confirmed their card (with 3D Secure) or bank account. Everything
// it charges comes from the pending rental row written by create-setup; the
// browser only says which application and which SetupIntent.
export async function POST(req: Request) {
  try {
    const stripe = stripeClient()
    const { rentalId, setupIntentId } = await req.json()

    const rental = rentalId ? await getRentalAgreement(String(rentalId)) : null
    if (!rental || rental.status !== "pending_payment" || !rental.stripeCustomerId) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }
    if (!rental.termsAcceptedAt) {
      return NextResponse.json(
        { error: "Please agree to the weekly charges before paying." },
        { status: 400 },
      )
    }
    const files = await listRentalFiles(rental.id)
    if (!files.some((f) => f.kind === "licence_front") || !files.some((f) => f.kind === "licence_back")) {
      return NextResponse.json(
        { error: "Please upload the front and back of your driving licence." },
        { status: 400 },
      )
    }

    // The SetupIntent must be the one issued for this application, and must
    // have completed — otherwise anyone could attach someone else's card.
    if (!setupIntentId || setupIntentId !== rental.setupIntentId) {
      return NextResponse.json({ error: "Payment setup mismatch." }, { status: 400 })
    }
    const setupIntent = await stripe.setupIntents.retrieve(String(setupIntentId), {
      expand: ["latest_attempt", "payment_method"],
    })
    if (setupIntent.customer !== rental.stripeCustomerId || setupIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment details were not confirmed." }, { status: 400 })
    }
    const paymentMethod = setupIntent.payment_method as Stripe.PaymentMethod | null
    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment details were not confirmed." }, { status: 400 })
    }
    const isBecs = paymentMethod.type === "au_becs_debit"

    // BECS disputes cannot be contested — trusted renters only, and never
    // without at least one week's bond held.
    if (isBecs) {
      if (process.env.STRIPE_BECS_ENABLED !== "true" || !(await isTrustedRenter(rental.customerEmail))) {
        return NextResponse.json(
          { error: "Direct debit isn't available for this booking — please pay by card." },
          { status: 400 },
        )
      }
      if (rental.bondWeeks < 1) {
        return NextResponse.json(
          { error: "Direct debit requires a bond of at least 1 week." },
          { status: 400 },
        )
      }
    }

    const attempt =
      setupIntent.latest_attempt && typeof setupIntent.latest_attempt !== "string"
        ? setupIntent.latest_attempt
        : null
    const threeDs = attempt?.payment_method_details?.card?.three_d_secure ?? null
    const cardholderName = paymentMethod.billing_details?.name ?? null
    const nameCheck = compareNames(rental.customerName, cardholderName)

    await stripe.customers.update(rental.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    })

    const weeklyRate = rental.agreedWeeklyRate
    const label = `${rental.vehicleName} (${rental.vehicleRego})`
    const metadata = {
      rentalId: rental.id,
      vehicleId: rental.vehicleId,
      vehicleName: rental.vehicleName,
      vehicleRego: rental.vehicleRego,
      customerName: rental.customerName,
      customerEmail: rental.customerEmail,
      customerPhone: rental.customerPhone,
    }

    // Weekly recurring price, created on the fly for this vehicle/rate. The
    // product's statement descriptor is what Stripe appends after the
    // account's prefix on each weekly card charge, so the customer sees
    // "PAKOZ RENTAL" rather than an unfamiliar name and disputes it.
    const price = await stripe.prices.create({
      unit_amount: Math.round(weeklyRate * 100),
      currency: "aud",
      recurring: { interval: "week" },
      product_data: {
        name: `Weekly rent — ${label}`,
        statement_descriptor: RENTAL_STATEMENT_SUFFIX,
      },
    })

    const subscription = await stripe.subscriptions.create({
      customer: rental.stripeCustomerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethod.id,
      metadata,
    })

    // A card declined on the first week leaves the subscription "incomplete".
    // BECS is legitimately incomplete while the debit clears, so only cards
    // are checked here.
    if (!isBecs && subscription.status === "incomplete") {
      await stripe.subscriptions.cancel(subscription.id).catch(() => {})
      return NextResponse.json(
        { error: "Your bank declined the first weekly payment. Please try another card." },
        { status: 402 },
      )
    }

    // One-time bond charge if the customer chose one. Metadata mirrors
    // create-intent/route.ts's shape (plus paymentType/bondWeeks/subscriptionId)
    // so the webhook can render a correct confirmation email for it.
    if (rental.bondWeeks > 0 && rental.bondAmount > 0) {
      try {
        await stripe.paymentIntents.create({
          amount: Math.round(rental.bondAmount * 100),
          currency: "aud",
          customer: rental.stripeCustomerId,
          payment_method: paymentMethod.id,
          payment_method_types: [paymentMethod.type],
          off_session: true,
          confirm: true,
          receipt_email: rental.customerEmail,
          ...(isBecs
            ? typeof setupIntent.mandate === "string"
              ? { mandate: setupIntent.mandate }
              : {}
            : { statement_descriptor_suffix: RENTAL_STATEMENT_SUFFIX }),
          description: `Security bond (${rental.bondWeeks} week${rental.bondWeeks > 1 ? "s" : ""}) — ${label}`,
          metadata: {
            ...metadata,
            paymentType: "bond",
            weeklyRent: String(weeklyRate),
            bondAmount: String(rental.bondAmount),
            bondWeeks: String(rental.bondWeeks),
            totalCharged: String(rental.bondAmount),
            bondPaidOnline: "true",
            subscriptionId: subscription.id,
          },
        })
      } catch (e) {
        // No bond, no car: undo the weekly billing rather than leave a
        // subscription running for a booking that never completed.
        await stripe.subscriptions.cancel(subscription.id).catch(() => {})
        const message = e instanceof Error ? e.message : "Bond payment failed"
        return NextResponse.json({ error: `Bond payment failed: ${message}` }, { status: 402 })
      }
    }

    try {
      await activatePendingRental(rental.id, {
        paymentMethod: paymentMethod.type,
        stripeSubscriptionId: subscription.id,
        stripePaymentMethodId: paymentMethod.id,
        threeDsResult: isBecs ? "not_applicable" : threeDs?.result ?? "none",
        threeDsVersion: threeDs?.version ?? null,
        threeDsFlow: threeDs?.authentication_flow ?? null,
        cardholderName,
        nameCheck,
        cardBrand: paymentMethod.card?.brand ?? (isBecs ? "becs" : null),
        cardLast4: paymentMethod.card?.last4 ?? paymentMethod.au_becs_debit?.last4 ?? null,
      })
    } catch (e) {
      console.error(
        "CRITICAL: rental activation failed — this rental will NOT appear in Active Rentals:",
        rental.id,
        e,
      )
    }

    const firstName = rental.customerName.split(" ")[0]
    const methodLabel = isBecs ? "Direct debit (BECS)" : "Card"

    try {
      await sendEmail(
        SITE_EMAIL,
        `🚗 Rental started — ${rental.vehicleName} — ${rental.customerName}${nameCheck === "mismatch" ? " — ⚠️ NAME MISMATCH" : ""}`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">✅ Weekly Rental Started</h1>
          </div>
          <div style="padding:24px">
            ${
              nameCheck === "mismatch"
                ? `<div style="background:#fdecea;border-left:4px solid #c62828;padding:12px;margin-bottom:16px">
                    <strong style="color:#c62828">⚠️ Name mismatch – verify before handover.</strong><br/>
                    Licence name: ${esc(rental.customerName)} · Cardholder: ${esc(cardholderName)}
                  </div>`
                : ""
            }
            <p><strong>Customer:</strong> ${esc(rental.customerName)} (${esc(rental.customerPhone)})</p>
            <p><strong>Vehicle:</strong> ${esc(label)}</p>
            <p><strong>Weekly rent:</strong> $${weeklyRate} (auto-charged every week)</p>
            <p><strong>Payment method:</strong> ${methodLabel}${
              isBecs ? "" : ` — 3D Secure: ${esc(threeDs?.result ?? "none")}`
            }</p>
            <p><strong>Bond:</strong> ${
              rental.bondWeeks === 0
                ? "None paid online — collect in person"
                : `$${rental.bondAmount} (${rental.bondWeeks} week${rental.bondWeeks > 1 ? "s" : ""}) — charged`
            }</p>
            <p style="color:#666;font-size:12px">Rental ${rental.id} · Subscription ${subscription.id}</p>
          </div>
        </div>`,
      )
    } catch (e) {
      console.error("Admin notify error:", e)
    }

    // Written confirmation of exactly what the customer agreed to — the first
    // thing a bank asks for in a "not recognised" / "cancelled" dispute.
    const subject = `Your weekly rental is confirmed — ${rental.vehicleName}`
    try {
      await sendRentalEmail(
        rental.id,
        "rental_confirmation",
        rental.customerEmail,
        subject,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">Weekly Rental Confirmed ✅</h1>
            <p style="color:#a8e6cf;margin:4px 0 0">Pak Oz Rentals · Brisbane</p>
          </div>
          <div style="padding:24px">
            <p>Hi ${esc(firstName)},</p>
            <p>Your weekly rental of <strong>${esc(label)}</strong> is set up.
              We'll call you to arrange pickup.</p>
            <div style="background:#f8f8f8;border-radius:10px;padding:16px;margin:16px 0;font-size:13px;color:#333;white-space:pre-line">${esc(rental.termsText)}</div>
            <p style="font-size:13px;color:#666">You agreed to these terms on
              ${new Date(rental.termsAcceptedAt).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}
              (Brisbane time). Payment method: ${methodLabel}${
                paymentMethod.card?.last4 ? ` ending ${paymentMethod.card.last4}` : ""
              }.</p>
            <p style="font-size:13px;color:#666">Each weekly charge appears on your
              statement as <strong>${RENTAL_STATEMENT_SUFFIX}</strong>. We'll email you
              2 days before every charge, and a receipt after it.</p>
            <p style="color:#666;font-size:13px">Questions? Call us:<br/>
              <strong style="color:#7f85f7;font-size:16px">${SITE_PHONE}</strong></p>
          </div>
        </div>`,
      )
    } catch (e) {
      console.error("Customer confirmation email error:", e)
    }

    try {
      await appendLead({
        id: rental.id,
        name: rental.customerName,
        phone: rental.customerPhone,
        email: rental.customerEmail,
        service: "car-rental",
        message: `${label} — $${weeklyRate}/week subscription started`,
        date: new Date().toISOString(),
        status: "Won",
        page: "/services/car-rental",
        source: "quote_form",
      })
    } catch (e) {
      console.error("Lead save error:", e)
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      agreementId: rental.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Start subscription error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
