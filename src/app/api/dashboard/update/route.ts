import { createProduct, updateProduct, deleteProduct } from "@/lib/db"
import type { ProductInput } from "@/lib/products"

// Dashboard save endpoint.
//
// type === "product": create / update / delete a Postgres-backed product
//   (powers the Surveillance & Evidence grid and the "Products (DB)" tab).
// Other types (it-package, …) are not yet persisted — they log and return
// success so the existing prototype UIs keep working.

export const dynamic = "force-dynamic"

function coerceInput(p: Record<string, unknown>): ProductInput {
  const discount = p.discountPrice
  return {
    name: String(p.name ?? ""),
    description: String(p.description ?? ""),
    sku: String(p.sku ?? ""),
    imageUrl: String(p.imageUrl ?? ""),
    category: String(p.category ?? ""),
    price: Number(p.price ?? 0),
    discountPrice:
      discount === null || discount === undefined || discount === ""
        ? null
        : Number(discount),
    badge: p.badge ? String(p.badge) : null,
    inStock: p.inStock !== false,
    solutionSlug: String(p.solutionSlug ?? ""),
  }
}

async function handleProduct(data: Record<string, unknown>) {
  const action = String(data.action ?? "")
  try {
    if (action === "create") {
      const product = await createProduct(coerceInput(data))
      return Response.json({ success: true, product })
    }
    if (action === "update") {
      const id = String(data.id ?? "")
      if (!id) return Response.json({ success: false, error: "Missing id" }, { status: 400 })
      const product = await updateProduct(id, coerceInput(data))
      if (!product) return Response.json({ success: false, error: "Not found" }, { status: 404 })
      return Response.json({ success: true, product })
    }
    if (action === "delete") {
      const id = String(data.id ?? "")
      if (!id) return Response.json({ success: false, error: "Missing id" }, { status: 400 })
      const ok = await deleteProduct(id)
      return Response.json({ success: ok })
    }
    return Response.json({ success: false, error: "Unknown action" }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const data = await req.json()

  if (data?.type === "product") {
    return handleProduct(data as Record<string, unknown>)
  }

  // Legacy prototype types (it-package, …) — not yet persisted.
  console.log("Dashboard update:", data)
  return Response.json({ success: true })
}
