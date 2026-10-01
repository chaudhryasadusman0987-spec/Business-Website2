import { NextResponse } from "next/server"
import { readLeads, appendLead } from "@/lib/leads-store"
import type { Lead } from "@/types"

export const dynamic = "force-dynamic"

// GET — return all leads (from KV, with local-file fallback)
export async function GET() {
  return NextResponse.json(await readLeads())
}

// POST — save a lead (used by the AI chat bubble). Persists to KV so leads
// survive on Vercel's read-only filesystem, same store the dashboard reads.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Lead>

    // Public endpoint: id, date and status are set here, never by the caller,
    // and text is capped so nobody can bloat the shared leads list.
    const text = (v: unknown, max = 500) => String(v ?? "").slice(0, max)
    const lead: Lead = {
      id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      name: text(body.name, 120),
      phone: text(body.phone, 40),
      email: text(body.email, 200),
      service: text(body.service || "unknown", 60),
      message: text(body.message, 2000),
      date: new Date().toISOString(),
      status: "New",
      page: text(body.page, 200),
      source: "ai_chat",
    }

    await appendLead(lead)

    return NextResponse.json({ success: true, id: lead.id })
  } catch (err) {
    console.error("Leads API error:", err)
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 })
  }
}
