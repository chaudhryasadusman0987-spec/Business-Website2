import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"

interface ServiceCardProps {
  href: string
  title: string
  description: string
  /**
   * What the link is about — keyword anchor text. The link reads
   * "Learn more about {linkTopic}"; on phones only "Learn more →" is shown and
   * the rest stays in the link for search engines and screen readers.
   */
  linkTopic: string
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
  /** Fill the card with brand purple on hover, text turning white. */
  hoverFill?: boolean
}

// The one service card: used by the homepage grid and the hub pages. The whole
// card is clickable through the stretched link, so there is a single link per
// card with descriptive anchor text.
export default function ServiceCard({
  href,
  title,
  description,
  linkTopic,
  image,
  imageAlt,
  imageFit = "cover",
  fallbackIcon,
  fallbackBg,
  tagline,
  children,
  hoverFill = false,
}: ServiceCardProps) {
  // With hoverFill the whole card turns brand purple and its text white.
  const fill = hoverFill
  const onFill = fill ? " transition-colors duration-200 group-hover:text-white" : ""
  return (
    <article
      className={`card card-hover group relative flex h-full w-full flex-col overflow-hidden ${
        fill
          ? "transition-[transform,box-shadow,background-color,border-color] hover:border-brand-primary hover:bg-brand-primary"
          : ""
      }`}
    >
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
        <h3 className={`text-ink${onFill}`}>{title}</h3>
        {tagline && <p className={`mt-1 text-[13px] font-semibold text-accent${onFill}`}>{tagline}</p>}
        {/* No line clamp: descriptions are written to fit, never cut mid-word. */}
        <p className={`mt-2 text-[15px] leading-[1.6] text-muted${onFill}`}>{description}</p>
        {children}
        <p className="mt-auto pt-5">
          {/* Inline, so the arrow always sits right after the last word. */}
          <Link
            href={href}
            className={`inline-block min-h-[24px] text-[15px] font-semibold text-accent after:absolute after:inset-0 after:content-['']${onFill}`}
          >
            <span className="underline-offset-4 group-hover:underline">
              Learn more
              <span className="sr-only sm:not-sr-only"> about {linkTopic}</span>
            </span>
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="ml-1.5 inline-block align-[-3px] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </p>
      </div>
    </article>
  )
}
