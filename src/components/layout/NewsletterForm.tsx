"use client"

import { useState, type FormEvent } from "react"
import { usePathname } from "next/navigation"
import { buttonClass } from "@/components/ui/Button"

type Status = "idle" | "sending" | "done" | "error"

// Footer newsletter sign-up: label above a 48px email field, Subscribe button,
// and a reassurance line. Posts to /api/newsletter, which saves the address
// and notifies the business.
export default function NewsletterForm() {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("") // honeypot
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === "sending") return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }
    setStatus("sending")
    setMessage("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source: `footer ${pathname}` }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        alreadySubscribed?: boolean
      }
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.")
      setStatus("done")
      setMessage(
        data.alreadySubscribed
          ? "You're already subscribed — thanks!"
          : "Thanks — you're subscribed.",
      )
      setEmail("")
    } catch (err) {
      setStatus("error")
      setMessage((err as Error).message || "Something went wrong. Please try again.")
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email" className="mb-1.5 block text-[13px] font-semibold text-white">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status !== "sending") setStatus("idle")
          }}
          placeholder="you@example.com"
          aria-invalid={status === "error"}
          aria-describedby="newsletter-hint newsletter-status"
          className="h-12 w-full min-w-0 flex-none rounded-input sm:flex-1 lg:flex-none xl:flex-1 border border-white/40 bg-white/5 px-4 py-0 text-[15px] text-white placeholder:text-white/50 focus:border-brand-primary"
        />
        {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={buttonClass("primary", "dark", "flex-shrink-0")}
        >
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id="newsletter-hint" className="mt-2 text-[13px] text-on-dark-muted">
        No spam. Unsubscribe anytime.
      </p>
      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`mt-1 min-h-[20px] text-[13px] ${
          status === "error" ? "text-[#fca5a5]" : "text-[#86efac]"
        }`}
      >
        {message}
      </p>
    </form>
  )
}
