import defaultPromo from "@/data/promo.json"

// Pure, isomorphic promo helpers — safe to import from client OR server code.
// The filesystem-backed read/write lives in promo-store.ts (server-only).

// ── Types ──
export type PromoCategory = "security" | "carRental" | "it"

export interface CategoryPromo {
  percent: number // 0–100
  active: boolean
}

export interface PromoConfig {
  security: CategoryPromo
  carRental: CategoryPromo
  it: CategoryPromo
  message: string // optional custom ticker text; overrides auto-generated when set
  updatedAt: string
}

// Human labels used in the auto-generated ticker copy.
export const CATEGORY_LABELS: Record<PromoCategory, string> = {
  security: "Security Products",
  carRental: "Car Rental",
  it: "IT & AI Services",
}

function normaliseCategory(c: Partial<CategoryPromo> | undefined): CategoryPromo {
  const percent = Math.max(0, Math.min(100, Math.round(Number(c?.percent ?? 0)) || 0))
  return { percent, active: Boolean(c?.active) && percent > 0 }
}

export function normalise(raw: Partial<PromoConfig>): PromoConfig {
  return {
    security: normaliseCategory(raw.security),
    carRental: normaliseCategory(raw.carRental),
    it: normaliseCategory(raw.it),
    message: typeof raw.message === "string" ? raw.message : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
  }
}

/** The committed default config, normalised. Used to seed reads. */
export const DEFAULT_PROMO: PromoConfig = normalise(defaultPromo as Partial<PromoConfig>)

/** Apply a percent discount, rounded to a whole dollar. */
export function discounted(amount: number, percent: number): number {
  if (!percent) return amount
  return Math.round(amount * (1 - percent / 100))
}

/** True when a category promo is switched on with a real percentage. */
export function promoActive(promo: CategoryPromo | undefined): boolean {
  return Boolean(promo?.active && promo.percent > 0)
}

export interface EffectivePrice {
  price: number // what the customer pays
  original: number // undiscounted price (for strikethrough)
  onSale: boolean // true when price < original
  percent: number // the category % applied (0 when the price comes from a per-item sale)
}

/**
 * Resolve a line's effective price. Rule (no double discount): a per-item sale
 * price wins if present; otherwise the active category promo applies; otherwise
 * the base price is used unchanged. Removing the promo reverts automatically.
 */
export function effectivePrice(
  base: number,
  salePrice: number | null | undefined,
  promo: CategoryPromo | undefined
): EffectivePrice {
  const hasSale = salePrice != null && salePrice > 0 && salePrice < base
  if (hasSale) {
    return { price: Math.round(salePrice as number), original: base, onSale: true, percent: 0 }
  }
  if (promoActive(promo)) {
    const percent = promo!.percent
    return { price: discounted(base, percent), original: base, onSale: true, percent }
  }
  return { price: base, original: base, onSale: false, percent: 0 }
}

/**
 * Build the scrolling ticker messages. A custom `message` overrides everything;
 * otherwise one entry per active category.
 */
export function buildTickerMessages(config: PromoConfig): string[] {
  if (config.message.trim()) return [config.message.trim()]
  const out: string[] = []
  ;(Object.keys(CATEGORY_LABELS) as PromoCategory[]).forEach((key) => {
    const c = config[key]
    if (c.active && c.percent > 0) {
      out.push(`${c.percent}% OFF ${CATEGORY_LABELS[key]} — limited time offer!`)
    }
  })
  return out
}

// Where each offer leads, and how it reads in a sentence.
const PROMO_TARGETS: Record<PromoCategory, { label: string; href: string }> = {
  carRental: { label: "car rental", href: "/services/car-rental" },
  security: { label: "security products", href: "/services/security-solutions" },
  it: { label: "IT & AI services", href: "/services/it-services" },
}

/**
 * The single static promo line shown on phones instead of the scrolling
 * ticker, e.g. "10% off car rental — limited time", with the page it links
 * to. A custom dashboard message is shown as written, with no link. When
 * several discounts are active the first of car rental, security, IT is used.
 */
export function mobilePromoLine(config: PromoConfig): { text: string; href: string | null } {
  if (config.message.trim()) return { text: config.message.trim(), href: null }
  for (const key of ["carRental", "security", "it"] as PromoCategory[]) {
    const c = config[key]
    if (c.active && c.percent > 0) {
      const t = PROMO_TARGETS[key]
      return { text: `${c.percent}% off ${t.label} — limited time`, href: t.href }
    }
  }
  return { text: "", href: null }
}
