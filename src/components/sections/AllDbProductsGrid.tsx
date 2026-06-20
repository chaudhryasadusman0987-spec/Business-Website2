"use client"

import { useEffect, useState } from "react"
import SectionTitle from "@/components/ui/SectionTitle"
import DbProductCard from "./DbProductCard"
import { securitySolutions } from "@/data/security-solutions"
import type { Product } from "@/lib/products"

// DB-backed grid for the All Security Products page. Fetches every product
// (no slug filter) and groups them by solution, keeping the static solution
// order. Mirrors DbProductsGrid so dashboard edits show live here too.
export default function AllDbProductsGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/products", { cache: "no-store" })
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
  }, [])

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
    <>
      {securitySolutions.map((solution) => {
        const items = products.filter((p) => p.solutionSlug === solution.slug)
        if (items.length === 0) return null
        return (
          <div key={solution.id} className="mb-20 last:mb-0">
            <SectionTitle title={solution.name} subtitle={solution.tagline} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
              {items.map((p) => (
                <DbProductCard key={p.id} product={p} solutionId={solution.id} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
