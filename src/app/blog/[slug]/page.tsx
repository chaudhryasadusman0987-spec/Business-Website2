import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/data/blog"
import { SITE_FULL } from "@/data/site"

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
    title: `${post.title} | ${SITE_FULL}`,
    description: post.excerpt,
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

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] py-20">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[800px] px-4 text-center">
          <nav className="mb-6 flex items-center justify-center gap-2 text-[12px] text-[#666880]">
            <Link href="/" className="hover:text-[#7f85f7] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/blog"
              className="hover:text-[#7f85f7] transition-colors"
            >
              Blog
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#9496a8]">{post.category}</span>
          </nav>

          <span
            className="inline-block rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
            style={{ background: post.categoryColor }}
          >
            {post.category}
          </span>

          <h1 className="mt-5 text-[32px] font-extrabold leading-tight text-white lg:text-[44px]">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-[#9496a8]">
            <span className="font-medium text-white">{post.author}</span>
            <span className="text-[#666880]">{post.authorRole}</span>
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
      <section className="bg-[#fefefd]">
        <div className="mx-auto max-w-[900px] px-4">
          <div className="relative -mt-12 h-[280px] w-full overflow-hidden rounded-[24px] border border-[#e8e8f0] shadow-[0_8px_30px_rgba(13,13,26,0.15)] lg:h-[420px]">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              fallbackBg="#eeedfe"
              placeholderText="Article image"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ─────────────────────────────────────── */}
      <article className="bg-[#fefefd] pb-[80px] pt-[50px]">
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
                  className="mb-4 text-[16px] leading-[1.8] text-[#444]"
                >
                  {para}
                </p>
              ))}
            </div>
          ))}

          {/* author card */}
          <div className="mt-12 flex items-center gap-4 rounded-[20px] border border-[#e8e8f0] bg-white p-6">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#7f85f7] text-[18px] font-bold text-white">
              {post.author
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1a1a2e]">
                {post.author}
              </p>
              <p className="text-[13px] text-[#9496a8]">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </article>

      {/* ── RELATED POSTS ────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#fefefd] pb-[100px]">
          <div className="mx-auto max-w-[1170px] px-4">
            <h2 className="mb-10 text-center text-[28px] font-bold uppercase text-[#2f2f2f]">
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#e8e8f0] bg-white transition-all duration-300 hover:border-[#7f85f7] hover:shadow-[0_8px_30px_rgba(127,133,247,0.12)]"
                >
                  <div className="relative h-[170px] w-full">
                    <ImageWithFallback
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
                    <h3 className="text-[16px] font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#7f85f7]">
                      {r.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#7f85f7]">
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
