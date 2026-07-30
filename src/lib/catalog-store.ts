import { promises as fs } from "fs"
import path from "path"
import { Redis } from "@upstash/redis"
import {
  createSettingsTable,
  hasDatabase,
  readSetting,
  writeSetting,
} from "@/lib/db"
import {
  EMPTY_OVERRIDES,
  normaliseOverrides,
  type CatalogOverrides,
} from "@/lib/catalog"

// Catalog override store. Server-only (imports node:fs and the Neon driver) —
// only import from server code such as route handlers, never from client
// components.
//
// Vercel's filesystem is read-only and requests hit different serverless
// instances, so admin edits (IT package prices, vehicle rates, product
// add/edit/delete) must live in a shared, durable store. Backends in priority
// order:
//
//   1. Postgres `site_settings` — the primary. DATABASE_URL is already
//      configured for products, so this needs no extra provisioning, which is
//      why it outranks KV: a missing KV credential used to send writes down the
//      read-only-filesystem path below, where they were silently discarded and
//      the dashboard still showed a green tick.
//   2. Vercel KV / Upstash Redis — kept for deployments provisioned before the
//      move to Postgres, so their saved overrides are not orphaned.
//   3. A committed JSON file — local dev only, so `next dev` / `next start`
//      work offline with no database.
//
// The whole override object is stored under a single key. It is small, and the
// public pages already read it as one document (see mergeSecurityProducts /
// mergeVehicles / mergeITServices), so a single key keeps one source of truth.

const CATALOG_KEY = "catalog:overrides"
const CATALOG_FILE = path.join(process.cwd(), "src", "data", "catalog.json")

// Vercel's KV integration injects KV_REST_API_*; the native Upstash integration
// injects UPSTASH_REDIS_REST_*. Accept either (mirrors promo-store).
const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

// Last-known overrides, so a transient read failure still serves something.
let cache: CatalogOverrides = EMPTY_OVERRIDES

// site_settings is created on demand rather than requiring /api/db/setup to
// have been visited, so a fresh deployment saves correctly on the first try.
let tableReady: Promise<void> | null = null
function ensureTable(): Promise<void> {
  if (!tableReady) {
    // Reset on failure so the next call retries instead of caching the rejection.
    tableReady = createSettingsTable().catch((err) => {
      tableReady = null
      throw err
    })
  }
  return tableReady
}

export async function readCatalog(): Promise<CatalogOverrides> {
  if (hasDatabase()) {
    try {
      await ensureTable()
      const stored = await readSetting<unknown>(CATALOG_KEY)
      if (stored) {
        cache = normaliseOverrides(stored)
        return cache
      }
      // No row yet. Fall through to KV so a deployment that saved overrides
      // before this change still shows them (the first write migrates them).
    } catch {
      // Database unreachable — try the remaining backends.
    }
  }

  if (redis) {
    try {
      const stored = await redis.get<unknown>(CATALOG_KEY)
      if (stored) {
        cache = normaliseOverrides(stored)
        return cache
      }
    } catch {
      // KV unreachable — fall back to the last known / empty overrides.
    }
    if (hasDatabase()) return cache
  }

  // Local dev (no durable store configured): read the committed JSON file.
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

  // Failures propagate so the POST route reports an error instead of silently
  // "saving" data that never persists.
  if (hasDatabase()) {
    await ensureTable()
    await writeSetting(CATALOG_KEY, next)
    return next
  }

  if (redis) {
    await redis.set(CATALOG_KEY, next)
    return next
  }

  // Local dev: persist to the JSON file. A failure here means there is no
  // durable store at all, so surface it rather than showing a false success.
  await fs.writeFile(CATALOG_FILE, JSON.stringify(next, null, 2) + "\n", "utf8")
  return next
}
