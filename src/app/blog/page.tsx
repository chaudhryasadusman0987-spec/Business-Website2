"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Clock, ArrowRight } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import BrandLogo from "@/components/ui/BrandLogo"
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
      <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">

        <div className="relative z-10 mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center justify-center gap-2 text-[12px] text-muted">
            <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">Blog</span>
          </nav>

          <div className="mb-8 flex justify-center">
            <BrandLogo />
          </div>

          <h1 className="text-white">
            Blog &amp; Insights
          </h1>
          <p className="mt-4 text-[16px] text-muted">
            Guides, news and tips on security, mobility and technology.
          </p>
        </div>
      </section>

      {/* ── 2. FEATURED POST ─────────────────────────────────── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 overflow-hidden rounded-card border border-line bg-white transition-all duration-300 hover:border-brand-primary hover:shadow-card-hover lg:grid-cols-2 on-light"
          >
            <div className="relative h-[260px] w-full lg:h-full lg:min-h-[340px]">
              <ImageWithFallback
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-200"
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
              <span className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-accent">
                Featured
              </span>
              <h2 className="text-[#1a1a2e]">
                {featured.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {featured.excerpt}
              </p>

              <div className="mt-6 flex items-center gap-4 text-[13px] text-muted">
                <span className="font-medium text-[#1a1a2e]">
                  {featured.author}
                </span>
                <span>{featured.date}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />
                  {featured.readTime}
                </span>
              </div>

              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-accent">
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
      <section className="bg-white pt-[50px] on-light">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {blogCategories.map((c) => {
              const active = category === c
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-line bg-white text-muted hover:border-brand-primary hover:text-accent on-light"
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
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-muted">
              No articles yet in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-all duration-300 hover:border-brand-primary hover:shadow-card-hover on-light"
                >
                  <div className="relative h-[200px] w-full">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-200"
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
                    <h3 className="text-[18px] font-bold leading-snug text-[#1a1a2e] transition-colors group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-[12px] text-muted">
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
