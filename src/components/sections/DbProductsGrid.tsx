"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { formatAUD } from "@/lib/formatters"
import {
  hasDiscount,
  productCategories,
  type Product,
} from "@/lib/products"

// DB-backed product grid for the Surveillance & Evidence solution. Fetches from
// /api/products?slug=… on mount (the page itself is statically generated, so
// data loads client-side, mirroring SecurityProductsGrid). Shows category
// filter tabs, discount strikethrough, badges and an out-of-stock state.

function badgeClasses(badge: string): string {
  const b = badge.toLowerCase()
  if (b.includes("sale")) return "bg-[#c62828] text-white"
  if (b.includes("soon")) return "bg-[#1a1a2e] text-white"
  if (b.includes("new")) return "bg-[#2e7d32] text-white"
  return "bg-brand-primary text-white"
}

function ProductCard({
  product,
  solutionId,
}: {
  product: Product
  solutionId: string
}) {
  const discounted = hasDiscount(product)
  const current = discounted ? product.discountPrice! : product.price

  return (
    <div className="group flex flex-col bg-white rounded-[18px] border border-[#ececf4] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(127,133,247,0.18)]">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f0f0ff]">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackBg="#f0f0ff"
        />

        {product.badge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold ${badgeClasses(
              product.badge,
            )}`}
          >
            {product.badge}
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-[#1a1a2e] font-bold text-[14px] sm:text-[15px] leading-snug">
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-[11px] text-[#9496a8] mt-1">SKU: {product.sku}</p>
        )}
        {product.description && (
          <p className="text-[12px] text-[#666] mt-2 leading-relaxed line-clamp-3">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-[#1a1a2e] font-extrabold text-[20px] sm:text-[22px]">
            {formatAUD(current)}
          </span>
          {discounted && (
            <span className="text-[13px] text-[#9496a8] line-through">
              {formatAUD(product.price)}
            </span>
          )}
        </div>

        <Link
          href={`/services/security-solutions/quote?solution=${solutionId}&product=${product.id}`}
          aria-disabled={!product.inStock}
          className={`mt-4 inline-flex items-center justify-center h-[42px] rounded-[8px] text-[13px] font-semibold transition-colors ${
            product.inStock
              ? "bg-brand-primary text-white hover:bg-[#6b71f0]"
              : "bg-[#f0f0f4] text-[#9496a8] pointer-events-none"
          }`}
        >
          {product.inStock ? "Get Quote" : "Unavailable"}
        </Link>
      </div>
    </div>
  )
}

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
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
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
          <ProductCard key={p.id} product={p} solutionId={solutionId} />
        ))}
      </div>
    </div>
  )
}
