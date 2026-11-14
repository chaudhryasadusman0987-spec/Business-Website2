import Stars from "@/components/reviews/Stars"
import ReviewCard from "@/components/reviews/ReviewCard"
import { buttonClass } from "@/components/ui/Button"
import { hasReviews, type GoogleReviewSummary } from "@/lib/googleReviews"

interface Props {
  summary: GoogleReviewSummary
  /** Show only the first N reviews (homepage shows 3). */
  limit?: number
  /** Heading element — h1 on the testimonials page, h2 elsewhere. */
  as?: "h1" | "h2"
  /** What to render when there are no reviews: the "we're new" state, or nothing. */
  empty?: "invite" | "hide"
}

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const

// Google rating + review cards. Used by /testimonials (all reviews, invite
// state when empty) and the homepage / hub pages (top 3, hidden when empty).
// Only ever shows what Google returned — no sample or placeholder reviews.
export default function ReviewsBlock({ summary, limit, as: Heading = "h2", empty = "hide" }: Props) {
  const real = hasReviews(summary)
  if (!real && empty === "hide") return null

  const reviews = limit ? summary.reviews.slice(0, limit) : summary.reviews

  return (
    <section className="section on-light bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-[65ch] text-center">
          <p className="eyebrow mb-3">Reviews</p>
          <Heading className="text-ink">What our customers say</Heading>

          {real ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="font-heading text-[2rem] font-bold leading-none text-ink">
                  {summary.rating.toFixed(1)}
                </span>
                <Stars rating={summary.rating} size={24} />
              </div>
              <p className="text-[15px] text-muted">
                Based on {summary.count} Google review{summary.count === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <p className="lead mx-auto mt-4">
              We&apos;re new on Google — be one of our first reviewers!
            </p>
          )}
        </div>

        {real && (
          <>
            <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.id} className="flex">
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-[13px] text-muted">Reviews from Google</p>
          </>
        )}

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {real && (
            <a href={summary.allReviewsUrl} {...EXTERNAL} className={buttonClass("secondary")}>
              See all reviews on Google
            </a>
          )}
          <a href={summary.writeReviewUrl} {...EXTERNAL} className={buttonClass("primary")}>
            Leave us a review
          </a>
        </div>
      </div>
    </section>
  )
}
