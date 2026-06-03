"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { securitySolutions } from "@/data/security-solutions"
import ProductRow from "./ProductRow"

export default function ProductsTab() {
  const [activeId, setActiveId] = useState(securitySolutions[0].id)
  const active =
    securitySolutions.find((s) => s.id === activeId) ?? securitySolutions[0]

  return (
    <div>
      {/* How-to note */}
      <div className="bg-[#f0f0ff] border border-[#e0e0ff] rounded-[10px] p-3 mb-4 flex items-start gap-3">
        <Info size={16} className="text-brand-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-medium text-[#1a1a2e]">
            How to update product images
          </p>
          <p className="text-[12px] text-gray-500 mt-1">
            1. Add your image file to the{" "}
            <code className="bg-gray-100 px-1 rounded">
              public/images/products/
            </code>{" "}
            folder in your project. 2. Enter the path in the image field (e.g.
            /images/products/hd-camera.jpg). 3. Click Save. The image updates
            instantly on the live site.
          </p>
        </div>
      </div>

      {/* Solution selector tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {securitySolutions.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`px-4 h-[34px] rounded-full text-[13px] font-medium transition-colors ${
              s.id === activeId
                ? "bg-brand-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-gray-400 uppercase tracking-wide border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Image</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Badge</th>
              <th className="px-4 py-2 font-medium">In Stock</th>
              <th className="px-4 py-2 font-medium">Save</th>
            </tr>
          </thead>
          <tbody>
            {active.products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
