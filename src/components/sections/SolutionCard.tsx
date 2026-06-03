import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SolutionIcon } from "@/lib/solution-icons"
import type { SecuritySolution } from "@/data/security-solutions"

// Landing-page grid card. Data-driven colours come from the solution record,
// so they are passed as CSS variables (--ibg / --ic) rather than inline
// colours — that lets the Zlymo group-hover state still override them.
export default function SolutionCard({
  solution,
}: {
  solution: SecuritySolution
}) {
  return (
    <Link
      href={`/services/security-solutions/${solution.slug}`}
      className="group relative block bg-[#f7f7f7] rounded-[40px] p-10 text-center cursor-pointer transition-all duration-500 hover:bg-[#7f85f7] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(127,133,247,0.3)]"
    >
      <div
        className="w-16 h-16 rounded-[16px] mx-auto mb-5 flex items-center justify-center [background-color:var(--ibg)] group-hover:bg-white/20 transition-all duration-500"
        style={{ "--ibg": solution.iconBg } as React.CSSProperties}
      >
        <span
          className="flex [color:var(--ic)] group-hover:text-white transition-colors duration-500"
          style={{ "--ic": solution.iconColor } as React.CSSProperties}
        >
          <SolutionIcon name={solution.icon} size={32} />
        </span>
      </div>

      <h3 className="font-bold text-[20px] text-[#1a1a2e] group-hover:text-white transition-colors duration-500 mt-2">
        {solution.name}
      </h3>

      <p className="text-brand-primary font-medium text-[13px] mt-1 group-hover:text-white/80 transition-colors duration-500">
        {solution.tagline}
      </p>

      <p className="text-[14px] text-gray-500 mt-3 leading-relaxed group-hover:text-white/80 transition-colors duration-500">
        {solution.description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 bg-white/60 group-hover:bg-white/20 rounded-full px-3 py-1 text-[12px] text-gray-600 group-hover:text-white transition-all duration-500">
        {solution.products.length} products available
      </span>

      <ArrowRight
        size={18}
        className="absolute bottom-6 right-6 text-gray-300 group-hover:text-white/60 transition-colors duration-500"
      />
    </Link>
  )
}
