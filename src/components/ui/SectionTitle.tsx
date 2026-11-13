import AnimateIn from "@/components/ui/AnimateIn"

interface SectionTitleProps {
  title: string
  subtitle?: string
  /** Small purple label above the heading. */
  eyebrow?: string
  align?: "center" | "left"
}

export default function SectionTitle({
  title,
  subtitle,
  eyebrow,
  align = "center",
}: SectionTitleProps) {
  const center = align === "center"

  // Wrapped here rather than at each call site so every section heading on the
  // site reveals on scroll without touching a dozen files. Size, weight and
  // line-height come from the h2 base style in globals.css.
  return (
    <AnimateIn animation="fade-up" className={center ? "text-center" : "text-left"}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-ink [.on-dark_&]:text-white">{title}</h2>
      {subtitle && (
        <p className={`lead mt-4 ${center ? "mx-auto" : ""}`}>{subtitle}</p>
      )}
    </AnimateIn>
  )
}
