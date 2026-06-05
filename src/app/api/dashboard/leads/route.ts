import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json")

interface Lead {
  id?: string
  date?: string
  createdAt?: string
  timestamp?: string
  status?: string
  [key: string]: unknown
}

function leadTime(l: Lead): number {
  const v = l.date ?? l.createdAt ?? l.timestamp
  const t = v ? new Date(v).getTime() : 0
  return isNaN(t) ? 0 : t
}

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed.leads ?? []
  } catch {
    // File missing or unreadable → no leads yet
    return []
  }
}

// GET — return all leads, newest first
export async function GET() {
  const leads = await readLeads()
  leads.sort((a, b) => leadTime(b) - leadTime(a))
  return Response.json({ leads })
}

// POST — update a lead's status
export async function POST(req: Request) {
  try {
    const { leadId, status } = await req.json()
    const leads = await readLeads()
    const lead = leads.find((l) => l.id === leadId)
    if (lead) {
      lead.status = status
      await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true })
      await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8")
    }
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }
}
