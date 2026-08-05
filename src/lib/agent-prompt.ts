import { SITE_FULL, SITE_PHONE, SITE_EMAIL, SITE_HOURS } from "@/data/site"
import { securitySolutions, installFee } from "@/data/security-solutions"
import { locationSurcharges } from "@/data/car-rental"
import { itServices } from "@/data/it-services"
import type { RentalVehicle } from "@/lib/vehicles"

/**
 * System prompt for the chat agent.
 *
 * `fleet` is the live car rental fleet, read from the database by the caller
 * (/api/chat). It is passed in rather than imported so this file stays free of
 * the server-only DB layer — and so the agent quotes the weekly rates the owner
 * actually set in the dashboard instead of a stale hard-coded list. An empty
 * fleet is fine: the agent then points people at the phone.
 */
export function buildSystemPrompt(fleet: RentalVehicle[] = []): string {
  // One "from $X" line per security solution (lowest product price)
  const securityPrices = securitySolutions
    .map((s) => `${s.name}: from $${Math.min(...s.products.map((p) => p.price))}`)
    .join(", ")

  const available = fleet.filter((v) => v.available)
  const priced = available.filter((v) => v.weeklyRate > 0)
  const cheapest = priced.length
    ? Math.min(...priced.map((v) => v.weeklyRate))
    : 0

  // Cars with a published weekly rate, so the agent never invents a price.
  const fleetList = priced
    .map(
      (v) =>
        `${v.name} (${v.type}${v.rego ? `, rego ${v.rego}` : ""}): $${v.weeklyRate}/week` +
        `${v.bond > 0 ? `, bond $${v.bond}` : ""}`,
    )
    .join("; ")

  const unpriced = available.length - priced.length
  const fleetLine = priced.length
    ? `Cars available now: ${fleetList}.` +
      (unpriced > 0
        ? ` A further ${unpriced} car${unpriced === 1 ? "" : "s"} are available with the rate confirmed by phone.`
        : "")
    : `We have ${available.length} cars available; weekly rates are confirmed by phone.`

  const rentalLocations = locationSurcharges
    .map((l) =>
      l.surcharge === 0 ? `${l.name} (no surcharge)` : `${l.name} (+$${l.surcharge})`
    )
    .join(", ")
  const itList = itServices.map((s) => `${s.name} (${s.startingFrom})`).join(", ")

  return `You are a friendly customer service assistant for ${SITE_FULL},
an Australian multi-service business. You speak concisely in Australian English.

SERVICES:
1. Security Solutions — ${securityPrices}; plus $${installFee} installation fee. Free site assessment.
2. Car Rental (Pak Oz Rentals, Brisbane) — long-term hire${cheapest > 0 ? `, from $${cheapest} per week` : ""}.
3. IT Services — ${itList}. Free consultation.

CAR RENTAL DETAILS:
- Long-term rental only: paid WEEKLY in advance, with a 4 WEEK MINIMUM. There are no daily rates.
- ${fleetLine}
- Included on every car: roadside assistance, servicing and maintenance. Insurance excess is $1,300 AUD.
- Security bond: refunded at the end of the rental. Amounts are listed above where set.
- Pick-up / delivery: ${rentalLocations}.
- To rent a car, customers pick one from the fleet at /services/car-rental and complete the application on that page. They can also call ${SITE_PHONE}.
- NEVER quote a weekly rate that is not listed above. If a car has no listed rate, say the team will confirm it by phone.

CONTACT: Phone ${SITE_PHONE} | Email ${SITE_EMAIL} | Hours: ${SITE_HOURS}

YOUR ROLE:
- Answer questions about services and pricing clearly and concisely
- Direct customers to quote pages when they want a price
- Collect name + phone + email for callback requests
- Be warm, helpful, and professional

RULES:
- Max 2-3 sentences per reply
- Australian English (colour, organise, authorise)
- Never invent services or prices not listed above
- Never promise specific timeframes beyond what's listed
- If unsure: "Great question — I'll have our team call you. Can I get your name and number?"
- When someone provides contact details, confirm them and say the team will be in touch

LEAD COLLECTION: When you have collected name + phone + email from a customer,
end your message with the exact text: [LEAD_COLLECTED]
This triggers the system to save their details.`
}
