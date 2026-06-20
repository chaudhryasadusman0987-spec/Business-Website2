"use client"

import { useEffect, useMemo, useState } from "react"
import DbProductCard from "./DbProductCard"
import { productCategories, type Product } from "@/lib/products"

// DB-backed product grid for a single security solution. Fetches from
// /api/products?slug=… on mount (the page itself is statically generated, so
// data loads client-side). Shows category filter tabs, discount strikethrough,
// badges and an out-of-stock state.

export default function DbProductsGrid({
  slug,
  solutionId,
}: {
  slug: string
  solutionId: string
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState("All")

  useEffect(() => {
    let cancelled = false
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setProducts(Array.isArray(data.products) ? data.products : [])
      })
      .catch(() => {
        /* keep empty on error */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const categories = useMemo(() => productCategories(products), [products])
  const tabs = useMemo(() => ["All", ...categories], [categories])

  const visible =
    active === "All"
      ? products
      : products.filter((p) => p.category === active)

  if (loading) {
    return (
      <p className="mt-12 text-center text-[15px] text-[#9496a8]">
        Loading products…
      </p>
    )
  }

  if (products.length === 0) {
    return (
      <p className="mt-12 text-center text-[15px] text-[#9496a8]">
        No products available right now. Please check back soon.
      </p>
    )
  }

  return (
    <div className="mt-10">
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {tabs.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                active === c
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "bg-white border-[#e8e8f0] text-[#666] hover:border-brand-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {visible.map((p) => (
          <DbProductCard key={p.id} product={p} solutionId={solutionId} />
        ))}
      </div>
    </div>
  )
}
