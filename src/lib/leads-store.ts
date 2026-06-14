import { promises as fs } from "fs"
import path from "path"
import { Redis } from "@upstash/redis"
import type { Lead } from "@/types"

// Leads store. Server-only (imports node:fs) — only import from server code
// such as route handlers, never from client components.
//
// On Vercel the filesystem is read-only, so writing data/leads.json throws and
// every quote/contact submission 500s *after* the email has already been sent.
// We persist to Vercel KV / Upstash Redis instead (the same store used for
// promos), which is durable and shared across serverless instances. When no KV
// credentials are present (local dev) we fall back to the committed JSON file
// so `next dev`/`next start` still work offline.

const LEADS_KEY = "leads:all"
const LEADS_FILE = path.join(process.cwd(), "data", "leads.json")

// Vercel's KV integration injects KV_REST_API_*; the native Upstash integration
// injects UPSTASH_REDIS_REST_*. Accept either (mirrors promo-store).
const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

async function readFromFile(): Promise<Lead[]> {
  try {
    const txt = await fs.readFile(LEADS_FILE, "utf8")
    const parsed = JSON.parse(txt)
    return Array.isArray(parsed) ? parsed : (parsed.leads ?? [])
  } catch {
    // File missing/unreadable — no leads yet.
    return []
  }
}

export async function readLeads(): Promise<Lead[]> {
  if (redis) {
    try {
      // @upstash/redis auto-deserializes JSON values.
      const stored = await redis.get<Lead[]>(LEADS_KEY)
      if (Array.isArray(stored)) return stored
      // First run against KV: seed from the committed sample file so existing
      // leads still appear, then persist them so subsequent writes accumulate.
      const seed = await readFromFile()
      if (seed.length) await redis.set(LEADS_KEY, seed)
      return seed
    } catch {
      // KV unreachable — return nothing rather than crash the dashboard.
      return []
    }
  }
  return readFromFile()
}

async function writeLeads(leads: Lead[]): Promise<void> {
  if (redis) {
    // Let failures propagate to the caller, which decides whether to surface them.
    await redis.set(LEADS_KEY, leads)
    return
  }
  try {
    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true })
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8")
  } catch {
    // Ephemeral/read-only FS — nothing more we can do without KV configured.
  }
}

export async function appendLead(lead: Lead): Promise<void> {
  const leads = await readLeads()
  leads.push(lead)
  await writeLeads(leads)
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const leads = await readLeads()
  const lead = leads.find((l) => l.id === id)
  if (!lead) return
  lead.status = status as Lead["status"]
  await writeLeads(leads)
}
