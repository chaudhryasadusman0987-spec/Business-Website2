import { NextResponse } from "next/server"
import { getDisputes } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin-only (middleware). Open disputes by default; ?all=1 includes closed.
export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all") === "1"
  try {
    return NextResponse.json({ disputes: await getDisputes(all) })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Disputes list error:", message)
    return NextResponse.json({ disputes: [], error: message }, { status: 500 })
  }
}
