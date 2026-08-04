"use client"

import Link from "next/link"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { formatAUD } from "@/lib/formatters"
import { hasDiscount, type Product } from "@/lib/products"

// Single card for a Postgres-backed product. Shared by DbProductsGrid (one
// solution) and AllDbProductsGrid (every solution on the All Products page).

function badgeClasses(badge: string): string {
  const b = badge.toLowerCase()
  if (b.includes("sale")) return "bg-[#c62828] text-white"
  if (b.includes("soon")) return "bg-[#1a1a2e] text-white"
  if (b.includes("new")) return "bg-[#2e7d32] text-white"
  return "bg-brand-primary text-white"
}

export default function DbProductCard({
  product,
  solutionId,
  onOpenDetails,
}: {
  product: Product
  solutionId: string
  /** When passed, the card becomes clickable and opens the detail modal. */
  onOpenDetails?: (product: Product) => void
}) {
  const discounted = hasDiscount(product)
  const current = discounted ? product.discountPrice! : product.price
  const clickable = Boolean(onOpenDetails)

  return (
    <div
      onClick={onOpenDetails ? () => onOpenDetails(product) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        onOpenDetails
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOpenDetails(product)
              }
            }
          : undefined
      }
      className={`group flex flex-col bg-white rounded-[18px] border border-[#ececf4] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(127,133,247,0.18)]${
        clickable ? " cursor-pointer" : ""
      }`}
    >
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

        {/* Hover hint that the card opens a detail view */}
        {clickable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7f85f7"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
          </div>
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
          onClick={(e) => e.stopPropagation()}
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
