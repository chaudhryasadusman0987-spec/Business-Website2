import Stripe from "stripe"

// Server-only. Built per request rather than at module scope: Next.js
// evaluates route modules during the build's page-data collection, and the
// Stripe SDK throws immediately if no key is configured yet.
export function stripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-07-29.dahlia",
  })
}

/** Shown after the account's statement descriptor prefix on rental charges. */
export const RENTAL_STATEMENT_SUFFIX = "PAKOZ RENTAL"

/** First IP in x-forwarded-for (Vercel puts the client first). */
export function requestIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for")
  return fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")
}
