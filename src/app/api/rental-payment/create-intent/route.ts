import Stripe from "stripe"
import { NextResponse } from "next/server"
import { getVehicle } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Constructed per-request rather than at module scope: Next.js evaluates
    // route modules during the build's page-data collection, and the Stripe
    // SDK throws immediately if no key is configured yet.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-07-29.dahlia",
    })

    const { vehicleId, firstName, lastName, email, phone, includeBond } =
      await req.json()

    // Price from the database, not anything the browser sends — the owner
    // sets the weekly rate in the dashboard and that is the source of truth
    // for what gets charged (mirrors /api/rental-application).
    const vehicle = vehicleId ? await getVehicle(vehicleId) : null
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 400 })
    }

    const weekly = vehicle.weeklyRate || 0
    const bond = weekly * 2

    // Default = rent only. The bond is optional online — if the customer
    // skips it here, it is collected in person at vehicle handover.
    const chargeBond = includeBond === true
    const totalCharge = chargeBond ? weekly + bond : weekly
    const amountCents = Math.round(totalCharge * 100)

    if (amountCents < 50) {
      return NextResponse.json(
        {
          error:
            "Weekly rate not set yet — please use direct deposit or contact us for pricing.",
        },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      description:
        `Pak Oz Rentals — ${vehicle.name} (${vehicle.rego}) — 1 week rent` +
        (chargeBond ? ` + 2 weeks bond` : ``),
      metadata: {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleRego: vehicle.rego,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        weeklyRent: String(weekly),
        bondAmount: chargeBond ? String(bond) : "0",
        bondPaidOnline: String(chargeBond),
        totalCharged: String(totalCharge),
        reference: vehicle.rego,
      },
      receipt_email: email,
      statement_descriptor_suffix: "PAKOZ RENTALS",
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalCharge,
      weekly,
      bond,
      chargeBond,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("PaymentIntent error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
