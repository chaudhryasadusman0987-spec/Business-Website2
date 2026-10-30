import { NextResponse } from "next/server"
import { getRentalAgreement, upsertRentalEvidence } from "@/lib/db"
import { parseChecklist } from "@/lib/rental-checklist"

export const runtime = "nodejs"

// Admin-only (middleware). Saves the pickup (handover) checklist. The return
// checklist goes through /api/rental-payment/return-vehicle, because saving it
// also ends billing and emails the customer their return confirmation.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rentalId = String(body.rentalId ?? "")
    if (!(await getRentalAgreement(rentalId))) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }
    const parsed = await parseChecklist(rentalId, "pickup", body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const evidence = await upsertRentalEvidence(parsed.value)
    return NextResponse.json({ success: true, evidence })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Pickup checklist error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
