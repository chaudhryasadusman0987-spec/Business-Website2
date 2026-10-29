import { NextResponse } from "next/server"
import { getRentalAgreements, getTrustedRenters } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  try {
    const [agreements, trusted] = await Promise.all([
      getRentalAgreements(status),
      getTrustedRenters().catch(() => []),
    ])
    const trustedEmails = new Set(trusted.map((t) => t.email))
    return NextResponse.json({
      agreements: agreements.map((a) => ({
        ...a,
        trusted: trustedEmails.has(a.customerEmail.trim().toLowerCase()),
      })),
    })
  } catch (e) {
    console.error("Agreements list error:", e)
    return NextResponse.json({ agreements: [] })
  }
}
