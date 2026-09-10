import { NextResponse } from "next/server"
import { getRentalAgreements } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  try {
    const agreements = await getRentalAgreements(status)
    return NextResponse.json({ agreements })
  } catch (e) {
    console.error("Agreements list error:", e)
    return NextResponse.json({ agreements: [] })
  }
}
