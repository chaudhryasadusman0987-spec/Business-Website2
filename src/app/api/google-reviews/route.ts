import { NextResponse } from "next/server"
import { fetchGoogleReviews } from "@/lib/googleReviews"

// Re-check Google for new reviews at most once an hour.
export const revalidate = 3600

// Returns the business's Google reviews (or [] if not configured yet).
// The testimonials page calls this and merges the result into its grid.
export async function GET() {
  const reviews = await fetchGoogleReviews()
  return NextResponse.json({ reviews })
}
