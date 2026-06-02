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

  return (
    <div className={alignClass}>
      <h2 className="text-[45px] font-bold uppercase text-[#2f2f2f] leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-[17px] text-[#666666] mt-3">{subtitle}</p>}
    </div>
  )
}
