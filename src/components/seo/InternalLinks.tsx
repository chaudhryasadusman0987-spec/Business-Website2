import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import JsonLd, { breadcrumbJsonLd } from "@/components/seo/JsonLd"
import {
  hubs,
  hubIntros,
  hubAnchor,
  anchorFor,
  seedOf,
  hrefFrom,
  getSpoke,
  relatedSpokes,
  blogServiceLinks,
  postsForTags,
  hubTags,
  type HubId,
  type Spoke,
} from "@/data/internal-links"

// Building blocks for the hub & spoke internal-linking structure defined in
// src/data/internal-links.ts. Each one only adds links in the site's existing
// visual language — none of them restyle the page they sit on.

const DARK_LINK =
  "text-accent underline decoration-[#a5a8ff]/40 underline-offset-2 hover:text-white transition-colors"
const LIGHT_LINK =
  "text-accent font-medium underline decoration-current/30 underline-offset-2 hover:text-accent transition-colors"

/**
 * The up-link sentence a spoke appends to its first paragraph:
 * " Part of our <CCTV installation in Brisbane> service." Renders inline, so
 * drop it inside the existing <p>.
 */
export function HubLink({
  spoke,
  tone = "dark",
}: {
  spoke: Spoke | undefined
  tone?: "dark" | "light"
}) {
  if (!spoke?.upLink) return null
  const hub = hubs[spoke.hub]
  return (
    <>
      {" "}
      {spoke.upLink.lead}{" "}
      <Link href={hub.href} className={tone === "dark" ? DARK_LINK : LIGHT_LINK}>
        {hubAnchor(spoke.hub, spoke.upLink.anchor)}
      </Link>
      {spoke.upLink.tail}
    </>
  )
}

/** Hub paragraph that links to every one of its spokes once, in text. */
export function HubIntro({
  hub,
  tone = "light",
  className = "",
}: {
  hub: HubId
  tone?: "dark" | "light"
  className?: string
}) {
  const linkClass = tone === "dark" ? DARK_LINK : LIGHT_LINK
  return (
    <p className={className}>
      {hubIntros[hub].map((seg, i) => {
        if (typeof seg === "string") return <span key={i}>{seg}</span>
        const s = getSpoke(seg.spoke)
        if (!s) return null
        const text = anchorFor(s, seg.anchor ?? 0)
        const href = hrefFrom(s.href, hubs[hub].href)
        if (!href) return <span key={i}>{text}</span>
        return href.startsWith("#") ? (
          <a key={i} href={href} className={linkClass}>
            {text}
          </a>
        ) : (
          <Link key={i} href={href} className={linkClass}>
            {text}
          </Link>
        )
      })}
    </p>
  )
}

/** Homepage sentence linking all three hubs with their primary keyword anchor. */
export function HomeHubLinks({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      From{" "}
      <Link href={hubs.security.href} className={LIGHT_LINK}>
        {hubAnchor("security")}
      </Link>{" "}
      and{" "}
      <Link href={hubs["car-rental"].href} className={LIGHT_LINK}>
        {hubAnchor("car-rental")}
      </Link>{" "}
      to{" "}
      <Link href={hubs.it.href} className={LIGHT_LINK}>
        {hubAnchor("it")}
      </Link>{" "}
      — one local team, one phone number.
    </p>
  )
}

/** Compact link card — same white/border/radius as the area-page focus cards. */
function SpokeCard({ spoke, variant = 0 }: { spoke: Spoke; variant?: number }) {
  const label = anchorFor(spoke, variant)
  return (
    <Link
      href={spoke.href}
      className="group flex h-full flex-col bg-white border border-line rounded-card p-6 text-left hover:border-brand-primary hover:shadow-card-hover transition-all duration-300 on-light"
    >
      <h3 className="font-bold text-[17px] text-[#1a1a2e] group-hover:text-accent transition-colors">
        {spoke.name}
      </h3>
      <p className="text-[14px] text-muted mt-2 leading-relaxed flex-1">{spoke.blurb}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
        {label.charAt(0).toUpperCase() + label.slice(1)}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

/** Cards for hub spokes that don't already have a card on the hub page. */
export function SpokeCards({ ids, className = "" }: { ids: string[]; className?: string }) {
  const list = ids.map(getSpoke).filter((s): s is Spoke => Boolean(s))
  if (list.length === 0) return null
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${className}`}>
      {list.map((s, i) => (
        <SpokeCard key={s.id} spoke={s} variant={i} />
      ))}
    </div>
  )
}

/** One-line "From the blog" links to posts whose tags match. */
export function FromTheBlog({
  tags,
  className = "",
}: {
  tags: string[]
  className?: string
}) {
  const posts = postsForTags(tags)
  if (posts.length === 0) return null
  return (
    <p className={`text-[14px] text-muted leading-[1.8] ${className}`}>
      From the blog:{" "}
      {posts.map((p, i) => (
        <span key={p.slug}>
          {i > 0 && " · "}
          <Link href={`/blog/${p.slug}`} className={LIGHT_LINK}>
            {p.title}
          </Link>
        </span>
      ))}
    </p>
  )
}

/** Hub version: matches on the tags of all the hub's spokes. */
export function HubBlogLinks({ hub, className = "" }: { hub: HubId; className?: string }) {
  return <FromTheBlog tags={hubTags(hub)} className={className} />
}

/**
 * "Related services" block for the bottom of a spoke: 2–3 sibling cards plus
 * a quote CTA pointing at the hub's own quote form.
 */
export function RelatedServices({
  spoke,
  className = "bg-white py-[60px] on-light",
}: {
  spoke: Spoke | undefined
  className?: string
}) {
  if (!spoke) return null
  // 2–3 siblings for most spokes; suburb pages carry 4 (CCTV, packages and
  // the two nearest areas), so the list is taken as defined.
  const siblings = relatedSpokes(spoke.id).filter((s) => s.href.split("#")[0] !== spoke.href)
  const hub = hubs[spoke.hub]
  const seed = seedOf(spoke.id)
  // On the page the CTA points at (fleet → application), jump in-page instead.
  const ctaHref =
    hub.quoteHref === spoke.href && hub.quoteAnchor ? `#${hub.quoteAnchor}` : hub.quoteHref
  return (
    <section className={className}>
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-bold text-[24px] text-[#1a1a2e] text-center mb-8">
          Related services
        </h2>
        {siblings.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-6 ${
              siblings.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : siblings.length === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2 max-w-[780px] mx-auto"
            }`}
          >
            {siblings.map((s, i) => (
              <SpokeCard key={s.id} spoke={s} variant={seed + i} />
            ))}
          </div>
        )}
        <FromTheBlog tags={spoke.tags} className="mt-8 text-center" />
        <div className="mt-10 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold rounded-btn h-12 px-8 hover:bg-brand-hover transition-all"
          >
            {hub.quoteLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/**
 * Visual breadcrumb (Home › Hub › Spoke) plus BreadcrumbList JSON-LD. For
 * pages that didn't have a breadcrumb yet; pages that already render their
 * own nav keep it and only add the JSON-LD.
 */
export function Breadcrumbs({
  crumbs,
  tone = "dark",
  className = "mb-4",
}: {
  crumbs: [string, string][]
  tone?: "dark" | "light"
  className?: string
}) {
  const last = crumbs.length - 1
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav
        aria-label="Breadcrumb"
        className={`flex flex-wrap items-center gap-2 text-[12px] ${
          tone === "dark" ? "text-muted" : "text-muted"
        } ${className}`}
      >
        {crumbs.map(([name, href], i) => (
          <span key={href} className="inline-flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} />}
            {i === last ? (
              <span className={tone === "dark" ? "text-muted" : "text-muted"}>{name}</span>
            ) : (
              <Link href={href} className="inline-flex min-h-[44px] items-center hover:text-accent transition-colors">
                {name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}

/** Blog: 1 hub + up to 2 spokes chosen from the post's tags. */
export function BlogServiceLinks({
  tags,
  fallbackHub,
}: {
  tags: string[]
  fallbackHub?: HubId
}) {
  const picked = blogServiceLinks(tags, fallbackHub)
  if (!picked) return null
  const { hub, spokes } = picked
  return (
    <div className="mt-12 rounded-card border border-line bg-surface p-6 on-light">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
        Related services
      </p>
      <p className="mt-2 text-[15px] leading-[1.8] text-muted">
        Need a hand with this? See our{" "}
        <Link href={hub.href} className={LIGHT_LINK}>
          {hubAnchor(hub.id, 1)}
        </Link>
        {spokes.map((s, i) => (
          <span key={s.id}>
            {i === spokes.length - 1 ? " and " : ", "}
            <Link href={s.href} className={LIGHT_LINK}>
              {anchorFor(s, i)}
            </Link>
          </span>
        ))}
        .
      </p>
    </div>
  )
}
