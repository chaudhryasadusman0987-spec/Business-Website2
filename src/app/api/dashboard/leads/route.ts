import { readLeads, updateLeadStatus } from "@/lib/leads-store"
import type { Lead } from "@/types"

export const dynamic = "force-dynamic"

function leadTime(l: Lead): number {
  const t = l.date ? new Date(l.date).getTime() : 0
  return isNaN(t) ? 0 : t
}

// GET — return all leads (from KV, with local-file fallback), newest first
export async function GET() {
  const leads = await readLeads()
  leads.sort((a, b) => leadTime(b) - leadTime(a))
  return Response.json({ leads })
}

// POST — update a lead's status
export async function POST(req: Request) {
  try {
    const { leadId, status } = await req.json()
    await updateLeadStatus(leadId, status)
    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false }, { status: 400 })
  }
}
