import { NextResponse } from "next/server"
import { addTrustedRenter, getTrustedRenters, removeTrustedRenter } from "@/lib/db"
import { validateEmail } from "@/lib/rental-validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin-only (middleware). Trusted renters are the only customers offered
// BECS direct debit at checkout — BECS disputes can't be contested.

export async function GET() {
  try {
    return NextResponse.json({ trusted: await getTrustedRenters() })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ trusted: [], error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { email, note } = await req.json()
  if (!validateEmail(String(email ?? "")).ok) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  await addTrustedRenter(String(email), String(note ?? "").slice(0, 200))
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const email = new URL(req.url).searchParams.get("email") || ""
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })
  await removeTrustedRenter(email)
  return NextResponse.json({ success: true })
}
