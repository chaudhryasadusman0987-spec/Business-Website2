import { ensureSchema, seedSurveillanceProducts, getProducts } from "@/lib/db"

// One-time (idempotent) database initialisation. Creates the products table and
// seeds the Surveillance & Evidence products from the static data file. Safe to
// hit more than once — the schema uses IF NOT EXISTS and the seed uses
// ON CONFLICT DO NOTHING. Visit /api/db/setup once after configuring
// POSTGRES_URL. (Leads remain on Vercel KV and are intentionally not migrated.)
export const dynamic = "force-dynamic"

async function run() {
  try {
    await ensureSchema()
    const seeded = await seedSurveillanceProducts()
    const total = (await getProducts()).length
    return Response.json({ ok: true, seeded, total })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database setup failed"
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  return run()
}

export async function POST() {
  return run()
}
