import ReviewsBlock from "@/components/reviews/ReviewsBlock"
import { getGoogleReviews } from "@/lib/googleReviews"

// Teaser used on the homepage and the service hubs: the Google rating and the
// top 3 reviews, read on the server. Renders nothing until the business has
// real Google reviews — there are no sample reviews anywhere on the site.
export default async function TestimonialsStrip() {
  const summary = await getGoogleReviews()
  return <ReviewsBlock summary={summary} limit={3} empty="hide" />
}
