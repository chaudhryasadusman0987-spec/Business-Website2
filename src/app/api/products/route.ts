import { getProducts } from "@/lib/db"

// Public product reads. Used by the Surveillance & Evidence page grid and the
// dashboard "Products (DB)" tab. Writes go through /api/dashboard/update.
// Always read fresh so dashboard edits show without a redeploy. `fetchCache`
// is force-no-store because the Neon driver queries over `fetch`, which the
// App Router Data Cache would otherwise cache — pinning stale product lists.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? undefined
  // Never let a browser/CDN cache this response — dashboard edits must show on
  // the next page load. Without this, an early empty result can stick.
  const headers = { "Cache-Control": "no-store, max-age=0" }
  try {
    const products = await getProducts(slug)
    return Response.json({ products }, { headers })
  } catch {
    // No DB configured / unreachable — return empty so the page shows its
    // empty state rather than crashing.
    return Response.json({ products: [] }, { headers })
  }
}
