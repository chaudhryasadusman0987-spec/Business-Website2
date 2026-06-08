import { promises as fs } from "fs"
import path from "path"
import { normalise, DEFAULT_PROMO, type PromoConfig } from "@/lib/promo"

// Filesystem-backed promo store. Server-only (imports node:fs) — only import this
// from server code such as route handlers, never from client components.

const PROMO_FILE = path.join(process.cwd(), "src", "data", "promo.json")

// Module-level cache so a running server reflects the latest config even if the
// filesystem write fails (e.g. Vercel's read-only/ephemeral FS).
let cache: PromoConfig = DEFAULT_PROMO

export async function readPromo(): Promise<PromoConfig> {
  try {
    const txt = await fs.readFile(PROMO_FILE, "utf8")
    cache = normalise(JSON.parse(txt))
  } catch {
    // file missing/unreadable (e.g. serverless) — fall back to in-memory cache
  }
  return cache
}

export async function writePromo(raw: Partial<PromoConfig>): Promise<PromoConfig> {
  const next = normalise({ ...raw, updatedAt: new Date().toISOString() })
  cache = next // update in-memory first so it sticks even if the write fails
  try {
    await fs.writeFile(PROMO_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
  } catch {
    // ephemeral FS — cache still holds the latest for this server instance
  }
  return next
}
