"use client"

interface PackageItem {
  productId: string
  productName: string
  quantity: number
  unitPrice?: number
  image?: string
}

interface CollageProduct {
  id: string
  imageUrl?: string
  image?: string
}

interface Props {
  items: PackageItem[]
  allProducts: CollageProduct[]
  className?: string
}

/**
 * Auto-built package hero image — tiles the images of the products included
 * in a package (repeated per quantity, capped at 6) instead of requiring the
 * owner to upload one manual photo. Used on both the public package card
 * (PackagesGrid) and the dashboard package builder's live preview
 * (PackagesDbTab), which is why product image lookup checks both `imageUrl`
 * (the Postgres products shape) and `image` (the vehicles/legacy shape).
 */
export default function PackageImageCollage({ items, allProducts, className = "" }: Props) {
  const imageTiles: { src: string; label: string }[] = []

  items.forEach((item) => {
    const product = allProducts.find((p) => p.id === item.productId)
    const src = product?.imageUrl || product?.image || item.image || ""
    if (!src) return
    const repeatCount = Math.min(item.quantity, 4)
    for (let i = 0; i < repeatCount; i++) {
      imageTiles.push({ src, label: item.productName })
    }
  })

  const capped = imageTiles.slice(0, 6)
  const overflow = imageTiles.length - capped.length

  if (capped.length === 0) {
    return (
      <div className={`bg-[#f0f0ff] flex items-center justify-center ${className}`}>
        <span className="text-[#c5c8fd] text-[13px]">No product images yet</span>
      </div>
    )
  }

  return (
    <div
      className={`relative bg-gradient-to-b from-[#0d0d1a] to-[#1a1a2e] overflow-hidden flex items-center justify-center gap-3 px-4 ${className}`}
    >
      {capped.map((tile, i) => (
        <div
          key={i}
          className="relative flex-shrink-0 rounded-[10px] overflow-hidden bg-white/5 border border-white/10"
          style={{
            width: capped.length <= 3 ? "110px" : "80px",
            height: capped.length <= 3 ? "110px" : "80px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.src}
            alt={tile.label}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex-shrink-0 rounded-[10px] bg-white/10 border border-white/10 flex items-center justify-center w-[80px] h-[80px]">
          <span className="text-white font-bold text-[16px]">+{overflow}</span>
        </div>
      )}
    </div>
  )
}
