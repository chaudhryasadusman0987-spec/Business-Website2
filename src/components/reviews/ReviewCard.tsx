"use client"

import { useState } from "react"
import Stars from "@/components/reviews/Stars"
import type { GoogleReview } from "@/lib/googleReviews"

// Reviews longer than this are collapsed behind "Read more".
const LIMIT = 220

// One Google review: author (linked to their Google profile when provided),
// photo when Google provides one, stars, Google's relative time, and the text.
export default function ReviewCard({ review }: { review: GoogleReview }) {
  const [open, setOpen] = useState(false)
  const long = review.text.length > LIMIT
  // Cut on a word boundary so the preview never ends mid-word.
  const preview = long
    ? review.text.slice(0, LIMIT).replace(/\s+\S*$/, "") + "…"
    : review.text

  return (
    <article className="card flex h-full w-full flex-col p-6">
      <div className="flex items-center gap-3">
        {review.photo ? (
          // Google-hosted avatar: plain <img>, not optimised or stored by us.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.photo}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint font-heading text-[16px] font-semibold text-accent"
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink">
            {review.profileUrl ? (
              <a
                href={review.profileUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:underline underline-offset-4"
              >
                {review.author}
              </a>
            ) : (
              review.author
            )}
          </p>
          {review.when && <p className="text-[13px] text-muted">{review.when}</p>}
        </div>
      </div>

      <Stars rating={review.rating} className="mt-4" />

      {/* Star-only reviews have no text: author and stars only. */}
      {review.text && (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.65] text-muted">
          {open ? review.text : preview}
        </p>
      )}
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2 inline-flex min-h-[44px] items-center self-start text-[14px] font-semibold text-accent underline-offset-4 hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  )
}
