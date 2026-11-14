import type { ReactNode } from "react"
import { Breadcrumbs } from "@/components/seo/InternalLinks"

// Shared shell for the site-wide legal pages (/privacy, /terms): breadcrumbs,
// a white reading card, title, "last updated" line and an intro.
export function LegalPage({
  title,
  href,
  updated,
  intro,
  children,
}: {
  title: string
  href: string
  /** Human-readable date, e.g. "13 November 2026". */
  updated: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="mx-auto max-w-[800px]">
        <Breadcrumbs
          tone="light"
          crumbs={[
            ["Home", "/"],
            [title, href],
          ]}
        />
      </div>
      <article className="on-light mx-auto max-w-[800px] rounded-card bg-white p-6 shadow-card sm:p-8 lg:p-12">
        <h1 className="mb-2 text-ink">{title}</h1>
        <p className="mb-6 text-[13px] text-muted">Last updated: {updated}</p>
        <div className="mb-8 space-y-3 text-[15px] leading-relaxed text-muted">{intro}</div>
        {children}
      </article>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[1.25rem] text-ink">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
