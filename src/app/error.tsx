"use client"

import Link from "next/link"
import { useEffect } from "react"
import { SITE_PHONE } from "@/data/site"

// Shown instead of Next's bare "Application error" screen when a page fails
// to render (e.g. the database is briefly unreachable).
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-[480px] text-center">
        <h1 className="text-[28px] font-bold text-[#1a1a2e]">Something went wrong</h1>
        <p className="text-muted mt-3">
          This page didn&apos;t load properly. Please try again — or call us on{" "}
          <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="text-accent font-semibold">
            {SITE_PHONE}
          </a>
          .
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="bg-brand-primary text-white h-12 px-6 rounded-btn font-semibold hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-line h-12 px-6 rounded-btn font-semibold text-[#1a1a2e] flex items-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
