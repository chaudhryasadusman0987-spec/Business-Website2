import {
  ensureSchema,
  seedAllProducts,
  seedAllVehicles,
  getProducts,
  getVehicles,
} from "@/lib/db"

// Database initialisation. Creates the products, vehicles and settings tables,
// then seeds the two catalogs from the static data files.
//
// Safe to visit repeatedly: the schema uses IF NOT EXISTS, and each seed runs
// at most ONCE — a marker row in site_settings records that it has run. That
// matters because ON CONFLICT DO NOTHING only stops duplicates, not
// resurrection: a product or car the admin deleted has no id left to conflict
// with, so an unguarded second run would quietly put it back on the site.
//
// Visit /api/db/setup once after configuring DATABASE_URL, and again after a
// deploy that adds a table — the seeds will report "skipped". Pass ?force=1
// only when you deliberately want the static catalog re-seeded.
// (Leads remain on Vercel KV and are intentionally not migrated.)
export const dynamic = "force-dynamic"

/** -1 from a seed means "already run, skipped". */
function seedResult(count: number) {
  return count < 0 ? { skipped: true } : { seeded: count }
}

async function run(force: boolean) {
  try {
    await ensureSchema()
    const products = await seedAllProducts(force)
    const vehicles = await seedAllVehicles(force)
    return Response.json({
      ok: true,
      forced: force,
      products: { ...seedResult(products), total: (await getProducts()).length },
      vehicles: { ...seedResult(vehicles), total: (await getVehicles()).length },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database setup failed"
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}

function forced(req: Request): boolean {
  return new URL(req.url).searchParams.get("force") === "1"
}

export async function GET(req: Request) {
  return run(forced(req))
}

export async function POST(req: Request) {
  return run(forced(req))
}
