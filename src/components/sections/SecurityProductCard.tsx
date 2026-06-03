import Link from "next/link"
import { SolutionIcon } from "@/lib/solution-icons"
import { formatAUD } from "@/lib/formatters"
import type { SecurityProduct, SecuritySolution } from "@/data/security-solutions"

interface SecurityProductCardProps {
  product: SecurityProduct
  solution: Pick<SecuritySolution, "id" | "icon">
}

// Zlymo "cameras_text" card style — shared by the [slug] detail page
// and the all-products overview page.
export default function SecurityProductCard({
  product,
  solution,
}: SecurityProductCardProps) {
  return (
    <div className="relative">
      <div
        className={`group bg-[#f7f7f7] rounded-[80px] py-[90px] px-8 text-center cursor-pointer transition-all duration-500 hover:bg-[#7f85f7] ${
          !product.inStock ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex justify-center">
          <SolutionIcon
            name={solution.icon}
            size={80}
            className="text-brand-primary group-hover:text-white transition-colors duration-500"
          />
        </div>

        <p className="text-brand-primary group-hover:text-white font-medium mt-6 transition-colors duration-500">
          Price
        </p>

        <p className="text-[28px] font-bold text-[#363636] group-hover:text-white transition-colors duration-500">
          {formatAUD(product.price)}
        </p>

        <p className="text-[12px] text-gray-400 group-hover:text-white/70 mt-1 transition-colors duration-500">
          {product.unit}
        </p>

        <h3 className="font-bold text-[18px] text-[#363636] group-hover:text-white mt-3 transition-colors duration-500">
          {product.name}
        </h3>

        <p className="text-[13px] text-gray-500 mt-2 px-2 group-hover:text-white/80 transition-colors duration-500">
          {product.description}
        </p>

        <Link
          href={`/services/security-solutions/quote?solution=${solution.id}&product=${product.id}`}
          className="inline-block mt-8 bg-[#2d2d2c] text-[#dee4fd] px-8 h-[42px] leading-[42px] rounded-[5px] text-[14px] group-hover:bg-white group-hover:text-[#2d2d2c] transition-all duration-500"
        >
          Get Quote
        </Link>
      </div>

      {!product.inStock && (
        <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#e53935] text-white text-[12px] font-medium rounded-full px-4 py-1">
          Out of Stock
        </span>
      )}
    </div>
  )
}
