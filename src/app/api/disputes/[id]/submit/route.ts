import { NextResponse } from "next/server"
import { getDispute, markDisputeEvidenceSubmitted } from "@/lib/db"
import { stripeClient } from "@/lib/stripe-server"

export const runtime = "nodejs"

// Admin-only (middleware). Sends the reviewed draft evidence to the bank.
// Stripe allows exactly one submission per dispute — there is no undo.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const dispute = await getDispute(params.id)
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
    if (dispute.evidenceStatus === "submitted") {
      return NextResponse.json({ error: "Evidence has already been submitted." }, { status: 409 })
    }
    if (dispute.evidenceStatus !== "draft") {
      return NextResponse.json(
        { error: "Build and review the evidence pack before submitting." },
        { status: 400 },
      )
    }
    const updated = await stripeClient().disputes.update(dispute.id, { submit: true })
    await markDisputeEvidenceSubmitted(dispute.id, updated.status)
    return NextResponse.json({ success: true, status: updated.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Dispute submit error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
