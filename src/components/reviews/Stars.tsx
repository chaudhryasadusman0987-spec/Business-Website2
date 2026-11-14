// Five stars, filled to the rating (fractions supported for the average).
export default function Stars({
  rating,
  size = 18,
  className = "",
}: {
  rating: number
  size?: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100))
  const row = (color: string) => (
    <span className="flex" style={{ color }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
        </svg>
      ))}
    </span>
  )
  // w-fit + self-start: inside a flex column the row would otherwise stretch
  // to full width, and the % overlay would then fill every star.
  return (
    <span
      role="img"
      aria-label={`${rating.toFixed(1).replace(/\.0$/, "")} out of 5 stars`}
      className={`relative inline-flex w-fit self-start ${className}`}
    >
      {row("#d8dbe3")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("#f5a623")}
      </span>
    </span>
  )
}
