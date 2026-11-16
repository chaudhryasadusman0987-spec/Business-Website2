"use client"

import { useMemo, useState } from "react"
import DbProductCard from "./DbProductCard"
import ProductModal from "@/components/ui/ProductModal"
import { productCategories, type Product } from "@/lib/products"

// Product grid for a single security solution. The products are read from
// Postgres on the server (solution page) and passed in, so they are in the
// HTML for crawlers — no client fetch, no loading state. The page hides this
// grid entirely when there are no products. Client-side only for the category
// filter tabs and the detail modal.

export default function DbProductsGrid({
  products,
  solutionId,
}: {
  products: Product[]
  solutionId: string
}) {
  const [active, setActive] = useState("All")
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const categories = useMemo(() => productCategories(products), [products])
  const tabs = useMemo(() => ["All", ...categories], [categories])

  const visible =
    active === "All"
      ? products
      : products.filter((p) => p.category === active)

  if (products.length === 0) return null

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
                  : "bg-white border-line text-muted hover:border-brand-primary on-light"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {visible.map((p) => (
          <DbProductCard
            key={p.id}
            product={p}
            solutionId={solutionId}
            onOpenDetails={setModalProduct}
          />
        ))}
      </div>

      {/* Product detail modal — Prev/Next walks the currently filtered set. */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          solutionId={solutionId}
          allProducts={visible}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  )
}
