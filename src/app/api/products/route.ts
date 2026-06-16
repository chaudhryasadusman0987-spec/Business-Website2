import { getProducts } from "@/lib/db"

// Public product reads. Used by the Surveillance & Evidence page grid and the
// dashboard "Products (DB)" tab. Writes go through /api/dashboard/update.
// Always read fresh so dashboard edits show without a redeploy.
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? undefined
  try {
    const products = await getProducts(slug)
    return Response.json({ products })
  } catch {
    // No DB configured / unreachable — return empty so the page shows its
    // empty state rather than crashing.
    return Response.json({ products: [] })
  }
}
