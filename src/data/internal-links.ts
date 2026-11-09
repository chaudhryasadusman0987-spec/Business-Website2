// ============================================================
//  INTERNAL LINKING MAP — hub & spoke structure for SEO.
//
//  Three hubs (security, car rental, IT), each with spokes. Every link the
//  site adds for internal-linking purposes reads from here, so anchor text and
//  targets live in one place:
//    - spoke pages link UP to their hub in the first paragraph (HubLink)
//    - hubs link DOWN to every spoke (cards + one in-text link: HubIntro)
//    - spokes end with a "Related services" block of 2–3 siblings
//    - blog posts pick 1 hub + up to 2 spokes from their tags (blogServiceLinks)
//
//  Slugs here must match real routes. scripts/link-audit.ts reports any page
//  that ends up with fewer than 3 inbound links.
//  Business names come from src/data/site.ts — never hardcode them here.
// ============================================================

import { SECURITY_BRAND, IT_BRAND } from "@/data/site"
import { serviceAreas } from "@/data/service-areas"
import { blogPosts, type BlogPost } from "@/data/blog"

export type HubId = "security" | "car-rental" | "it"

export interface Hub {
  id: HubId
  href: string
  /** Short label — breadcrumbs and card titles. */
  name: string
  /** Keyword anchors. [0] is the primary; the rest are rotated so not every
   *  spoke points up with identical text. */
  anchors: string[]
  /** Where this hub's "get a quote" CTAs go. */
  quoteHref: string
  quoteLabel: string
}

export interface Spoke {
  id: string
  hub: HubId
  href: string
  name: string
  /** Keyword anchors used when other pages link to this spoke. */
  anchors: string[]
  /** One-line summary for Related-services cards. */
  blurb: string
  /** Sibling spoke ids for the Related-services block (2–3). */
  related: string[]
  /** Blog tags that map a post to this spoke. */
  tags: string[]
  /**
   * The sentence that carries the up-link to the hub in the spoke's first
   * paragraph: `${lead} <hub anchor>${tail}`. Absent for link targets that
   * aren't standalone content pages (packages, portfolio, quote form).
   */
  upLink?: { lead: string; tail: string; anchor?: number }
}

export const hubs: Record<HubId, Hub> = {
  security: {
    id: "security",
    href: "/services/security-solutions",
    name: "Security Solutions",
    anchors: [
      "CCTV installation in Brisbane",
      "Brisbane CCTV and security installation",
      "security camera installation in Brisbane",
      "home and business security in Brisbane",
    ],
    quoteHref: "/services/security-solutions/quote",
    quoteLabel: "Get a free security quote",
  },
  "car-rental": {
    id: "car-rental",
    href: "/services/car-rental",
    name: "Car Rental",
    anchors: [
      "weekly car rental in Brisbane",
      "long-term car rental in Brisbane",
      "Brisbane weekly car hire",
    ],
    // Car rental takes enquiries by contact form / phone, not an online quote
    // (see src/app/quote/page.tsx).
    quoteHref: "/contact",
    quoteLabel: "Enquire about a rental",
  },
  it: {
    id: "it",
    href: "/services/it-services",
    name: "IT & AI Services",
    anchors: [
      "web design in Brisbane",
      "Brisbane web design and IT services",
      `${IT_BRAND} IT and AI services`,
    ],
    quoteHref: "/services/it-services/quote",
    quoteLabel: "Start your project brief",
  },
}

/**
 * Nearest neighbours for each service area — drives the "nearby areas" links.
 * Geographic: Southside borders Logan & Redlands; Logan sits between Southside
 * and the Gold Coast; Ipswich is west, closest to Southside & Logan.
 * Declared before `spokes` because areaSpokes() reads them at module load.
 */
const NEAREST_AREAS: Record<string, [string, string]> = {
  "brisbane-southside": ["logan", "redlands"],
  logan: ["brisbane-southside", "gold-coast"],
  "gold-coast": ["logan", "redlands"],
  ipswich: ["brisbane-southside", "logan"],
  redlands: ["brisbane-southside", "logan"],
}

/** A newly added area without an entry falls back to the first two others. */
export function nearestAreas(slug: string): string[] {
  return (
    NEAREST_AREAS[slug] ??
    serviceAreas.filter((a) => a.slug !== slug).slice(0, 2).map((a) => a.slug)
  )
}

// Names come from src/data/service-areas.ts so area pages and links agree.
const AREA_NAMES: Record<string, string> = Object.fromEntries(
  serviceAreas.map((a) => [a.slug, a.name])
)

export const spokes: Spoke[] = [
  // ── Security ────────────────────────────────────────────────
  {
    id: "cctv",
    hub: "security",
    href: "/services/security-solutions/surveillance-evidence",
    name: "CCTV & Surveillance",
    anchors: ["CCTV camera installation", "surveillance camera systems"],
    blurb: "HD cameras, NVR recording and phone viewing.",
    related: ["access-control", "intercoms", "packages"],
    tags: ["cctv", "security-cameras", "surveillance", "nvr"],
    upLink: { lead: "Planned, installed and set up on your phone as part of our", tail: " service.", anchor: 0 },
  },
  {
    id: "deterrence",
    hub: "security",
    href: "/services/security-solutions/deterrence",
    name: "Alarms & Deterrence",
    anchors: ["alarm and deterrence systems", "home alarm installation"],
    blurb: "Alarm panels, sirens, sensors and floodlights.",
    related: ["cctv", "smoke-alarms", "products"],
    tags: ["alarms", "deterrence", "sirens", "motion-sensors"],
    upLink: { lead: "Pair it with cameras through our", tail: ".", anchor: 3 },
  },
  {
    id: "commercial",
    hub: "security",
    href: "/services/security-solutions/commercial-security",
    name: "Commercial Security",
    anchors: ["commercial security systems", "business CCTV"],
    blurb: "Multi-camera NVR and thermal systems for business.",
    related: ["cctv", "access-control", "products"],
    tags: ["commercial", "business-security", "warehouse"],
    upLink: { lead: "Designed for offices, retail and warehouses by our", tail: " team.", anchor: 2 },
  },
  {
    id: "access-control",
    hub: "security",
    href: "/services/security-solutions/access-control",
    name: "Access Control",
    anchors: ["access control installation", "keypad and biometric access"],
    blurb: "Keypads, biometric readers and gate control.",
    related: ["cctv", "intercoms", "commercial"],
    tags: ["access-control", "keypads", "biometric", "gates"],
    upLink: { lead: "Integrates with the cameras from our", tail: " service.", anchor: 1 },
  },
  {
    id: "smoke-alarms",
    hub: "security",
    href: "/services/security-solutions/smoke-alarms",
    name: "Smoke Alarms",
    anchors: ["smoke alarm installation", "compliant smoke alarms"],
    blurb: "Photoelectric, interconnected and compliant.",
    related: ["deterrence", "intercoms", "products"],
    tags: ["smoke-alarms", "fire-safety", "compliance"],
    upLink: { lead: "Fitted by the same licensed installers behind our", tail: ".", anchor: 3 },
  },
  {
    id: "intercoms",
    hub: "security",
    href: "/services/security-solutions/intercoms",
    name: "Video Intercoms",
    anchors: ["video intercom installation", "smartphone video intercoms"],
    blurb: "See and talk to visitors from your phone.",
    related: ["access-control", "cctv", "commercial"],
    tags: ["intercoms", "video-intercom", "doorbell"],
    upLink: { lead: "Works alongside everything in our", tail: " range.", anchor: 2 },
  },
  {
    id: "packages",
    hub: "security",
    // No standalone page — packages render on each solution page (PackagesGrid
    // carries id="packages"); CCTV is the main one.
    href: "/services/security-solutions/surveillance-evidence#packages",
    name: "CCTV Packages",
    anchors: ["complete CCTV packages", "CCTV camera bundles"],
    blurb: "Pre-configured camera bundles at a package price.",
    related: ["cctv", "products"],
    tags: ["packages", "cctv-kits", "bundles"],
  },
  {
    id: "products",
    hub: "security",
    href: "/services/security-solutions/products",
    name: "All Security Products",
    anchors: ["all security products", "the full security product range"],
    blurb: "Every camera, alarm and intercom we install.",
    related: ["cctv", "packages", "access-control"],
    tags: ["products", "security-products"],
    upLink: { lead: "Everything here is supplied and fitted through our", tail: " service.", anchor: 0 },
  },
  // Service-area pages (one per slug in src/data/service-areas.ts).
  ...areaSpokes(),


  // ── Car rental ──────────────────────────────────────────────
  {
    id: "fleet",
    hub: "car-rental",
    href: "/services/car-rental/vehicles",
    name: "Vehicle Fleet",
    anchors: ["our full rental fleet", "cars available to rent"],
    blurb: "Every car on the yard with weekly rates.",
    related: ["rental-terms"],
    tags: ["car-rental", "fleet", "vehicles", "rideshare"],
    upLink: { lead: "Every car is part of our", tail: " service.", anchor: 0 },
  },
  {
    id: "rental-terms",
    hub: "car-rental",
    href: "/rental-terms",
    name: "Rental Terms",
    anchors: ["car rental terms and conditions", "rental terms"],
    blurb: "Bond, minimum period and insurance excess.",
    related: ["fleet"],
    tags: ["rental-terms", "bond", "insurance"],
    upLink: { lead: "These terms apply to every vehicle in our", tail: " service.", anchor: 1 },
  },

  // ── IT ──────────────────────────────────────────────────────
  {
    id: "web-development",
    hub: "it",
    href: "/services/it-services/web-development",
    name: "Web Development",
    anchors: ["website development", "custom website builds"],
    blurb: "Fast, SEO-ready websites built to convert.",
    related: ["ai-automation", "app-development", "portfolio"],
    tags: ["web-design", "websites", "seo", "web-development"],
    upLink: { lead: "Part of our", tail: " offering.", anchor: 0 },
  },
  {
    id: "app-development",
    hub: "it",
    href: "/services/it-services/app-development",
    name: "App Development",
    anchors: ["mobile app development", "iOS and Android apps"],
    blurb: "Cross-platform iOS and Android apps.",
    related: ["web-development", "ai-automation"],
    tags: ["apps", "mobile-apps", "app-development"],
    upLink: { lead: "Built by the same team behind our", tail: ".", anchor: 1 },
  },
  {
    id: "ai-automation",
    hub: "it",
    href: "/services/it-services/ai-automation",
    name: "AI Automation",
    anchors: ["AI automation", "AI chatbots and automations"],
    blurb: "AI agents and workflows that save hours.",
    related: ["web-development", "app-development"],
    tags: ["ai", "automation", "chatbots"],
    upLink: { lead: "One of the", tail: " we offer.", anchor: 2 },
  },
  {
    id: "portfolio",
    hub: "it",
    href: "/services/it-services#our-work",
    name: "Our Work",
    anchors: ["websites we've built", "our portfolio"],
    blurb: "Live sites we've designed and launched.",
    related: ["web-development"],
    tags: ["portfolio", "case-study"],
  },
  {
    id: "it-quote",
    hub: "it",
    href: "/services/it-services/quote",
    name: "Project Brief",
    anchors: ["start a project brief", "get an IT estimate"],
    blurb: "Tell us what you need — estimate within 24 hours.",
    related: [],
    tags: ["quote"],
  },
]

function areaSpokes(): Spoke[] {
  return serviceAreas.map(({ slug }) => ({
    id: `area-${slug}`,
    hub: "security" as const,
    href: `/services/security-solutions/areas/${slug}`,
    name: `CCTV ${AREA_NAMES[slug]}`,
    anchors: [`CCTV installation ${AREA_NAMES[slug]}`],
    blurb: `Cameras, alarms and intercoms across ${AREA_NAMES[slug]}.`,
    // Suburb rule: CCTV + packages + the 2 nearest areas.
    related: ["cctv", "packages", ...nearestAreas(slug).map((s) => `area-${s}`)],
    tags: [slug],
    upLink: { lead: "Local installs are handled by the same team behind our", tail: ".", anchor: 1 },
  }))
}

// ── Lookups ──────────────────────────────────────────────────

export function getSpoke(id: string): Spoke | undefined {
  return spokes.find((s) => s.id === id)
}

export function getSpokeByHref(href: string): Spoke | undefined {
  return spokes.find((s) => s.href === href)
}

export function spokesOf(hub: HubId): Spoke[] {
  return spokes.filter((s) => s.hub === hub)
}

/** Siblings for a spoke's Related-services block (2–3, resolved). */
export function relatedSpokes(id: string): Spoke[] {
  const spoke = getSpoke(id)
  if (!spoke) return []
  return spoke.related
    .map(getSpoke)
    .filter((s): s is Spoke => Boolean(s))
}

export function hubAnchor(hub: HubId, variant = 0): string {
  const a = hubs[hub].anchors
  return a[variant % a.length]
}

/** Breadcrumb trail for a service page: Home › Hub › Spoke. */
export function serviceCrumbs(
  hub: HubId,
  leaf?: { name: string; href: string }
): [string, string][] {
  const crumbs: [string, string][] = [
    ["Home", "/"],
    [hubs[hub].name, hubs[hub].href],
  ]
  if (leaf) crumbs.push([leaf.name, leaf.href])
  return crumbs
}

// ── Hub → spoke in-text paragraphs ───────────────────────────
// A segment is plain text or a spoke id rendered as a keyword-anchored link.
// Each hub paragraph links every spoke exactly once.

export type Segment = string | { spoke: string; anchor?: number }

export const hubIntros: Record<HubId, Segment[]> = {
  security: [
    `${SECURITY_BRAND} handles `,
    { spoke: "cctv" },
    ", ",
    { spoke: "deterrence" },
    ", ",
    { spoke: "commercial" },
    ", ",
    { spoke: "access-control" },
    ", ",
    { spoke: "smoke-alarms" },
    " and ",
    { spoke: "intercoms" },
    ". Compare ",
    { spoke: "packages" },
    " or browse ",
    { spoke: "products" },
    ". We also have local pages for ",
    // One link per service area: "a, b, c and d."
    ...serviceAreas.flatMap((a, i, all): Segment[] => [
      { spoke: `area-${a.slug}` },
      i === all.length - 1 ? "." : i === all.length - 2 ? " and " : ", ",
    ]),
  ],
  "car-rental": [
    "Pick a car from ",
    { spoke: "fleet" },
    " and read the full ",
    { spoke: "rental-terms" },
    " before you apply.",
  ],
  it: [
    "We take on ",
    { spoke: "web-development" },
    ", ",
    { spoke: "app-development" },
    " and ",
    { spoke: "ai-automation" },
    ". See ",
    { spoke: "portfolio" },
    ", then ",
    { spoke: "it-quote" },
    ".",
  ],
}

// ── Homepage card CTAs (replace generic "Learn more") ────────
// Keyed by service href from src/data/services.ts.
export const cardAnchors: Record<string, string> = {
  "/services/it-services/web-development": "Web design & development",
  "/services/it-services/app-development": "Mobile app development",
  "/services/it-services/ai-automation": "AI automation services",
  "/services/security-solutions": "CCTV installation Brisbane",
  "/services/car-rental": "Weekly car rental Brisbane",
  "/services/it-services": "IT services Brisbane",
}

// ── Blog → services ──────────────────────────────────────────

/**
 * Picks 1 hub + up to 2 spokes for a blog post from its tags. The hub is the
 * one whose spokes match the most tags (falling back to `fallbackHub`), and
 * spokes are taken from that hub only, in tag order.
 */
export function blogServiceLinks(
  tags: string[],
  fallbackHub?: HubId
): { hub: Hub; spokes: Spoke[] } | null {
  const matches = tags.flatMap((t) =>
    spokes.filter((s) => s.tags.includes(t))
  )
  const score = new Map<HubId, number>()
  for (const s of matches) score.set(s.hub, (score.get(s.hub) ?? 0) + 1)
  const best: HubId | undefined =
    Array.from(score.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallbackHub
  if (!best) return null
  const picked: Spoke[] = []
  for (const s of matches) {
    if (s.hub === best && !picked.includes(s)) picked.push(s)
    if (picked.length === 2) break
  }
  return { hub: hubs[best], spokes: picked }
}

// ── Services → blog ──────────────────────────────────────────

/**
 * Posts whose tags overlap `tags`, best match first — the reverse of
 * blogServiceLinks, so spokes and hubs link back into the blog.
 */
export function postsForTags(tags: string[], limit = 2): BlogPost[] {
  return blogPosts
    .map((p) => ({ p, n: (p.tags ?? []).filter((t) => tags.includes(t)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((x) => x.p)
}

/** Every tag across a hub's spokes — what the hub's blog links match on. */
export function hubTags(hub: HubId): string[] {
  return spokesOf(hub).flatMap((s) => s.tags)
}
