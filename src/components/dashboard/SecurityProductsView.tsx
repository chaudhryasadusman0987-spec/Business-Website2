"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, Info, AlertCircle } from "lucide-react"
import { securitySolutions } from "@/data/security-solutions"
import { hasDiscount, type Product } from "@/lib/products"
import { formatAUD } from "@/lib/formatters"

// Read-only mirror of what the public site shows: every security product from
// Postgres, grouped by solution. Deliberately not editable — writes belong in
// the "Products (DB)" tab so there is one place a product can be changed.
//
// This replaced an older editor that wrote catalog overrides to site_settings.
// Those overrides rendered through SecurityProductsGrid, which nothing imports
// any more, so edits made there never reached the website.

const GRID = "72px 1fr 110px 120px 110px"

export default function SecurityProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState(securitySolutions[0].slug)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : [])
      })
      .catch(() => setError("Could not load products from the database."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const countFor = (s: string) =>
    products.filter((p) => p.solutionSlug === s).length
  const rows = products.filter((p) => p.solutionSlug === slug)
  const activeName =
    securitySolutions.find((s) => s.slug === slug)?.name ?? slug

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="font-bold text-[28px] text-[#1a1a2e]">
            Security Products
          </h1>
          <p className="text-[#666] text-[14px] mt-1">
            Live from the database — exactly what customers see on the website.
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-[#eeedfe] rounded-[12px] p-4 my-6 flex items-start gap-3">
        <Info size={18} className="text-[#534ab7] flex-shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#534ab7] leading-relaxed">
          This view is read-only. To add, edit or delete products use the{" "}
          <strong>Products (DB)</strong> tab — changes there go live on the
          solution pages and the quote wizard without a redeploy.
        </p>
      </div>

      {/* solution tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {securitySolutions.map((s) => (
          <button
            key={s.slug}
            onClick={() => setSlug(s.slug)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
              slug === s.slug
                ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
            }`}
          >
            {s.name}{" "}
            <span className="opacity-60 text-[11px]">({countFor(s.slug)})</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-[#c0392b] flex items-center gap-1.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-[#9496a8] text-[14px]">
          Loading products…
        </p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-12 text-center">
          <p className="text-[#9496a8] text-[15px]">
            No products for {activeName}.
          </p>
          <p className="text-[12px] text-[#b0b0b8] mt-2">
            Add them in the Products (DB) tab, or run{" "}
            <code className="text-[#534ab7]">/api/db/setup</code> once to seed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
          <div
            className="hidden lg:grid px-4 py-3 bg-[#f8f8ff] border-b border-[#e8e8f0] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider gap-4"
            style={{ gridTemplateColumns: GRID }}
          >
            <span>Image</span>
            <span>Product</span>
            <span>Price</span>
            <span>Category</span>
            <span>Status</span>
          </div>

          {rows.map((p) => (
            <div
              key={p.id}
              className="flex flex-col lg:grid gap-4 px-4 py-4 border-b border-[#f0f0f8] last:border-none hover:bg-[#fafaff] items-start lg:items-center"
              style={{ gridTemplateColumns: GRID }}
            >
              <div className="w-[64px] h-[48px] rounded-[8px] overflow-hidden bg-[#f0f0ff] flex-shrink-0 flex items-center justify-center">
                {p.imageUrl ? (
                  // Product images are admin-supplied URLs or data URLs, so the
                  // plain tag avoids next/image's remote-host allowlist.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#c5c8fd] text-[10px]">No image</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-[14px] text-[#1a1a2e]">
                  {p.name}
                  {p.badge && (
                    <span className="ml-2 bg-[#eeedfe] text-[#534ab7] text-[10px] font-bold px-2 py-0.5 rounded-full align-middle">
                      {p.badge}
                    </span>
                  )}
                </p>
                {p.sku && (
                  <p className="text-[11px] text-[#9496a8]">SKU: {p.sku}</p>
                )}
                {p.description && (
                  <p className="text-[12px] text-[#666] mt-0.5 truncate">
                    {p.description}
                  </p>
                )}
              </div>

              <div>
                {hasDiscount(p) ? (
                  <>
                    <p className="font-bold text-[14px] text-[#0f6e56]">
                      {formatAUD(p.discountPrice!)}
                    </p>
                    <p className="text-[11px] text-[#9496a8] line-through">
                      {formatAUD(p.price)}
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-[14px] text-[#1a1a2e]">
                    {formatAUD(p.price)}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[12px] bg-[#f7f7f7] text-[#666] rounded-full px-3 py-1">
                  {p.category || "—"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    p.inStock ? "bg-[#0f6e56]" : "bg-[#e58a8a]"
                  }`}
                />
                <span
                  className={`text-[12px] font-medium ${
                    p.inStock ? "text-[#0f6e56]" : "text-[#c62828]"
                  }`}
                >
                  {p.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
