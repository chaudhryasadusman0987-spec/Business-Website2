// The rental terms a card / BECS customer accepts at checkout. Shared by the
// checkout modal (what the customer reads) and the server (what gets stored
// against the rental as dispute evidence), so the two can never drift apart.
//
// Bump RENTAL_TERMS_VERSION whenever the wording below or /rental-terms
// changes — each rental records the version its customer agreed to.

export const RENTAL_TERMS_VERSION = "2026-10-29"

export const RENTAL_KEY_TERMS: string[] = [
  "Minimum rental: 4 weeks, then week-to-week with 1 week's notice",
  "Early return before 4 weeks: 50% of remaining rent up to the 4-week mark still payable",
  "Includes servicing, insurance (subject to excess), roadside assistance, unlimited km, full tank",
  "Fines, tolls and unauthorised driver use are not included",
  "Drivers must be 21–75 with a valid licence",
  "Vehicle must stay within 100km of Brisbane without written permission",
]

/** Weekly charges recur on the weekday the subscription starts (Brisbane time). */
export function billingWeekday(at: Date = new Date()): string {
  return at.toLocaleDateString("en-AU", { weekday: "long", timeZone: "Australia/Brisbane" })
}

/** The exact sentence next to the checkout checkbox. */
export function chargeConsentSentence(weeklyRate: number, weekday: string): string {
  return (
    `I agree to weekly charges of $${weeklyRate.toFixed(2)} every ${weekday} ` +
    `until the vehicle is returned, and to the rental terms.`
  )
}

/**
 * The full text stored with the acceptance: the consent sentence plus the
 * terms it refers to, so the record stands on its own in a dispute.
 */
export function fullTermsText(opts: {
  weeklyRate: number
  weekday: string
  bondAmount: number
  vehicle: string
}): string {
  return [
    chargeConsentSentence(opts.weeklyRate, opts.weekday),
    "",
    `Vehicle: ${opts.vehicle}`,
    `Weekly rent: $${opts.weeklyRate.toFixed(2)} AUD, charged automatically every ${opts.weekday} from today`,
    opts.bondAmount > 0
      ? `Security bond charged today: $${opts.bondAmount.toFixed(2)} AUD (refundable)`
      : "Security bond: collected in person at pickup",
    "Charges appear on bank statements as PAKOZ RENTAL.",
    "",
    "Key rental terms:",
    ...RENTAL_KEY_TERMS.map((t) => `• ${t}`),
    "",
    `Full terms: https://pakozsolutions.com.au/rental-terms (version ${RENTAL_TERMS_VERSION})`,
  ].join("\n")
}
