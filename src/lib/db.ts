import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { securitySolutions } from "@/data/security-solutions"
import type { Product, ProductInput } from "@/lib/products"

// Database layer. Server-only (imports @neondatabase/serverless) — only import
// from route handlers, never from client components. Connects via DATABASE_URL
// (injected by Vercel's native Neon integration; we also accept POSTGRES_URL).
// The client is created lazily so a missing connection string surfaces as a
// clear error at query time rather than crashing on import; callers wrap reads
// so the public page falls back to an empty grid instead of 500ing.
//
// Per the agreed scope this holds ONLY products — leads stay on Vercel KV.

let client: NeonQueryFunction<false, false> | null = null

function sql(): NeonQueryFunction<false, false> {
  if (client) return client
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) {
    throw new Error(
      "No database connection string — set DATABASE_URL (or POSTGRES_URL).",
    )
  }
  client = neon(url)
  return client
}

// Categories for the seeded surveillance products (the static data file has no
// category field). Products without an entry seed with no category; the admin
// can add one later in the dashboard.
const SEED_CATEGORY: Record<string, string> = {
  "hd-bullet-cam": "Cameras",
  "dome-cam": "Cameras",
  "ptz-cam": "Cameras",
  "solar-cam": "Cameras",
  "nvr-system": "Recorders",
  "doorbell-cam": "Doorbells",
}

interface ProductRow {
  id: string
  name: string
  description: string | null
  sku: string | null
  image_url: string | null
  category: string | null
  price: string | number
  discount_price: string | number | null
  badge: string | null
  in_stock: boolean
  solution_slug: string
  created_at: string | Date
}

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    sku: r.sku ?? "",
    imageUrl: r.image_url ?? "",
    category: r.category ?? "",
    // NUMERIC comes back as a string from the driver.
    price: Number(r.price),
    discountPrice: r.discount_price == null ? null : Number(r.discount_price),
    badge: r.badge ?? null,
    inStock: r.in_stock,
    solutionSlug: r.solution_slug,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
  }
}

/** Create the products table + index if they don't exist. Idempotent. */
export async function ensureSchema(): Promise<void> {
  const db = sql()
  await db`
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      description    TEXT,
      sku            TEXT,
      image_url      TEXT,
      category       TEXT,
      price          NUMERIC NOT NULL DEFAULT 0,
      discount_price NUMERIC,
      badge          TEXT,
      in_stock       BOOLEAN NOT NULL DEFAULT true,
      solution_slug  TEXT NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`
    CREATE INDEX IF NOT EXISTS products_solution_slug_idx
    ON products (solution_slug)
  `
  // Migration for tables created before the description column existed.
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`
}

/**
 * Seed every security solution's products from the static data file. Idempotent
 * — existing rows (matched by id) are left untouched, so re-running never
 * duplicates or overwrites admin edits. Returns the number of rows inserted.
 */
export async function seedAllProducts(): Promise<number> {
  const db = sql()

  let inserted = 0
  for (const solution of securitySolutions) {
    // SKU prefix derived from the solution id (e.g. surveillance → "SUR"),
    // matching the original surveillance seed convention.
    const prefix = solution.id.slice(0, 3).toUpperCase()
    for (const p of solution.products) {
      // RETURNING id yields a row only when the INSERT actually happened (no
      // conflict), which lets us count inserts without full query metadata.
      const rows = (await db`
        INSERT INTO products
          (id, name, description, sku, image_url, category, price, discount_price, badge, in_stock, solution_slug)
        VALUES (
          ${p.id},
          ${p.name},
          ${p.description},
          ${`${prefix}-${p.id.toUpperCase()}`},
          ${p.image},
          ${SEED_CATEGORY[p.id] ?? null},
          ${p.price},
          ${null},
          ${p.badge ?? null},
          ${p.inStock},
          ${solution.slug}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `) as { id: string }[]
      inserted += rows.length
    }
  }
  return inserted
}

/** All products, optionally filtered to one solution slug. */
export async function getProducts(solutionSlug?: string): Promise<Product[]> {
  const db = sql()
  const rows = (solutionSlug
    ? await db`
        SELECT * FROM products
        WHERE solution_slug = ${solutionSlug}
        ORDER BY created_at ASC
      `
    : await db`SELECT * FROM products ORDER BY created_at ASC`) as ProductRow[]
  return rows.map(toProduct)
}

function newId(): string {
  return `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = sql()
  const id = newId()
  const rows = (await db`
    INSERT INTO products
      (id, name, description, sku, image_url, category, price, discount_price, badge, in_stock, solution_slug)
    VALUES (
      ${id},
      ${input.name},
      ${input.description || null},
      ${input.sku || null},
      ${input.imageUrl || null},
      ${input.category || null},
      ${input.price},
      ${input.discountPrice},
      ${input.badge || null},
      ${input.inStock},
      ${input.solutionSlug}
    )
    RETURNING *
  `) as ProductRow[]
  return toProduct(rows[0])
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  const db = sql()
  const rows = (await db`
    UPDATE products SET
      name           = ${input.name},
      description    = ${input.description || null},
      sku            = ${input.sku || null},
      image_url      = ${input.imageUrl || null},
      category       = ${input.category || null},
      price          = ${input.price},
      discount_price = ${input.discountPrice},
      badge          = ${input.badge || null},
      in_stock       = ${input.inStock},
      solution_slug  = ${input.solutionSlug}
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[]
  return rows[0] ? toProduct(rows[0]) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = sql()
  const rows = (await db`DELETE FROM products WHERE id = ${id} RETURNING id`) as {
    id: string
  }[]
  return rows.length > 0
}
