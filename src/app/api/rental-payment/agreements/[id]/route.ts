import { NextResponse } from "next/server"
import {
  getRentalAgreement,
  getRentalEmailLog,
  getRentalEvidence,
  listRentalFiles,
} from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin-only (middleware): everything on file for one rental — licence images,
// checklist photos, pickup/return records and the email log.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const agreement = await getRentalAgreement(params.id)
    if (!agreement) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const [files, evidence, emails] = await Promise.all([
      listRentalFiles(params.id),
      getRentalEvidence(params.id),
      getRentalEmailLog(params.id),
    ])
    return NextResponse.json({ agreement, files, evidence, emails })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
