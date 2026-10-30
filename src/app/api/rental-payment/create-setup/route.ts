import { NextResponse } from "next/server"
import {
  createPendingRental,
  getNegotiations,
  getVehicle,
  isTrustedRenter,
  newRentalId,
  purgeAbandonedApplications,
} from "@/lib/db"
import { validateEmail } from "@/lib/rental-validation"
import { isBookable } from "@/lib/vehicles"
import { stripeClient } from "@/lib/stripe-server"
import {
  RENTAL_TERMS_VERSION,
  billingWeekday,
  chargeConsentSentence,
} from "@/lib/rental-terms"

export const runtime = "nodejs"

// Step 1 of the card / BECS checkout. Prices the rental from the database,
// records the application as a pending rental, and creates a Stripe Customer
// + SetupIntent. No money moves here — the licence upload and terms
// acceptance attach to the pending rental next, and only then does
// /api/rental-payment/start-subscription charge anything.
export async function POST(req: Request) {
  try {
    const stripe = stripeClient()

    const body = await req.json()
    const str = (k: string) => String(body[k] ?? "").trim()
    const firstName = str("firstName")
    const lastName = str("lastName")
    const email = str("email")
    if (!firstName || !lastName || !validateEmail(email).ok) {
      return NextResponse.json({ error: "Missing name or email." }, { status: 400 })
    }

    // Price from the database, never from the browser. The only way below
    // the listed rate is an offer the owner approved for this exact vehicle.
    const vehicle = body.vehicleId ? await getVehicle(String(body.vehicleId)) : null
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 400 })
    }
    if (!isBookable(vehicle)) {
      return NextResponse.json({ error: "This car can't be booked yet." }, { status: 400 })
    }
    const listedWeeklyRate = vehicle.weeklyRate || 0
    let weeklyRate = listedWeeklyRate
    if (body.negotiationId) {
      const [offer] = await getNegotiations(String(body.negotiationId))
      if (offer?.status === "approved" && offer.vehicleId === vehicle.id && offer.approvedPrice) {
        weeklyRate = Number(offer.approvedPrice)
      }
    }
    if (Math.round(weeklyRate * 100) < 50) {
      return NextResponse.json(
        { error: "Weekly rate not set yet — please contact us for pricing." },
        { status: 400 },
      )
    }
    const bondWeeks = Math.max(0, Math.min(2, Number(body.bondWeeks) || 0))
    const bondAmount = weeklyRate * bondWeeks

    // BECS disputes cannot be contested, so direct debit is only offered to
    // renters the owner has marked Trusted in /rental-admin — and only once
    // BECS is live on the Stripe account (requesting it otherwise fails the
    // SetupIntent outright). Everyone else pays by card.
    const becsAllowed =
      process.env.STRIPE_BECS_ENABLED === "true" && (await isTrustedRenter(email))
    const paymentMethodTypes = becsAllowed ? ["card", "au_becs_debit"] : ["card"]

    const customer = await stripe.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      phone: str("phone") || undefined,
    })

    const rentalId = newRentalId()
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: paymentMethodTypes,
      usage: "off_session",
      // Every card goes through the bank's 3D Secure check, so the customer
      // confirms in their banking app. An authenticated setup shifts fraud
      // chargeback liability to the issuer and authorises the weekly
      // off-session charges that follow. Deliberately NOT set on the
      // subscription itself: forcing 3DS on each renewal would make every
      // weekly charge wait for a customer who isn't there to approve it.
      payment_method_options: { card: { request_three_d_secure: "any" } },
      metadata: { rentalId },
    })

    await createPendingRental({
      id: rentalId,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleRego: vehicle.rego,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: str("phone"),
      listedWeeklyRate: listedWeeklyRate || weeklyRate,
      agreedWeeklyRate: weeklyRate,
      bondWeeks,
      bondAmount,
      paymentMethod: "",
      stripeCustomerId: customer.id,
      stripeSubscriptionId: "",
      stripePaymentMethodId: "",
      customerAddress: str("address"),
      licenceNumber: str("licenceNumber"),
      licenceState: str("licenceState"),
      setupIntentId: setupIntent.id,
    })

    purgeAbandonedApplications().catch((e) => console.error("Purge abandoned applications:", e))

    const weekday = billingWeekday()
    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      rentalId,
      becsAllowed,
      weeklyRate,
      bondWeeks,
      bondAmount,
      weekday,
      consentSentence: chargeConsentSentence(weeklyRate, weekday),
      termsVersion: RENTAL_TERMS_VERSION,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("SetupIntent error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
