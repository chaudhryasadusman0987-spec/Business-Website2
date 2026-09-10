import Stripe from "stripe"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { appendLead } from "@/lib/leads-store"
import { insertRentalAgreement } from "@/lib/db"
import { SITE_EMAIL } from "@/data/site"

export const runtime = "nodejs"

function newAgreementId(): string {
  return `agr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function POST(req: Request) {
  try {
    // Constructed per-request — see create-intent/route.ts for why.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-07-29.dahlia",
    })

    const {
      customerId,
      paymentMethodId,
      vehicleId,
      vehicleName,
      vehicleRego,
      listedWeeklyRate,
      weeklyRate,
      bondWeeks,
      firstName,
      lastName,
      email,
      phone,
    } = await req.json()

    if (!customerId || !paymentMethodId || !weeklyRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Attach + set as default payment method for the customer.
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    const bondWeeksNum = Math.max(0, Math.min(2, Number(bondWeeks) || 0))
    const bondAmount = Number(weeklyRate) * bondWeeksNum

    // Weekly recurring price, created on the fly for this vehicle/rate.
    const price = await stripe.prices.create({
      unit_amount: Math.round(Number(weeklyRate) * 100),
      currency: "aud",
      recurring: { interval: "week" },
      product_data: {
        name: `Weekly rent — ${vehicleName} (${vehicleRego})`,
      },
    })

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      metadata: {
        vehicleId,
        vehicleName,
        vehicleRego,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
      },
    })

    // One-time bond charge if the customer opted in.
    if (bondWeeksNum > 0 && bondAmount > 0) {
      await stripe.paymentIntents.create({
        amount: Math.round(bondAmount * 100),
        currency: "aud",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `Security bond (${bondWeeksNum} week${bondWeeksNum > 1 ? "s" : ""}) — ${vehicleName} (${vehicleRego})`,
      })
    }

    const agreementId = newAgreementId()
    try {
      await insertRentalAgreement({
        id: agreementId,
        vehicleId: vehicleId || "",
        vehicleName: vehicleName || "",
        vehicleRego: vehicleRego || "",
        customerName: `${firstName} ${lastName}`,
        customerEmail: email || "",
        customerPhone: phone || "",
        listedWeeklyRate: Number(listedWeeklyRate) || Number(weeklyRate),
        agreedWeeklyRate: Number(weeklyRate),
        bondWeeks: bondWeeksNum,
        bondAmount,
        paymentMethod: paymentMethod.type,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePaymentMethodId: paymentMethodId,
      })
    } catch (e) {
      console.error("Agreement save error:", e)
    }

    try {
      await sendEmail(
        SITE_EMAIL,
        `🚗 Rental started — ${vehicleName} — ${firstName} ${lastName}`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">✅ Weekly Rental Started</h1>
          </div>
          <div style="padding:24px">
            <p><strong>Customer:</strong> ${firstName} ${lastName} (${phone})</p>
            <p><strong>Vehicle:</strong> ${vehicleName} (${vehicleRego})</p>
            <p><strong>Weekly rent:</strong> $${weeklyRate} (auto-charged every week)</p>
            <p><strong>Payment method:</strong> ${paymentMethod.type === "au_becs_debit" ? "Direct debit (BECS)" : "Card"}</p>
            <p><strong>Bond:</strong> ${
              bondWeeksNum === 0
                ? "None paid online — collect in person"
                : `$${bondAmount} (${bondWeeksNum} week${bondWeeksNum > 1 ? "s" : ""}) — charged`
            }</p>
            <p style="color:#666;font-size:12px">Subscription ID: ${subscription.id}</p>
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Admin notify error:", e)
    }

    try {
      await appendLead({
        id: agreementId,
        name: `${firstName} ${lastName}`,
        phone: phone || "",
        email: email || "",
        service: "car-rental",
        message: `${vehicleName} (${vehicleRego}) — $${weeklyRate}/week subscription started`,
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
      agreementId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Start subscription error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
