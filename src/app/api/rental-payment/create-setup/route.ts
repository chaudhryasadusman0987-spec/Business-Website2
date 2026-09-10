import Stripe from "stripe"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Creates a Stripe Customer + a SetupIntent that supports card, and BECS
// Direct Debit once STRIPE_BECS_ENABLED=true (see below). No charge happens
// here — the saved payment method is used to start the weekly subscription in
// /api/rental-payment/start-subscription.
export async function POST(req: Request) {
  try {
    // Constructed per-request — see create-intent/route.ts for why.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-07-29.dahlia",
    })

    const { firstName, lastName, email, phone } = await req.json()

    const customer = await stripe.customers.create({
      name: `${firstName} ${lastName}`.trim(),
      email: email || undefined,
      phone: phone || undefined,
    })

    // BECS must be enabled on the Stripe account before it can be offered —
    // requesting it otherwise fails the SetupIntent outright. Gate it behind
    // an env var the owner flips once Stripe confirms it's live, so card
    // payments keep working either way with no code change.
    const paymentMethodTypes: string[] = ["card"]
    if (process.env.STRIPE_BECS_ENABLED === "true") {
      paymentMethodTypes.push("au_becs_debit")
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: paymentMethodTypes,
      usage: "off_session",
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("SetupIntent error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
