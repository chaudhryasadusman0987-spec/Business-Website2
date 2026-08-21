import { NextResponse } from "next/server"
import { deletePackage, getPackage, getPackages, getProduct, upsertPackage } from "@/lib/db"

// Public package reads + dashboard writes. Mirrors /api/products: always read
// fresh from Postgres so a dashboard edit shows without a redeploy, and never
// let the App Router Data Cache (which wraps the Neon driver's `fetch`) pin a
// stale package list.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const slug = searchParams.get("slug") ?? undefined
  const headers = { "Cache-Control": "no-store, max-age=0" }
  try {
    // Single-package lookup — used by the quote wizard's ?package=xxx flow.
    if (id) {
      const pkg = await getPackage(id)
      return NextResponse.json({ package: pkg }, { headers })
    }
    const packages = await getPackages(slug)
    return NextResponse.json({ packages }, { headers })
  } catch (err) {
    const e = err as { message?: string }
    console.error("Packages fetch error:", e?.message)
    return NextResponse.json(
      id ? { package: null, error: e?.message } : { packages: [], error: e?.message },
      { status: 500, headers }
    )
  }
}

interface IncomingItem {
  productId: string
  quantity: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      name,
      brand,
      solutionSlug,
      description,
      image,
      badge,
      items,
      discountPercent,
      installFeePerUnit,
      packagePrice,
      inStock,
    } = body as {
      id?: string
      name: string
      brand: string
      solutionSlug: string
      description?: string
      image?: string
      badge?: string
      items: IncomingItem[]
      discountPercent?: number
      installFeePerUnit?: number
      packagePrice?: number | null
      inStock?: boolean
    }

    if (!name || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "A package needs a name and at least one product." },
        { status: 400 }
      )
    }

    // Price every line from the live product record, not whatever the browser
    // sends — the owner picks products and quantities, the database is still
    // the source of truth for what each one costs (mirrors create-intent's
    // vehicle pricing).
    const priced = await Promise.all(
      items.map(async (item) => {
        const product = await getProduct(item.productId)
        if (!product) return null
        const unitPrice =
          product.discountPrice && product.discountPrice > 0
            ? product.discountPrice
            : product.price
        return {
          productId: product.id,
          productName: product.name,
          quantity: Math.max(1, Math.floor(item.quantity) || 1),
          unitPrice,
        }
      })
    )
    const resolvedItems = priced.filter((i): i is NonNullable<typeof i> => i !== null)
    if (resolvedItems.length === 0) {
      return NextResponse.json(
        { error: "None of the selected products could be found." },
        { status: 400 }
      )
    }

    const calculatedSubtotal = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
    const totalUnits = resolvedItems.reduce((sum, item) => sum + item.quantity, 0)
    const feePerUnit = installFeePerUnit || 150
    const discount = discountPercent || 0
    // Auto price = products + install, less the discount — overridable below.
    const autoPrice = (calculatedSubtotal + totalUnits * feePerUnit) * (1 - discount / 100)
    const finalPackagePrice =
      packagePrice !== null && packagePrice !== undefined && packagePrice !== ("" as never)
        ? Number(packagePrice)
        : autoPrice

    const saved = await upsertPackage({
      id,
      name,
      brand: brand || "",
      solutionSlug,
      description: description || "",
      image: image || "",
      badge: badge || "",
      items: resolvedItems,
      calculatedSubtotal,
      packagePrice: finalPackagePrice,
      discountPercent: discount,
      installFeePerUnit: feePerUnit,
      totalUnits,
      inStock: inStock !== false,
    })

    return NextResponse.json({ success: true, package: saved })
  } catch (err) {
    const e = err as { message?: string }
    console.error("Package save error:", e?.message)
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    await deletePackage(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
