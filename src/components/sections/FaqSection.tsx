import JsonLd, { faqJsonLd } from "@/components/seo/JsonLd"
import SectionTitle from "@/components/ui/SectionTitle"

export interface Faq {
  q: string
  a: string
}

// Visible FAQ list plus its FAQPage JSON-LD, built from the same array so the
// structured data always matches what's on the page.
export default function FaqSection({
  faqs,
  title = "Frequently Asked Questions",
  subtitle,
  className = "bg-white on-light py-14 lg:py-20",
}: {
  faqs: Faq[]
  title?: string
  subtitle?: string
  className?: string
}) {
  if (faqs.length === 0) return null
  return (
    <section id="faq" className={className}>
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="mx-auto max-w-[800px] px-4">
        <SectionTitle title={title} subtitle={subtitle} />
        <div className="mt-10 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-card border border-line bg-white p-5 on-light">
              <summary className="cursor-pointer text-[16px] font-semibold text-ink">{f.q}</summary>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
