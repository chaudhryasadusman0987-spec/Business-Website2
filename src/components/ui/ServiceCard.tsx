import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"

interface ServiceCardProps {
  href: string
  title: string
  description: string
  /** Text of the link at the bottom — keyword anchor text, not "Learn more". */
  linkLabel: string
  image?: string
  imageAlt?: string
  /** `contain` for product cut-outs on white; `cover` for photos. */
  imageFit?: "cover" | "contain"
  fallbackIcon?: string
  fallbackBg?: string
  /** Small purple line between the title and the description. */
  tagline?: string
  /** Extra content under the description (e.g. a live availability badge). */
  children?: ReactNode
}

// The one service card: used by the homepage grid and the hub pages. The whole
// card is clickable through the stretched link on the title, so there is a
// single link per card with descriptive anchor text.
export default function ServiceCard({
  href,
  title,
  description,
  linkLabel,
  image,
  imageAlt,
  imageFit = "cover",
  fallbackIcon,
  fallbackBg,
  tagline,
  children,
}: ServiceCardProps) {
  return (
    <article className="card card-hover group relative flex h-full w-full flex-col overflow-hidden">
      {image && (
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface">
          <ImageWithFallback
            src={image}
            alt={imageAlt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
            className={imageFit === "contain" ? "object-contain p-4" : "object-cover"}
            fallbackIcon={fallbackIcon}
            fallbackBg={fallbackBg}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-ink">{title}</h3>
        {tagline && <p className="mt-1 text-[13px] font-semibold text-accent">{tagline}</p>}
        <p className="mt-2 line-clamp-2 text-[15px] leading-[1.6] text-muted">{description}</p>
        {children}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-semibold text-accent after:absolute after:inset-0 after:content-['']"
        >
          <span className="underline-offset-4 group-hover:underline">{linkLabel}</span>
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </div>
    </article>
  )
}
