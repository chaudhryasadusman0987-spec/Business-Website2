// Compares the name on the payment method (Stripe billing_details.name) with
// the name the applicant gave alongside their driving licence. A mismatch is
// not proof of fraud — cards are often in a partner's name — so it only flags
// the rental for the owner to check ID at handover.

export type NameCheck = "match" | "mismatch" | "unknown"

function tokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z\s'-]/g, " ")
    .split(/[\s'-]+/)
    .filter(Boolean)
    // Honorifics printed on some cards.
    .filter((t) => !["mr", "mrs", "ms", "miss", "dr"].includes(t))
}

export function compareNames(licenceName: string, cardholderName: string | null): NameCheck {
  const licence = tokens(licenceName)
  const card = tokens(cardholderName ?? "")
  if (licence.length === 0 || card.length === 0) return "unknown"

  const first = licence[0]
  const last = licence[licence.length - 1]
  // Surname must appear; the first name may be spelled out or just an initial
  // ("J SMITH"), and middle names on either side are ignored.
  const hasLast = card.includes(last)
  const hasFirst = card.some((t) => t === first || (t.length === 1 && t === first[0]))
  return hasLast && hasFirst ? "match" : "mismatch"
}
