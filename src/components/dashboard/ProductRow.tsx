"use client"

import { useState } from "react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import type { SecurityProduct } from "@/data/security-solutions"

export default function ProductRow({ product }: { product: SecurityProduct }) {
  const [inStock, setInStock] = useState(product.inStock)

  return (
    <tr className="border-b border-gray-100">
      {/* Image column */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              fallbackBg="#f0f0ff"
            />
          </div>
          <input
            type="text"
            defaultValue={product.image}
            placeholder="/images/products/name.jpg"
            className="w-[120px] text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </td>

      {/* Name column */}
      <td className="px-4 py-3">
        <p className="font-medium text-[14px] text-[#1a1a2e]">{product.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{product.unit}</p>
      </td>

      {/* Price column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[13px]">$</span>
          <input
            type="number"
            defaultValue={product.price}
            className="w-[80px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[14px] font-semibold text-brand-primary focus:outline-none focus:border-brand-primary"
          />
        </div>
      </td>

      {/* Badge column */}
      <td className="px-4 py-3">
        <input
          type="text"
          defaultValue={product.badge ?? ""}
          placeholder="e.g. Best Seller"
          className="w-[100px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[12px] focus:outline-none focus:border-brand-primary"
        />
      </td>

      {/* In Stock toggle */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => setInStock((v) => !v)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={`w-10 h-5 rounded-full transition-colors ${
              inStock ? "bg-brand-primary" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${
                inStock ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[12px] text-gray-500">
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </button>
      </td>

      {/* Save button */}
      <td className="px-4 py-3">
        {/* TODO(dashboard): wire to API route that updates security-solutions.ts */}
        <button className="bg-brand-primary text-white rounded-[6px] px-4 h-[32px] text-[12px] font-medium hover:bg-[#6b71f0] transition-colors">
          Save
        </button>
      </td>
    </tr>
  )
}
