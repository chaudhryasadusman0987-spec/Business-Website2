// ============================================================
//  GOOGLE BUSINESS PROFILE REVIEWS
//  Reads the rating and reviews straight from Google via the
//  Places API (New). Server-only. Nothing is stored in our
//  database: the response is cached by Next for an hour and
//  that is all.
//
//  Env (Vercel project settings / .env.local):
//    GOOGLE_PLACES_API_KEY  Google Cloud API key with Places API (New)
//    GOOGLE_PLACE_ID        the Business Profile's Place ID
//    GOOGLE_REVIEW_URL      "write a review" link from the profile
//
//  Until the first two are set this returns an empty summary and
//  the site shows its "be one of our first reviewers" state.
//  Google's API returns at most the 5 most relevant reviews.
// ============================================================

import { SITE_GOOGLE_REVIEWS_URL, SITE_GOOGLE_REVIEW_URL } from "@/data/site"

export interface GoogleReview {
  id: string
  author: string
  /** Reviewer's profile photo, when Google provides one. */
  photo: string
  /** Reviewer's Google profile, when Google provides one. */
  profileUrl: string
  rating: number
  /** e.g. "2 weeks ago" — Google's own wording. */
  when: string
  /** Empty for star-only reviews. */
  text: string
}

export interface GoogleReviewSummary {
  /** Average rating across all Google reviews, or 0 when there are none. */
  rating: number
  /** Total number of Google reviews (not just the ones returned). */
  count: number
  reviews: GoogleReview[]
  /** Where "See all reviews on Google" goes. */
  allReviewsUrl: string
  /** Where "Leave us a review" goes. */
  writeReviewUrl: string
}

interface PlacesReview {
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: { displayName?: string; photoUri?: string; uri?: string }
  relativePublishTimeDescription?: string
}

interface PlacesResponse {
  rating?: number
  userRatingCount?: number
  reviews?: PlacesReview[]
  googleMapsUri?: string
}

function links(): Pick<GoogleReviewSummary, "allReviewsUrl" | "writeReviewUrl"> {
  return {
    allReviewsUrl: SITE_GOOGLE_REVIEWS_URL,
    // GOOGLE_REVIEW_URL overrides the profile's write-a-review link in site.ts.
    writeReviewUrl: process.env.GOOGLE_REVIEW_URL || SITE_GOOGLE_REVIEW_URL,
  }
}

const EMPTY = (): GoogleReviewSummary => ({ rating: 0, count: 0, reviews: [], ...links() })

export async function getGoogleReviews(): Promise<GoogleReviewSummary> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID

  // Not configured yet → empty; callers show the "we're new" state.
  if (!apiKey || !placeId) return EMPTY()

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
        },
        // Re-check Google at most once an hour.
        next: { revalidate: 3600 },
      },
    )
    if (!res.ok) return EMPTY()

    const data = (await res.json()) as PlacesResponse
    // Every review Google returns is shown — star-only ones included (the
    // card then shows the author and stars without text).
    const reviews = (data.reviews ?? []).map(
      (r, i): GoogleReview => ({
        id: `google-${i}`,
        author: r.authorAttribution?.displayName ?? "Google user",
        photo: r.authorAttribution?.photoUri ?? "",
        profileUrl: r.authorAttribution?.uri ?? "",
        rating: Math.max(0, Math.min(5, Math.round(r.rating ?? 0))),
        when: r.relativePublishTimeDescription ?? "",
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
      }),
    )

    const count = data.userRatingCount ?? 0
    const rating = data.rating ?? 0
    // No reviews at all → the "be one of our first reviewers" state.
    if (count === 0 || rating === 0) return EMPTY()

    return { rating, count, reviews, ...links() }
  } catch {
    // Network/API failure → degrade to the empty state, never an error page.
    return EMPTY()
  }
}

/**
 * True when Google reports at least one real review. The individual reviews
 * may still be empty: Google can report a rating and count before its API
 * returns review text, and star-only reviews have no text to show.
 */
export function hasReviews(s: GoogleReviewSummary): boolean {
  return s.count > 0 && s.rating > 0
}
