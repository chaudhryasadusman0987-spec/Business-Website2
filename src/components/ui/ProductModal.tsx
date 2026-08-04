"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Phone, X, ZoomIn, ZoomOut } from "lucide-react"
import { formatAUD } from "@/lib/formatters"
import { hasDiscount, type Product } from "@/lib/products"
import { SITE_PHONE } from "@/data/site"

// Detail modal for a Postgres-backed product. Opened from DbProductCard on the
// security solution pages. Left half is a scroll/drag zoomable image, right half
// carries name, SKU, category, price, stock and description plus the quote CTA.
//
// `solutionId` feeds the quote deep-link and must match the value DbProductCard
// already uses (`?solution=<solution.id>`), not the URL slug — the two differ.

const MAX_ZOOM = 4
const MIN_ZOOM = 1

export default function ProductModal({
  product,
  solutionId,
  allProducts,
  onClose,
}: {
  product: Product | null
  solutionId: string
  allProducts: Product[]
  onClose: () => void
}) {
  const [current, setCurrent] = useState<Product | null>(product)
  const [zoom, setZoom] = useState(1)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imageAreaRef = useRef<HTMLDivElement>(null)

  // Reset zoom/pan whenever the modal is pointed at a different product.
  useEffect(() => {
    setCurrent(product)
    setZoom(1)
    setDragOffset({ x: 0, y: 0 })
    setImgLoaded(false)
  }, [product])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Lock background scroll for as long as the modal is mounted.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const applyZoom = useCallback((delta: number) => {
    setZoom((z) => {
      const next = Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM)
      if (next === MIN_ZOOM) setDragOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  // React's synthetic wheel handler is passive, so preventDefault() there warns
  // and the page scrolls anyway. Bind natively with { passive: false } instead.
  useEffect(() => {
    const el = imageAreaRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      applyZoom(e.deltaY < 0 ? 0.3 : -0.3)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [applyZoom, current])

  if (!current) return null

  const p = current
  const index = allProducts.findIndex((x) => x.id === p.id)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < allProducts.length - 1

  const discounted = hasDiscount(p)
  const finalPrice = discounted ? p.discountPrice! : p.price

  const resetZoom = () => {
    setZoom(1)
    setDragOffset({ x: 0, y: 0 })
  }

  const goTo = (next: Product) => {
    setCurrent(next)
    setZoom(1)
    setDragOffset({ x: 0, y: 0 })
    setImgLoaded(false)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const stopDragging = () => setIsDragging(false)

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.name}
        className="relative flex w-full max-w-[860px] max-h-[92vh] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a2e] text-white transition-colors duration-200 hover:bg-brand-primary"
        >
          <X size={15} />
        </button>

        {/* ── Left — zoomable image ── */}
        <div className="flex min-h-[280px] flex-col border-b border-[#eeeeff] bg-[#f8f8ff] lg:min-h-0 lg:w-[45%] lg:border-b-0 lg:border-r">
          <div
            ref={imageAreaRef}
            className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden"
            style={{
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {p.imageUrl ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                  className="max-h-[80%] max-w-[85%] select-none object-contain"
                  style={{
                    transform: `scale(${zoom}) translate(${
                      dragOffset.x / zoom
                    }px, ${dragOffset.y / zoom}px)`,
                    transition: isDragging ? "none" : "transform 0.2s ease",
                    opacity: imgLoaded ? 1 : 0,
                  }}
                />
              </>
            ) : (
              <div className="flex h-[160px] w-[160px] flex-col items-center justify-center rounded-[16px] bg-[#eeedfe] text-[#c5c8fd]">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p className="mt-2 text-[11px]">No image</p>
              </div>
            )}

            {p.badge && (
              <span className="absolute top-3 left-3 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold text-white">
                {p.badge}
              </span>
            )}
            {discounted && (
              <span className="absolute top-3 right-12 rounded-full bg-[#0f6e56] px-3 py-1 text-[10px] font-bold text-white">
                SALE
              </span>
            )}
          </div>

          {p.imageUrl && (
            <div className="flex flex-shrink-0 items-center justify-center gap-3 border-t border-[#eeeeff] py-3">
              <button
                type="button"
                onClick={() => applyZoom(-0.5)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8f0] text-[#666] transition-all hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="min-w-[48px] text-center text-[12px] text-[#9496a8] transition-colors hover:text-brand-primary"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => applyZoom(0.5)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8f0] text-[#666] transition-all hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ZoomIn size={13} />
              </button>
              <span className="text-[10px] text-[#c0c0c8]">scroll to zoom</span>
            </div>
          )}

          {allProducts.length > 1 && index >= 0 && (
            <div className="flex flex-shrink-0 border-t border-[#eeeeff]">
              <button
                type="button"
                onClick={() => hasPrev && goTo(allProducts[index - 1])}
                disabled={!hasPrev}
                className="flex-1 border-r border-[#eeeeff] py-2.5 text-[12px] font-medium text-[#9496a8] transition-colors hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-[11px] text-[#c0c0c8]">
                {index + 1} / {allProducts.length}
              </span>
              <button
                type="button"
                onClick={() => hasNext && goTo(allProducts[index + 1])}
                disabled={!hasNext}
                className="flex-1 border-l border-[#eeeeff] py-2.5 text-[12px] font-medium text-[#9496a8] transition-colors hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* ── Right — details ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <h2 className="mb-4 pr-8 text-[20px] font-bold leading-tight text-[#1a1a2e] lg:text-[24px]">
              {p.name}
            </h2>

            {p.sku && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9496a8]">
                  SKU:
                </span>
                <span className="rounded-[4px] bg-[#f7f7f7] px-2 py-0.5 font-mono text-[13px] text-[#444]">
                  {p.sku}
                </span>
              </div>
            )}

            {p.category && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9496a8]">
                  Category:
                </span>
                <span className="text-[13px] font-semibold text-brand-primary">
                  {p.category}
                </span>
              </div>
            )}

            <div className="mb-4 h-px w-full bg-[#f0f0f8]" />

            <div className="mb-5">
              {discounted ? (
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-[28px] font-extrabold text-[#0f6e56]">
                    {formatAUD(finalPrice)}
                  </span>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[16px] text-[#9496a8] line-through">
                      {formatAUD(p.price)}
                    </span>
                    <span className="rounded-full bg-[#e1f5ee] px-2 py-0.5 text-[11px] font-bold text-[#0f6e56]">
                      Save {formatAUD(p.price - finalPrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[28px] font-extrabold text-[#1a1a2e]">
                  {formatAUD(p.price)}
                </span>
              )}
            </div>

            <div className="mb-5 flex items-center gap-2">
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${
                  p.inStock ? "bg-[#0f6e56]" : "bg-red-400"
                }`}
              />
              <span
                className={`text-[13px] font-medium ${
                  p.inStock ? "text-[#0f6e56]" : "text-red-500"
                }`}
              >
                {p.inStock ? "In Stock" : "Currently Out of Stock"}
              </span>
            </div>

            {p.description && (
              <>
                <div className="mb-4 h-px w-full bg-[#f0f0f8]" />
                <div className="mb-2">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9496a8]">
                    Description
                  </h3>
                  <p className="text-[14px] leading-[1.8] text-[#444]">
                    {p.description}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-shrink-0 flex-col gap-2.5 border-t border-[#f0f0f8] p-5">
            <a
              href={`/services/security-solutions/quote?solution=${solutionId}&product=${p.id}`}
              className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-bold transition-all duration-200 ${
                p.inStock
                  ? "bg-brand-primary text-white hover:bg-[#6b71f0]"
                  : "pointer-events-none bg-[#f0f0f4] text-[#9496a8]"
              }`}
              aria-disabled={!p.inStock}
            >
              {p.inStock ? "Get a Quote" : "Currently Unavailable"}
            </a>
            <a
              href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border-2 border-[#e8e8f0] text-[14px] font-semibold text-[#1a1a2e] transition-all duration-200 hover:border-brand-primary hover:text-brand-primary"
            >
              <Phone size={15} />
              Call {SITE_PHONE}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
