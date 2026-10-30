import { getFleetCounts } from "@/lib/db"

// Live fleet numbers for pages that only need the headline ("N cars on the
// yard", "X available now") — the homepage asks for these rather than pulling
// every car's photo through /api/vehicles.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  const headers = { "Cache-Control": "no-store, max-age=0" }
  try {
    return Response.json(await getFleetCounts(), { headers })
  } catch (err) {
    console.error("Fleet counts error:", err instanceof Error ? err.message : err)
    // null rather than 0 so callers hide the numbers instead of claiming "0 cars".
    return Response.json({ onYard: null, available: null }, { headers })
  }
}
