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

    const lead: Lead = {
      id: body.id ?? Date.now().toString(),
      name: body.name ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      service: body.service ?? "unknown",
      message: body.message ?? "",
      date: body.date ?? new Date().toISOString(),
      status: body.status ?? "New",
      page: body.page ?? "",
      source: body.source ?? "ai_chat",
    }

    await appendLead(lead)

    return NextResponse.json({ success: true, id: lead.id })
  } catch (err) {
    console.error("Leads API error:", err)
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 })
  }
}
