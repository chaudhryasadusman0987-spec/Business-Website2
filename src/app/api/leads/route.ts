import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Lead } from "@/types"

// Prototype storage — leads saved to /data/leads.json
// TODO(backend): replace with real CRM/database when backend is live
const DATA_DIR = path.join(process.cwd(), "data")
const LEADS_FILE = path.join(DATA_DIR, "leads.json")

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8")
    return JSON.parse(raw) as Lead[]
  } catch {
    // File does not exist yet — start with an empty array
    return []
  }
}

export async function GET() {
  return NextResponse.json(await readLeads())
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Lead>
    const leads = await readLeads()

    const lead: Lead = {
      id: body.id ?? Date.now().toString(),
      name: body.name ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      service: body.service ?? "unknown",
      message: body.message ?? "",
      timestamp: body.timestamp ?? new Date().toISOString(),
      page: body.page ?? "",
      source: body.source ?? "ai_chat",
    }

    leads.push(lead)
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8")

    return NextResponse.json({ success: true, id: lead.id })
  } catch (err) {
    console.error("Leads API error:", err)
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 })
  }
}
