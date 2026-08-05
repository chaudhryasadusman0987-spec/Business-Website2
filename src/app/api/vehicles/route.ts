import { getVehicles } from "@/lib/db"
import type { RentalVehicle } from "@/lib/vehicles"

// Public fleet reads. Used by the car rental pages and the dashboard's Car
// Rental tab. Writes go through /api/dashboard/update (type: "vehicle").
//
// Query params:
//   ?light=1   omit the photo galleries (see below)
//   ?id=<id>   return just that one vehicle, galleries included
//   ?all=1     include unavailable cars — the dashboard needs them, the
//              public grid does not
//
// Photos uploaded from the dashboard are stored inline as data URLs, so a
// fleet where every car has a full gallery is megabytes of JSON. The listing
// grid only ever renders the main photo, so it asks for ?light=1 and then
// fetches the one car it opens with ?id=. That keeps the page fast however
// many vehicles get added later.
//
// Always read fresh so dashboard edits show without a redeploy. `fetchCache` is
// force-no-store because the Neon driver queries over `fetch`, which the App
// Router Data Cache would otherwise cache — pinning a stale fleet.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

/** Gallery stripped, but `image` (the card photo) kept. */
function stripGallery(v: RentalVehicle): RentalVehicle {
  return { ...v, images: [] }
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const id = params.get("id")
  const light = params.get("light") === "1"
  const includeUnavailable = params.get("all") === "1"

  // Never let a browser/CDN cache this — a newly added car must appear on the
  // next page load, and an early empty result must not stick.
  const headers = { "Cache-Control": "no-store, max-age=0" }

  try {
    const all = await getVehicles()

    if (id) {
      const vehicle = all.find((v) => v.id === id) ?? null
      return Response.json({ vehicle }, { headers, status: vehicle ? 200 : 404 })
    }

    let vehicles = includeUnavailable ? all : all.filter((v) => v.available)
    if (light) vehicles = vehicles.map(stripGallery)
    return Response.json({ vehicles }, { headers })
  } catch (err) {
    // Postgres errors carry code/detail that distinguish a missing
    // DATABASE_URL from a missing table. Visible in Vercel → Logs.
    const e = err as { message?: string; code?: string; detail?: string }
    console.error("Vehicles API FULL ERROR:", {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      message: e?.message,
      code: e?.code,
      detail: e?.detail,
    })
    // Still 200 with an empty list so the page renders its empty state rather
    // than a stuck spinner; `error` is there for debugging in the Network tab.
    return Response.json({ vehicles: [], vehicle: null, error: e?.message }, { headers })
  }
}
