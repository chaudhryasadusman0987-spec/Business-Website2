import { getProducts } from "@/lib/db"

// Public product reads. Used by the Surveillance & Evidence page grid and the
// dashboard "Products (DB)" tab. Writes go through /api/dashboard/update.
// Always read fresh so dashboard edits show without a redeploy. `fetchCache`
// is force-no-store because the Neon driver queries over `fetch`, which the
// App Router Data Cache would otherwise cache — pinning stale product lists.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  // `slug` is canonical; the aliases exist so a caller using the DB column name
  // or the camelCase field from the Product type still filters correctly rather
  // than silently getting every solution's products back.
  const slug =
    params.get("slug") ??
    params.get("solutionId") ??
    params.get("solution_id") ??
    undefined
  // Never let a browser/CDN cache this response — dashboard edits must show on
  // the next page load. Without this, an early empty result can stick.
  const headers = { "Cache-Control": "no-store, max-age=0" }
  try {
    const products = await getProducts(slug)
    return Response.json({ products }, { headers })
  } catch (err) {
    // Log the full shape — Postgres errors carry `code`/`detail` that say
    // whether this is a missing DATABASE_URL, a bad column, or an unreachable
    // host. Visible in Vercel → Logs, filtered on "Products API".
    const e = err as { message?: string; code?: string; detail?: string; stack?: string }
    console.error("Products API FULL ERROR:", {
      slug,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      message: e?.message,
      code: e?.code,
      detail: e?.detail,
      stack: e?.stack,
    })
    // Still 200 with an empty list so the page renders its empty state rather
    // than a stuck spinner; `error` is there for debugging in the Network tab.
    return Response.json({ products: [], error: e?.message }, { headers })
  }
}
