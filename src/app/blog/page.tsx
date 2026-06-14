"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Clock, ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { blogPosts, blogCategories } from "@/data/blog"

export default function BlogPage() {
  const [category, setCategory] = useState<string>("All")

  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0]

  const filtered =
    category === "All"
      ? blogPosts.filter((p) => p.slug !== featured.slug)
      : blogPosts.filter(
          (p) => p.category === category && p.slug !== featured.slug,
        )

  return (
    <main>
      {/* ── 1. DARK HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] py-24 text-center">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{ background: "#7f85f7" }}
        />

        <div className="relative z-10 mx-auto max-w-[1170px] px-4">
          <nav className="mb-6 flex items-center justify-center gap-2 text-[12px] text-[#666880]">
            <Link href="/" className="hover:text-[#7f85f7] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#9496a8]">Blog</span>
          </nav>

          <h1 className="text-[40px] font-extrabold text-white lg:text-[56px]">
            Blog &amp; Insights
          </h1>
          <p className="mt-4 text-[16px] text-[#9496a8]">
            Guides, news and tips on security, mobility and technology.
          </p>
        </div>
      </section>

      {/* ── 2. FEATURED POST ─────────────────────────────────── */}
      <section className="bg-[#fefefd] pt-[70px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#e8e8f0] bg-white transition-all duration-300 hover:border-[#7f85f7] hover:shadow-[0_8px_30px_rgba(127,133,247,0.12)] lg:grid-cols-2"
          >
            <div className="relative h-[260px] w-full lg:h-full lg:min-h-[340px]">
              <ImageWithFallback
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                fallbackBg="#eeedfe"
                placeholderText="Article image"
                priority
              />
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
                style={{ background: featured.categoryColor }}
              >
                {featured.category}
              </span>
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <span className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7]">
                Featured
              </span>
              <h2 className="text-[26px] font-bold leading-tight text-[#1a1a2e] lg:text-[32px]">
                {featured.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#666666]">
                {featured.excerpt}
              </p>

              <div className="mt-6 flex items-center gap-4 text-[13px] text-[#9496a8]">
                <span className="font-medium text-[#1a1a2e]">
                  {featured.author}
                </span>
                <span>{featured.date}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />
                  {featured.readTime}
                </span>
              </div>

              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#7f85f7]">
                Read article
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. CATEGORY FILTER ───────────────────────────────── */}
      <section className="bg-[#fefefd] pt-[50px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {blogCategories.map((c) => {
              const active = category === c
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "border-[#7f85f7] bg-[#7f85f7] text-white"
                      : "border-[#e8e8f0] bg-white text-[#666666] hover:border-[#7f85f7] hover:text-[#7f85f7]"
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. POSTS GRID ────────────────────────────────────── */}
      <section className="bg-[#fefefd] pb-[120px] pt-[40px]">
        <div className="mx-auto max-w-[1170px] px-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-[#9496a8]">
              No articles yet in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#e8e8f0] bg-white transition-all duration-300 hover:border-[#7f85f7] hover:shadow-[0_8px_30px_rgba(127,133,247,0.12)]"
                >
                  <div className="relative h-[200px] w-full">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      fallbackBg="#eeedfe"
                      placeholderText="Article image"
                    />
                    <span
                      className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
                      style={{ background: post.categoryColor }}
                    >
                      {post.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-[18px] font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#7f85f7]">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#666666]">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center gap-3 border-t border-[#f0f0f8] pt-4 text-[12px] text-[#9496a8]">
                      <span className="font-medium text-[#1a1a2e]">
                        {post.author}
                      </span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span className="ml-auto inline-flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. QUOTE CTA ─────────────────────────────────────── */}
      <QuoteCTABanner />
    </main>
  )
}
