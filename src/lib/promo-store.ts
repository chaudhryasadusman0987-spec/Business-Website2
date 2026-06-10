import { promises as fs } from "fs"
import path from "path"
import { Redis } from "@upstash/redis"
import { normalise, DEFAULT_PROMO, type PromoConfig } from "@/lib/promo"

// Promo store. Server-only (imports node:fs) — only import from server code such
// as route handlers, never from client components.
//
// On Vercel the filesystem is read-only and each request may hit a different
// (or cold) serverless instance, so a file/in-memory store can't share the
// promo set in the dashboard with public visitors. We persist to a Vercel KV /
// Upstash Redis store instead, which is durable and shared across instances.
// When no KV credentials are present (local dev) we fall back to the committed
// JSON file so `next start` still works offline.

const PROMO_KEY = "promo:config"
const PROMO_FILE = path.join(process.cwd(), "src", "data", "promo.json")

// Vercel's KV integration injects KV_REST_API_*; the native Upstash integration
// injects UPSTASH_REDIS_REST_*. Accept either.
const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

// Last-known config, so a transient KV read failure still serves something sane.
let cache: PromoConfig = DEFAULT_PROMO

export async function readPromo(): Promise<PromoConfig> {
  if (redis) {
    try {
      // @upstash/redis auto-deserializes JSON values.
      const stored = await redis.get<Partial<PromoConfig>>(PROMO_KEY)
      if (stored) cache = normalise(stored)
    } catch {
      // KV unreachable — fall back to the last known / default config.
    }
    return cache
  }

  // Local dev (no KV configured): read the committed JSON file.
  try {
    const txt = await fs.readFile(PROMO_FILE, "utf8")
    cache = normalise(JSON.parse(txt))
  } catch {
    // file missing/unreadable — fall back to in-memory cache
  }
  return cache
}

export async function writePromo(raw: Partial<PromoConfig>): Promise<PromoConfig> {
  const next = normalise({ ...raw, updatedAt: new Date().toISOString() })
  cache = next

  if (redis) {
    // Let failures propagate so the POST route reports an error instead of
    // silently "saving" a promo that never persists.
    await redis.set(PROMO_KEY, next)
    return next
  }

  // Local dev: persist to the JSON file.
  try {
    await fs.writeFile(PROMO_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
  } catch {
    // ephemeral FS — cache still holds the latest for this server instance
  }
  return next
}
