import { NextResponse } from "next/server"
import { getLeaseAgreements } from "@/lib/db"

// List route for the rental-admin "Agreements" tab.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    const agreements = await getLeaseAgreements()
    return NextResponse.json(
      { agreements },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  } catch (err) {
    const e = err as { message?: string }
    console.error("List agreements error:", e.message)
    return NextResponse.json({ agreements: [], error: e.message })
  }
}
