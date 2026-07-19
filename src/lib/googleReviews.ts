import type { Testimonial } from "@/data/testimonials"

// ============================================================
//  GOOGLE BUSINESS PROFILE REVIEWS
//  Pulls real reviews from your Google Business Profile via the
//  Google Places API (New) and maps them into the same card
//  shape used by the manual testimonials.
//
//  To switch it ON, set these two env vars (e.g. in .env.local
//  or your Vercel project settings):
//
//    GOOGLE_PLACES_API_KEY = <your Google Cloud API key>
//    GOOGLE_PLACE_ID       = <your Business Profile Place ID>
//
//  Until BOTH are set, this returns [] and the testimonials page
//  simply shows the manual reviews — no errors, nothing breaks.
//
//  Note: Google's API returns at most the 5 most-relevant reviews.
// ============================================================

interface GooglePlacesReview {
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  authorAttribution?: {
    displayName?: string
    photoUri?: string
    uri?: string
  }
  relativePublishTimeDescription?: string
}

export async function fetchGoogleReviews(): Promise<Testimonial[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId =
    process.env.GOOGLE_PLACE_ID || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID

  // Not configured yet → no Google reviews; page falls back to manual list.
  if (!apiKey || !placeId) return []

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "reviews.rating",
            "reviews.text",
            "reviews.originalText",
            "reviews.authorAttribution",
            "reviews.relativePublishTimeDescription",
          ].join(","),
        },
        // Cache 1h: Google's terms allow limited caching, and this keeps us
        // well under quota instead of calling the API on every page view.
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) return []

    const data = (await res.json()) as { reviews?: GooglePlacesReview[] }
    const reviews = data.reviews ?? []

    return reviews
      .map((r, i): Testimonial => {
        const text = r.text?.text ?? r.originalText?.text ?? ""
        return {
          id: `google-${i}`,
          name: r.authorAttribution?.displayName ?? "Google user",
          suburb: "", // Google reviews don't expose reviewer location
          state: "",
          rating: r.rating ?? 5,
          text,
          service: "Google Review",
          serviceIcon: "⭐",
          serviceColor: "#4285F4",
          date: r.relativePublishTimeDescription ?? "",
          image: r.authorAttribution?.photoUri ?? "",
          verified: true,
        }
      })
      .filter((t) => t.text.trim().length > 0)
  } catch {
    // Network/API failure → degrade gracefully to manual testimonials.
    return []
  }
}
