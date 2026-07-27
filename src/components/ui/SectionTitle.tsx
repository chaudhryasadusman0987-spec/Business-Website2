import AnimateIn from "@/components/ui/AnimateIn"

interface SectionTitleProps {
  title: string
  subtitle?: string
  align?: "center" | "left"
}

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center" : "text-left"

  // Wrapped here rather than at each call site so every section heading on the
  // site reveals on scroll without touching a dozen files.
  return (
    <AnimateIn animation="fade-up" className={alignClass}>
      <h2 className="text-[45px] font-bold uppercase text-[#2f2f2f] leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-[17px] text-[#666666] mt-3">{subtitle}</p>}
    </AnimateIn>
  )
}
