import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/data/blog"
import { SITE_DOMAIN } from "@/data/site"
import { BlogServiceLinks } from "@/components/seo/InternalLinks"
import type { HubId } from "@/data/internal-links"

// Used when a post has no tags that match a spoke.
const CATEGORY_HUB: Record<string, HubId> = {
  Security: "security",
  "Car Rental": "car-rental",
  "IT & AI": "it",
}

/**
 * Post paragraphs are plain strings; `[anchor text](/internal/path)` inside
 * one becomes an internal link. Only site-relative paths are linked.
 */
const INLINE_LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g

function withLinks(text: string): React.ReactNode {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of Array.from(text.matchAll(INLINE_LINK))) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    out.push(
      <Link
        key={at}
        href={m[2]}
        className="text-accent font-medium underline decoration-current/30 underline-offset-2 hover:text-accent transition-colors"
      >
        {m[1]}
      </Link>
    )
    last = at + m[0].length
  }
  if (last === 0) return text
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image, alt: post.title }],
    },
  }
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post)

  const publishedDate = new Date(post.date)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": `${SITE_DOMAIN}/#business` },
    mainEntityOfPage: `${SITE_DOMAIN}/blog/${post.slug}`,
    ...(isNaN(publishedDate.getTime())
      ? {}
      : { datePublished: publishedDate.toISOString() }),
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-hero on-dark py-16 lg:py-24">
        <div className="relative z-10 mx-auto max-w-[800px] px-4 text-center">
          <nav className="mb-6 flex items-center justify-center gap-2 text-[12px] text-muted">
            <Link href="/" className="inline-block py-1 hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/blog"
              className="inline-block py-1 hover:text-accent transition-colors"
            >
              Blog
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">{post.category}</span>
          </nav>

          <span
            className="inline-block rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
            style={{ background: post.categoryColor }}
          >
            {post.category}
          </span>

          <h1 className="mt-5 text-white">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-muted">
            <span className="font-medium text-white">{post.author}</span>
            <span className="text-muted">{post.authorRole}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* ── FEATURE IMAGE ────────────────────────────────────── */}
      <section className="bg-white on-light">
        <div className="mx-auto max-w-[900px] px-4">
          <div className="relative -mt-12 h-[280px] w-full overflow-hidden rounded-card border border-line shadow-card lg:h-[420px]">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 868px"
              fallbackBg="#eeedfe"
              placeholderText="Article image"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ─────────────────────────────────────── */}
      <article className="bg-white pb-[80px] pt-[50px] on-light">
        <div className="mx-auto max-w-[760px] px-4">
          <p className="mb-8 text-[19px] font-medium leading-relaxed text-[#1a1a2e]">
            {post.excerpt}
          </p>

          {post.content.map((section, i) => (
            <div key={i} className="mb-8">
              {section.heading && (
                <h2 className="mb-4 text-[24px] font-bold text-[#1a1a2e]">
                  {section.heading}
                </h2>
              )}
              {section.body.map((para, j) => (
                <p
                  key={j}
                  className="mb-4 text-[16px] leading-[1.8] text-muted"
                >
                  {withLinks(para)}
                </p>
              ))}
            </div>
          ))}

          <BlogServiceLinks tags={post.tags ?? []} fallbackHub={CATEGORY_HUB[post.category]} />

          {/* author card */}
          <Link
            href="/about#team"
            className="mt-12 flex items-center gap-4 rounded-card border border-line bg-white p-6 hover:border-brand-primary transition-colors on-light"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-[18px] font-bold text-white">
              {post.author
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1a1a2e]">
                {post.author}
              </p>
              <p className="text-[13px] text-muted">{post.authorRole}</p>
            </div>
            <span className="ml-auto text-[13px] font-semibold text-accent">Meet the team</span>
          </Link>
        </div>
      </article>

      {/* ── RELATED POSTS ────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-white on-light py-14 lg:py-20">
          <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center text-[#2f2f2f]">
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-all duration-300 hover:border-brand-primary hover:shadow-card-hover on-light"
                >
                  <div className="relative h-[170px] w-full">
                    <ImageWithFallback
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-200"
                      fallbackBg="#eeedfe"
                      placeholderText="Article image"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                      style={{ background: r.categoryColor }}
                    >
                      {r.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[16px] font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-accent">
                      {r.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
                      Read article
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── QUOTE CTA ────────────────────────────────────────── */}
      <QuoteCTABanner />
    </main>
  )
}
