import { promises as fs } from "fs"
import path from "path"
import { Redis } from "@upstash/redis"
import {
  EMPTY_OVERRIDES,
  normaliseOverrides,
  type CatalogOverrides,
} from "@/lib/catalog"

// Catalog override store. Server-only (imports node:fs) — only import from
// server code such as route handlers, never from client components.
//
// Same rationale as promo-store: Vercel's filesystem is read-only and requests
// hit different serverless instances, so admin product additions/edits must
// live in a shared, durable store (Vercel KV / Upstash Redis). When no KV
// credentials are present (local dev) we fall back to a JSON file so
// `next dev` / `next start` still work offline.

const CATALOG_KEY = "catalog:overrides"
const CATALOG_FILE = path.join(process.cwd(), "src", "data", "catalog.json")

// Vercel's KV integration injects KV_REST_API_*; the native Upstash integration
// injects UPSTASH_REDIS_REST_*. Accept either (mirrors promo-store).
const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

// Last-known overrides, so a transient KV read failure still serves something.
let cache: CatalogOverrides = EMPTY_OVERRIDES

export async function readCatalog(): Promise<CatalogOverrides> {
  if (redis) {
    try {
      const stored = await redis.get<unknown>(CATALOG_KEY)
      if (stored) cache = normaliseOverrides(stored)
    } catch {
      // KV unreachable — fall back to the last known / empty overrides.
    }
    return cache
  }

  // Local dev (no KV configured): read the committed JSON file if present.
  try {
    const txt = await fs.readFile(CATALOG_FILE, "utf8")
    cache = normaliseOverrides(JSON.parse(txt))
  } catch {
    // file missing/unreadable — fall back to in-memory cache
  }
  return cache
}

export async function writeCatalog(
  raw: Partial<CatalogOverrides>,
): Promise<CatalogOverrides> {
  const next = normaliseOverrides({ ...raw, updatedAt: new Date().toISOString() })
  cache = next

  if (redis) {
    // Let failures propagate so the POST route reports an error instead of
    // silently "saving" data that never persists.
    await redis.set(CATALOG_KEY, next)
    return next
  }

  // Local dev: persist to the JSON file.
  try {
    await fs.writeFile(CATALOG_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
  } catch {
    // ephemeral FS — cache still holds the latest for this server instance
  }
  return next
}
