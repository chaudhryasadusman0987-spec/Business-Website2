import Link from "next/link"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { formatAUD } from "@/lib/formatters"
import type { SecurityProduct, SecuritySolution } from "@/data/security-solutions"

interface SecurityProductCardProps {
  product: SecurityProduct
  solution: Pick<SecuritySolution, "id">
}

// Zlymo "cameras_text" card style — now with a real product image at the top.
// Shared by the [slug] detail page and the all-products overview page.
export default function SecurityProductCard({
  product,
  solution,
}: SecurityProductCardProps) {
  return (
    <div className="group bg-brand-card rounded-[80px] overflow-hidden text-center cursor-pointer transition-all duration-500 hover:bg-brand-primary hover:-translate-y-2">
      {/* Product image at top */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackBg="#f0f0ff"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/30 transition-all duration-500" />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-brand-primary text-white group-hover:bg-white group-hover:text-brand-primary rounded-full px-3 py-1 text-[10px] font-bold transition-all duration-500">
            {product.badge}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-6 pb-10 pt-6">
        <p className="text-brand-primary font-medium group-hover:text-white transition-colors duration-500 leading-tight">
          Price
          <br />
          <span className="text-[#363636] font-bold text-[26px] group-hover:text-white transition-colors duration-500">
            {formatAUD(product.price)}
          </span>
        </p>
        <p className="text-[11px] text-gray-400 group-hover:text-white/70 mt-1 transition-colors duration-500">
          {product.unit}
        </p>
        <h3 className="text-[#363636] font-bold text-[16px] mt-3 group-hover:text-white transition-colors duration-500">
          {product.name}
        </h3>
        <p className="text-gray-500 text-[12px] mt-2 leading-relaxed group-hover:text-white/80 transition-colors duration-500">
          {product.description}
        </p>
        <Link
          href={`/services/security-solutions/quote?solution=${solution.id}&product=${product.id}`}
          className="inline-block mt-6 bg-brand-dark text-brand-text px-8 h-[40px] leading-[40px] rounded-[5px] text-[13px] group-hover:bg-white group-hover:text-brand-dark transition-all duration-500"
        >
          Get Quote
        </Link>
      </div>
    </div>
  )
}
