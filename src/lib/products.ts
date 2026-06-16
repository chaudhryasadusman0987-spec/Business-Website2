// Shared product model for the Postgres-backed catalog. SAFE for both client
// and server (no node imports) — only types and pure helpers live here.
//
// The DB-backed products power the Surveillance & Evidence solution page grid
// and the dashboard "Products (DB)" tab. Reads/writes go through the API routes
// (/api/products, /api/dashboard/update) which use the server-only db.ts.

export interface Product {
  id: string
  name: string
  sku: string
  imageUrl: string
  category: string
  price: number
  /** Sale price; when set and below `price`, the original is struck through. */
  discountPrice: number | null
  badge: string | null
  inStock: boolean
  solutionSlug: string
  createdAt?: string
}

/** Shape the add/edit forms collect — `id` is assigned server-side on create. */
export type ProductInput = Omit<Product, "id" | "createdAt">

export function blankProductInput(solutionSlug: string): ProductInput {
  return {
    name: "",
    sku: "",
    imageUrl: "",
    category: "",
    price: 0,
    discountPrice: null,
    badge: null,
    inStock: true,
    solutionSlug,
  }
}

/** Distinct, non-empty categories in display order (first-seen). */
export function productCategories(products: Product[]): string[] {
  const seen: string[] = []
  for (const p of products) {
    const c = p.category?.trim()
    if (c && !seen.includes(c)) seen.push(c)
  }
  return seen
}

/** True when a usable sale price is present (set and strictly below price). */
export function hasDiscount(p: Product): boolean {
  return p.discountPrice != null && p.discountPrice > 0 && p.discountPrice < p.price
}
