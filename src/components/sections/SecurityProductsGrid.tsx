"use client"

import { useEffect, useState } from "react"
import SecurityProductCard from "./SecurityProductCard"
import {
  mergeSecurityProducts,
  normaliseOverrides,
  type SecurityProduct,
} from "@/lib/catalog"

// Client grid for a security solution's products. Renders the static products
// immediately (SSG / no flash), then fetches admin overrides from /api/catalog
// and merges in any added / edited / removed items so the live site reflects
// dashboard changes without a redeploy.
export default function SecurityProductsGrid({
  solutionId,
  initial,
}: {
  solutionId: string
  initial: SecurityProduct[]
}) {
  const [products, setProducts] = useState<SecurityProduct[]>(initial)

  useEffect(() => {
    let cancelled = false
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setProducts(
          mergeSecurityProducts(solutionId, initial, normaliseOverrides(data)),
        )
      })
      .catch(() => {
        /* keep static products on error */
      })
    return () => {
      cancelled = true
    }
    // `initial` is stable (server-rendered once); re-run only if the solution changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solutionId])

  if (products.length === 0) {
    return (
      <p className="mt-14 text-center text-[15px] text-[#9496a8]">
        No products available right now. Please check back soon.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
      {products.map((product) => (
        <SecurityProductCard
          key={product.id}
          product={product}
          solution={{ id: solutionId }}
        />
      ))}
    </div>
  )
}
