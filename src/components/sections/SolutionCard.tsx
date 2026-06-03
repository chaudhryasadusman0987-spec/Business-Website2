import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import type { SecuritySolution } from "@/data/security-solutions"

// Landing-page grid card — Zlymo hover, with an image strip at the top.
export default function SolutionCard({
  solution,
}: {
  solution: SecuritySolution
}) {
  return (
    <Link
      href={`/services/security-solutions/${solution.slug}`}
      className="group relative block bg-brand-card rounded-[40px] overflow-hidden cursor-pointer transition-all duration-500 hover:bg-brand-primary hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(127,133,247,0.3)]"
    >
      {/* Image strip at top */}
      <div className="relative w-full h-[140px] overflow-hidden">
        <ImageWithFallback
          src={solution.heroImage}
          alt={solution.heroImageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackBg={solution.iconBg}
        />
        <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/40 transition-all duration-500" />
      </div>

      {/* Card content below image */}
      <div className="p-8 text-center">
        <h3 className="font-bold text-[18px] text-[#1a1a2e] group-hover:text-white transition-colors duration-500">
          {solution.name}
        </h3>
        <p className="text-brand-primary font-medium text-[12px] mt-1 group-hover:text-white/80 transition-colors duration-500">
          {solution.tagline}
        </p>
        <p className="text-[13px] text-gray-500 mt-3 leading-relaxed group-hover:text-white/80 transition-colors duration-500">
          {solution.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 bg-white/60 group-hover:bg-white/20 rounded-full px-3 py-1 text-[12px] text-gray-600 group-hover:text-white transition-all duration-500">
          {solution.products.length} products available
        </span>
      </div>

      <ArrowRight
        size={16}
        className="absolute bottom-5 right-5 text-gray-300 group-hover:text-white/60 transition-colors duration-500"
      />
    </Link>
  )
}
