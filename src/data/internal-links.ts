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
import { rentalSuburbs } from "@/data/car-rental-pages"
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
  /** In-page id to jump to instead, when the CTA sits on quoteHref itself. */
  quoteAnchor?: string
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

// Anchor convention (hubs and spokes): anchors[0] is the exact target keyword,
// the rest are natural phrases. Components rotate through them (see
// anchorFor) so roughly half the links sitewide use the exact keyword.

export const hubs: Record<HubId, Hub> = {
  security: {
    id: "security",
    href: "/services/security-solutions",
    name: "Security Solutions",
    anchors: [
      "CCTV installation in Brisbane",
      "Brisbane security installation service",
      "full range of security services",
    ],
    quoteHref: "/services/security-solutions/quote",
    quoteLabel: "Get a free security quote",
  },
  "car-rental": {
    id: "car-rental",
    href: "/services/car-rental",
    name: "Car Rental",
    // The hub targets the broad "car rental Brisbane". "Weekly / long-term"
    // and "Uber / DiDi" anchors belong to the long-term and rideshare spokes,
    // so they aren't used here: that would split the keywords across pages.
    anchors: [
      "car rental in Brisbane",
      "Brisbane car rental service",
      "car hire across Brisbane",
    ],
    // Car rental has no quote form: you apply for a specific car, and the
    // application opens from the fleet grid (VehicleGrid, id="vehicles").
    quoteHref: "/services/car-rental/vehicles",
    quoteAnchor: "vehicles",
    quoteLabel: "Choose a car and apply",
  },
  it: {
    id: "it",
    href: "/services/it-services",
    name: "IT & AI Services",
    anchors: [
      "web design in Brisbane",
      "web, app and AI services",
      IT_BRAND,
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

/** "in Logan" but "on the Gold Coast". */
const AREA_PREPOSITION: Record<string, string> = { "gold-coast": "on the" }

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
    anchors: ["home security cameras", "CCTV camera installation", "camera systems for homes and shops"],
    blurb: "HD cameras, NVR recording and phone viewing.",
    related: ["access-control", "intercoms", "packages"],
    tags: ["cctv", "security-cameras", "surveillance", "nvr"],
    upLink: { lead: "It's the core of our", tail: " work.", anchor: 0 },
  },
  {
    id: "deterrence",
    hub: "security",
    href: "/services/security-solutions/deterrence",
    name: "Alarms & Deterrence",
    anchors: ["alarm and deterrence systems", "alarms, sirens and floodlights"],
    blurb: "Alarm panels, sirens, sensors and floodlights.",
    related: ["cctv", "smoke-alarms", "products"],
    tags: ["alarms", "deterrence", "sirens", "motion-sensors"],
    upLink: { lead: "Pair it with cameras from our", tail: ".", anchor: 2 },
  },
  {
    id: "commercial",
    hub: "security",
    href: "/services/security-solutions/commercial-security",
    name: "Commercial Security",
    anchors: ["commercial security systems", "security for offices and warehouses"],
    blurb: "Multi-camera NVR and thermal systems for business.",
    related: ["cctv", "access-control", "products"],
    tags: ["commercial", "business-security", "warehouse"],
    upLink: { lead: "Designed and fitted by the team that does", tail: ".", anchor: 0 },
  },
  {
    id: "access-control",
    hub: "security",
    href: "/services/security-solutions/access-control",
    name: "Access Control",
    anchors: ["access control systems", "keypad and swipe-card entry"],
    blurb: "Keypads, biometric readers and gate control.",
    related: ["cctv", "intercoms", "commercial"],
    tags: ["access-control", "keypads", "biometric", "gates"],
    upLink: { lead: "It integrates with everything in our", tail: ".", anchor: 1 },
  },
  {
    id: "smoke-alarms",
    hub: "security",
    href: "/services/security-solutions/smoke-alarms",
    name: "Smoke Alarms",
    anchors: ["QLD-compliant smoke alarms", "interconnected smoke alarms"],
    blurb: "Photoelectric, interconnected and compliant.",
    related: ["deterrence", "intercoms", "products"],
    tags: ["smoke-alarms", "fire-safety", "compliance"],
    upLink: { lead: "Fitted by the licensed installers behind our", tail: ".", anchor: 2 },
  },
  {
    id: "intercoms",
    hub: "security",
    href: "/services/security-solutions/intercoms",
    name: "Video Intercoms",
    anchors: ["video intercom installation", "answering the door from your phone"],
    blurb: "See and talk to visitors from your phone.",
    related: ["access-control", "cctv", "commercial"],
    tags: ["intercoms", "video-intercom", "doorbell"],
    upLink: { lead: "Often installed alongside our", tail: ".", anchor: 0 },
  },
  {
    id: "packages",
    hub: "security",
    // No standalone page — packages render on each solution page (PackagesGrid
    // carries id="packages"); CCTV is the main one.
    href: "/services/security-solutions/surveillance-evidence#packages",
    name: "CCTV Packages",
    anchors: ["security camera packages", "ready-made CCTV bundles"],
    blurb: "Pre-configured camera bundles at a package price.",
    related: ["cctv", "products"],
    tags: ["packages", "cctv-kits", "bundles"],
  },
  {
    id: "products",
    hub: "security",
    href: "/services/security-solutions/products",
    name: "All Security Products",
    anchors: ["all security products", "the full product range"],
    blurb: "Every camera, alarm and intercom we install.",
    related: ["cctv", "packages", "access-control"],
    tags: ["products", "security-products"],
    upLink: { lead: "Everything here is supplied and fitted through our", tail: ".", anchor: 1 },
  },
  // Service-area pages (one per slug in src/data/service-areas.ts).
  ...areaSpokes(),

  // ── Car rental ──────────────────────────────────────────────
  {
    // The hub itself, as a Related-services sibling: car rental ↔ vehicles ↔
    // terms. No tags, so blog matching never picks it as a spoke.
    id: "car-rental-hub",
    hub: "car-rental",
    href: "/services/car-rental",
    name: "Car Rental",
    anchors: ["car rental in Brisbane", "Brisbane car rental service"],
    blurb: "Weekly payments, 4-week minimum, servicing included.",
    related: ["fleet", "rideshare", "long-term"],
    tags: [],
  },
  {
    id: "fleet",
    hub: "car-rental",
    href: "/services/car-rental/vehicles",
    name: "Vehicle Fleet",
    anchors: ["view our rental fleet", "every car on the yard"],
    blurb: "Every car on the yard with weekly rates.",
    related: ["car-rental-hub", "rideshare", "long-term"],
    tags: ["car-rental", "fleet", "vehicles"],
    upLink: { lead: "Every car here is part of our", tail: " service.", anchor: 0 },
  },
  {
    id: "rideshare",
    hub: "car-rental",
    href: "/services/car-rental/rideshare",
    name: "Rideshare Car Rental",
    anchors: [
      "rideshare car rental in Brisbane",
      "cars for Uber and DiDi drivers",
      "Uber car rental in Brisbane",
    ],
    blurb: "Weekly cars for Uber and DiDi drivers, unlimited km.",
    related: ["fleet", "long-term", "rental-terms"],
    tags: ["rideshare", "uber", "didi"],
    upLink: { lead: "It's part of our", tail: ", set up for drivers who work the apps.", anchor: 0 },
  },
  {
    id: "long-term",
    hub: "car-rental",
    href: "/services/car-rental/long-term",
    name: "Long-Term Car Rental",
    anchors: [
      "long term car rental in Brisbane",
      "weekly car rental in Brisbane",
      "renting a car week to week",
    ],
    blurb: "Four-week minimum, then week to week. Servicing included.",
    related: ["fleet", "rideshare", "rental-terms"],
    tags: ["long-term-rental", "weekly-rental", "car-rental"],
    upLink: { lead: "It's how every rental works at our", tail: ".", anchor: 1 },
  },
  {
    id: "rental-terms",
    hub: "car-rental",
    href: "/rental-terms",
    name: "Rental Terms",
    anchors: ["rental terms and conditions", "how the bond and excess work"],
    blurb: "Bond, minimum period and insurance excess.",
    related: ["car-rental-hub", "fleet", "long-term"],
    tags: ["rental-terms", "bond", "insurance"],
    upLink: { lead: "These terms apply to every vehicle in our", tail: ".", anchor: 2 },
  },
  // Suburb pages (one per slug in src/data/car-rental-pages.ts).
  ...rentalSuburbSpokes(),

  // ── IT ──────────────────────────────────────────────────────
  {
    id: "web-development",
    hub: "it",
    href: "/services/it-services/web-development",
    name: "Web Development",
    anchors: ["small business websites", "website design and development"],
    blurb: "Fast, SEO-ready websites built to convert.",
    related: ["ai-automation", "app-development", "portfolio"],
    tags: ["web-design", "websites", "seo", "web-development"],
    upLink: { lead: "Part of our", tail: " service.", anchor: 0 },
  },
  {
    id: "app-development",
    hub: "it",
    href: "/services/it-services/app-development",
    name: "App Development",
    anchors: ["app development", "iOS and Android apps"],
    blurb: "Cross-platform iOS and Android apps.",
    related: ["web-development", "ai-automation"],
    tags: ["apps", "mobile-apps", "app-development"],
    upLink: { lead: "Built by", tail: ", the same team behind our websites.", anchor: 2 },
  },
  {
    id: "ai-automation",
    hub: "it",
    href: "/services/it-services/ai-automation",
    name: "AI Automation",
    anchors: ["AI automation for small businesses", "online booking systems", "instant quote calculators"],
    blurb: "AI agents, booking systems and quote calculators.",
    related: ["web-development", "app-development"],
    tags: ["ai", "automation", "chatbots", "booking"],
    upLink: { lead: "One of the", tail: " we offer.", anchor: 1 },
  },
  {
    id: "portfolio",
    hub: "it",
    // No standalone page — the portfolio is a section on the IT hub.
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
  return serviceAreas.map(({ slug }, i) => ({
    id: `area-${slug}`,
    hub: "security" as const,
    href: `/services/security-solutions/areas/${slug}`,
    name: `CCTV ${AREA_NAMES[slug]}`,
    anchors: [
      `CCTV installation ${AREA_PREPOSITION[slug] ?? "in"} ${AREA_NAMES[slug]}`,
      `security cameras across ${AREA_PREPOSITION[slug] === "on the" ? "the " : ""}${AREA_NAMES[slug]}`,
    ],
    blurb: `Cameras, alarms and intercoms across ${AREA_NAMES[slug]}.`,
    // Suburb rule: CCTV + packages + the 2 nearest areas.
    related: ["cctv", "packages", ...nearestAreas(slug).map((s) => `area-${s}`)],
    tags: [slug],
    // Alternate exact / natural hub anchor across the area pages.
    upLink: { lead: "Local installs are handled by the same team behind our", tail: ".", anchor: i % 2 },
  }))
}

function rentalSuburbSpokes(): Spoke[] {
  return rentalSuburbs.map((s, i) => ({
    id: `car-rental-${s.slug}`,
    hub: "car-rental" as const,
    href: `/services/car-rental/${s.slug}`,
    name: `Car Rental ${s.name}`,
    anchors: [`car rental ${s.name}`, `weekly car hire in ${s.name}`],
    blurb: `Weekly hire, picked up close to ${s.name}.`,
    // Suburb rule: fleet + the nearest suburb page + rideshare.
    related: ["fleet", `car-rental-${s.nearbyPages[0]}`, "rideshare"],
    tags: [s.slug],
    upLink: { lead: "Local pickups are part of our", tail: ".", anchor: i % 2 },
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

/** Anchor variant n for a spoke (0 = exact keyword, wraps around). */
export function anchorFor(spoke: Spoke, n = 0): string {
  return spoke.anchors[n % spoke.anchors.length]
}

/** Stable per-page seed so different pages pick different anchor variants. */
export function seedOf(id: string): number {
  return Math.max(0, spokes.findIndex((s) => s.id === id))
}

/**
 * The href to use when linking to `target` from `currentPath` — never a link
 * from a page to itself. Same page with a #section becomes an in-page jump;
 * same page without one returns null (render plain text instead).
 */
export function hrefFrom(target: string, currentPath: string): string | null {
  const [path, hash] = target.split("#")
  if (path !== currentPath) return target
  return hash ? `#${hash}` : null
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
    `${SECURITY_BRAND} installs `,
    { spoke: "cctv", anchor: 0 },
    ", ",
    { spoke: "deterrence", anchor: 1 },
    ", ",
    { spoke: "commercial", anchor: 0 },
    ", ",
    { spoke: "access-control", anchor: 0 },
    ", ",
    { spoke: "smoke-alarms", anchor: 0 },
    " and handles ",
    { spoke: "intercoms", anchor: 1 },
    ". Compare our ",
    { spoke: "packages", anchor: 0 },
    " or browse ",
    { spoke: "products", anchor: 1 },
    ". We also have local pages for ",
    // One link per service area: "a, b, c and d."
    ...serviceAreas.flatMap((a, i, all): Segment[] => [
      { spoke: `area-${a.slug}`, anchor: i % 2 },
      i === all.length - 1 ? "." : i === all.length - 2 ? " and " : ", ",
    ]),
  ],
  "car-rental": [
    "Driving Uber or DiDi? See our ",
    { spoke: "rideshare", anchor: 0 },
    ". Need a car for a few months? Read how ",
    { spoke: "long-term", anchor: 0 },
    " works. Ready to drive? Go ahead and ",
    { spoke: "fleet", anchor: 0 },
    ", then check ",
    { spoke: "rental-terms", anchor: 1 },
    " before you apply. Close to the yard? We have local pages for ",
    // One link per suburb page: "a, b and c."
    ...rentalSuburbs.flatMap((s, i, all): Segment[] => [
      { spoke: `car-rental-${s.slug}`, anchor: 0 },
      i === all.length - 1 ? "." : i === all.length - 2 ? " and " : ", ",
    ]),
  ],
  it: [
    "We build ",
    { spoke: "web-development", anchor: 0 },
    ", ",
    { spoke: "app-development", anchor: 1 },
    " and ",
    { spoke: "ai-automation", anchor: 0 },
    ". See ",
    { spoke: "portfolio", anchor: 1 },
    ", then ",
    { spoke: "it-quote", anchor: 0 },
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
  "/services/car-rental": "Car rental Brisbane",
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
