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
      out.push(`🔥 ${c.percent}% OFF ${CATEGORY_LABELS[key]} — limited time offer!`)
    }
  })
  return out
}
