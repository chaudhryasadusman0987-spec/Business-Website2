import ReviewsBlock from "@/components/reviews/ReviewsBlock"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import JsonLd from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/InternalLinks"
import { getGoogleReviews, hasReviews } from "@/lib/googleReviews"
import { SITE_DOMAIN, SITE_FULL } from "@/data/site"

// Google is re-checked at most once an hour; nothing is stored.
export const revalidate = 3600

export default async function TestimonialsPage() {
  const summary = await getGoogleReviews()
  const real = hasReviews(summary)

  return (
    <>
      {/* AggregateRating only when Google has real reviews for us — attached to
          the LocalBusiness declared in the root layout. */}
      {real && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${SITE_DOMAIN}/#business`,
            name: SITE_FULL,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: summary.rating,
              reviewCount: summary.count,
              bestRating: 5,
              worstRating: 1,
            },
          }}
        />
      )}

      <div className="container-page pt-6">
        <Breadcrumbs
          tone="light"
          className="mb-0"
          crumbs={[
            ["Home", "/"],
            ["Testimonials", "/testimonials"],
          ]}
        />
      </div>

      <ReviewsBlock summary={summary} as="h1" empty="invite" />

      <QuoteCTABanner href="/contact" />
    </>
  )
}
