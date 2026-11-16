// ============================================================
//  SECURITY PRICES & CARD COPY — fill in the "" values below.
//
//  Prices are "from" amounts, installed, GST extra, written as you want them
//  shown, e.g. "$450". While a value is "":
//    - Vercel previews and local builds show the [FROM $X] placeholder, so you
//      can see where it sits
//    - production never shows a placeholder: card lines are hidden and table
//      cells read "Quote on request".
//  Business details (licence, warranty, payment terms) live in site.ts.
// ============================================================

import { SECURITY_LICENCE_NO } from "@/data/site"

/** True everywhere except Vercel production builds. Server components only. */
export const SHOW_PLACEHOLDERS = process.env.VERCEL_ENV !== "production"

export const PRICE_PLACEHOLDER = "[FROM $X]"
export const LICENCE_PLACEHOLDER = "[QLD SECURITY LICENCE NO.]"

/** A filled value, the visible placeholder (non-production), or null. */
export function filled(value: string, placeholder: string): string | null {
  if (value.trim()) return value.trim()
  return SHOW_PLACEHOLDERS ? placeholder : null
}

/** "From $450", the placeholder, or null. */
export function fromPrice(value: string): string | null {
  const v = filled(value, PRICE_PLACEHOLDER)
  return v && v !== PRICE_PLACEHOLDER ? `From ${v}` : v
}

/** "QLD Security Licence 1234567", the placeholder, or null. */
export function licenceLabel(): string | null {
  const v = filled(SECURITY_LICENCE_NO, LICENCE_PLACEHOLDER)
  return v && v !== LICENCE_PLACEHOLDER ? `QLD Security Licence ${v}` : v
}

/** Whether "licensed" may be claimed in copy (a real number is set). */
export const HAS_LICENCE = Boolean(SECURITY_LICENCE_NO.trim())

// ── Security hub solution cards, keyed by solution id ────────
export const solutionCards: Record<string, { benefit: string; from: string }> = {
  surveillance: {
    benefit: "HD cameras with phone viewing and 30-day recording",
    from: "", // [FROM $X]
  },
  deterrence: {
    benefit: "Alarm panels, sirens and sensor lights that stop break-ins early",
    from: "", // [FROM $X]
  },
  commercial: {
    benefit: "Multi-camera NVR systems for shops, offices and warehouses",
    from: "", // [FROM $X]
  },
  "access-control": {
    benefit: "Keypad, fob and phone entry with a record of who came in",
    from: "", // [FROM $X]
  },
  "smoke-alarms": {
    benefit: "Photoelectric, interconnected alarms that meet QLD rules",
    from: "", // [FROM $X]
  },
  intercoms: {
    benefit: "See and talk to visitors at the door or gate from your phone",
    from: "", // [FROM $X]
  },
}

// ── Access control pricing guide ─────────────────────────────
export const accessControlPrices: { system: string; suits: string; from: string }[] = [
  { system: "Keypad entry", suits: "Single doors, side gates, small offices", from: "" },
  { system: "Key fob / swipe card", suits: "Offices, shops, shared entries", from: "" },
  { system: "Phone / app access", suits: "Homes, short-stay rentals, remote owners", from: "" },
  { system: "Video intercom + access", suits: "Front doors, gates, apartment entries", from: "" },
  { system: "Gate access", suits: "Driveway gates, car parks, yards", from: "" },
  { system: "Biometric (fingerprint / face)", suits: "Server rooms, stockrooms, high-security doors", from: "" },
]
