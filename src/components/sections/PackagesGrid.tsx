"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { formatAUD } from "@/lib/formatters"

interface PackageItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface DbPackage {
  id: string
  name: string
  brand: string
  solutionSlug: string
  description: string
  image: string
  badge: string
  items: PackageItem[]
  packagePrice: number
  totalUnits: number
}

/**
 * "Complete Packages" section shown above the individual product grid on a
 * solution page. A client component (like DbProductsGrid) rather than a
 * server-side read in the page — the [slug] page is statically generated at
 * build time, so a package the owner adds later in the dashboard would not
 * appear until the next redeploy if it were fetched there instead.
 */
export default function PackagesGrid({ slug }: { slug: string }) {
  const [packages, setPackages] = useState<DbPackage[]>([])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/packages?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPackages(data.packages || [])
      })
      .catch(() => {
        /* section just stays hidden */
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (packages.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[24px]">📦</span>
        <h2 className="font-bold text-[24px] text-[#1a1a2e]">Complete Packages</h2>
      </div>
      <p className="text-[13px] text-[#666] mb-6">
        Save with our pre-configured bundles — everything you need in one package.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border-2 border-[#7f85f7] rounded-[20px] overflow-hidden relative"
          >
            {pkg.badge && (
              <div className="absolute top-4 right-4 bg-[#7f85f7] text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10">
                {pkg.badge}
              </div>
            )}

            {pkg.image && (
              <div className="h-[180px] bg-[#f0f0ff] relative">
                <ImageWithFallback
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  fallbackBg="#f0f0ff"
                />
              </div>
            )}

            <div className="p-6">
              {pkg.brand && (
                <p className="text-[#7f85f7] text-[11px] font-bold uppercase tracking-wider mb-2">
                  {pkg.brand} Complete Kit
                </p>
              )}
              <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-2">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
                  {pkg.description}
                </p>
              )}

              <div className="bg-[#f8f8ff] rounded-[12px] p-4 mb-4">
                <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-2">
                  What&apos;s Included
                </p>
                {pkg.items.map((item) => (
                  <p key={item.productId} className="text-[13px] text-[#444] py-0.5">
                    ✓ {item.quantity}× {item.productName}
                  </p>
                ))}
                <p className="text-[13px] text-[#444] py-0.5 border-t border-[#e0e0f0] mt-2 pt-2">
                  ✓ Professional installation ({pkg.totalUnits} units)
                </p>
              </div>

              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[11px] text-[#9496a8]">Package price</p>
                  <p className="font-extrabold text-[28px] text-[#0f6e56]">
                    {formatAUD(pkg.packagePrice)}
                  </p>
                </div>
                <p className="text-[11px] text-[#9496a8]">GST additional</p>
              </div>

              <Link
                href={`/services/security-solutions/quote?package=${pkg.id}`}
                className="block w-full bg-[#7f85f7] text-white rounded-[10px] h-[48px] leading-[48px] text-center font-semibold text-[14px] hover:bg-[#6b71f0] transition-all"
              >
                Get This Package →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-[#e8e8f0]" />
        <p className="text-[12px] font-semibold text-[#9496a8] uppercase tracking-wider">
          Or Build Your Own
        </p>
        <div className="flex-1 h-px bg-[#e8e8f0]" />
      </div>
    </div>
  )
}
