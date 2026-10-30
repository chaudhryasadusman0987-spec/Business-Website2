import { NextResponse } from "next/server"
import { getRentalAgreement, recordTermsAcceptance } from "@/lib/db"
import { requestIp } from "@/lib/stripe-server"
import { RENTAL_TERMS_VERSION, billingWeekday, fullTermsText } from "@/lib/rental-terms"

export const runtime = "nodejs"

// Records the customer's agreement to the weekly charge, immediately before
// their card / bank details are confirmed. The stored text is rebuilt here
// from the server-side price — not taken from the browser — together with the
// time, IP address, user agent and the full name the customer typed.
export async function POST(req: Request) {
  try {
    const { rentalId, typedName, agreed, termsVersion } = await req.json()

    if (agreed !== true) {
      return NextResponse.json({ error: "Please tick the box to agree." }, { status: 400 })
    }
    const name = String(typedName ?? "").trim().replace(/\s+/g, " ")
    if (name.length < 3 || !name.includes(" ")) {
      return NextResponse.json({ error: "Please type your full name." }, { status: 400 })
    }
    if (termsVersion !== RENTAL_TERMS_VERSION) {
      return NextResponse.json(
        { error: "Our terms were just updated — please refresh the page and try again." },
        { status: 409 },
      )
    }

    const rental = rentalId ? await getRentalAgreement(String(rentalId)) : null
    if (!rental || rental.status !== "pending_payment") {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    const text = fullTermsText({
      weeklyRate: rental.agreedWeeklyRate,
      weekday: billingWeekday(),
      bondAmount: rental.bondAmount,
      vehicle: `${rental.vehicleName} (${rental.vehicleRego})`,
    })
    const saved = await recordTermsAcceptance(rental.id, {
      version: RENTAL_TERMS_VERSION,
      text,
      ip: requestIp(req),
      userAgent: (req.headers.get("user-agent") || "").slice(0, 500),
      typedName: name.slice(0, 120),
    })
    if (!saved) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Accept terms error:", message)
    return NextResponse.json({ error: "Could not record your agreement." }, { status: 500 })
  }
}
