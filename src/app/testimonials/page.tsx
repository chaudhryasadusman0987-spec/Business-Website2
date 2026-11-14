import ReviewsBlock from "@/components/reviews/ReviewsBlock"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { Breadcrumbs } from "@/components/seo/InternalLinks"
import { getGoogleReviews } from "@/lib/googleReviews"

// Google is re-checked at most once an hour; nothing is stored.
export const revalidate = 3600

export default async function TestimonialsPage() {
  const summary = await getGoogleReviews()

  // AggregateRating lives on the site-wide LocalBusiness JSON-LD in the root
  // layout, so it is not repeated here.
  return (
    <>
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
