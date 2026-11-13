import { NextResponse } from "next/server"
import { getGoogleReviews } from "@/lib/googleReviews"

// Re-check Google for new reviews at most once an hour.
export const revalidate = 3600

// The business's Google rating and reviews (empty until configured). The
// pages read getGoogleReviews() directly on the server; this route stays for
// anything that needs the same data client-side.
export async function GET() {
  const { rating, count, reviews } = await getGoogleReviews()
  return NextResponse.json({ rating, count, reviews })
}
