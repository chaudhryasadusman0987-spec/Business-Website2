// Shared catalog override model. SAFE for both client and server (no node
// imports) — only types and pure functions live here.
//
// The public product pages are built from the static data files (src/data/*).
// Admin additions/edits/removals are stored separately as an "overrides" object
// in KV (see catalog-store.ts) and merged on top of the static base at read
// time. This mirrors how the promo system works.
//
// Car rental vehicles are NOT here: the fleet moved to its own Postgres table
// (src/lib/vehicles.ts + src/lib/db.ts) so the dashboard can add cars, photos
// and weekly rates outright rather than patching a static list.

import type { SecurityProduct } from "@/types"
import type { ITPackage, ITService, ITServiceItem } from "@/data/it-services"

export type { SecurityProduct } from "@/types"

export interface SecuritySolutionOverride {
  added: SecurityProduct[]
  edits: Record<string, Partial<SecurityProduct>>
  removed: string[]
}

/** The service-level fields the dashboard's "Service Overview" card can edit. */
export type ITServiceOverviewEdit = Partial<
  Pick<ITServiceItem, "tagline" | "startingFrom" | "description">
>

/**
 * The estimate fields the dashboard's "Estimated Price Range" card can edit.
 * These drive the /services/it-services landing page and its quote form, which
 * show a guide range rather than a fixed price.
 */
export type ITServiceEstimateEdit = Partial<
  Pick<ITService, "estimatedFrom" | "estimatedTo" | "estimatedDisplay" | "features" | "badge">
>

export interface ITServicesOverride {
  /** Overview edits, keyed by service id (e.g. "web-development"). */
  services: Record<string, ITServiceOverviewEdit>
  /**
   * Package edits, keyed by `${serviceId}:${packageId}` — the same composite
   * key the dashboard UI uses. Package ids are unique today, but keying by the
   * pair keeps this correct if two services ever reuse one.
   */
  packages: Record<string, Partial<ITPackage>>
  /** Estimate-range edits, keyed by service id. */
  estimates: Record<string, ITServiceEstimateEdit>
}

export interface CatalogOverrides {
  // keyed by security solution id (e.g. "surveillance")
  security: Record<string, SecuritySolutionOverride>
  itServices: ITServicesOverride
  updatedAt?: string
}

export const EMPTY_OVERRIDES: CatalogOverrides = {
  security: {},
  itServices: { services: {}, packages: {}, estimates: {} },
}

/** Composite key for one package override. */
export function itPackageKey(serviceId: string, packageId: string): string {
  return `${serviceId}:${packageId}`
}

export const EMPTY_SOLUTION_OVERRIDE: SecuritySolutionOverride = {
  added: [],
  edits: {},
  removed: [],
}

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {}
}

/** Defensive normalisation — KV may hold a partial / older-shaped object. */
export function normaliseOverrides(raw: unknown): CatalogOverrides {
  const r = asObject(raw)

  const security: Record<string, SecuritySolutionOverride> = {}
  const secRaw = asObject(r.security)
  for (const [key, val] of Object.entries(secRaw)) {
    const o = asObject(val)
    security[key] = {
      added: Array.isArray(o.added) ? (o.added as SecurityProduct[]) : [],
      edits: asObject(o.edits) as Record<string, Partial<SecurityProduct>>,
      removed: Array.isArray(o.removed) ? (o.removed as string[]) : [],
    }
  }

  // A `vehicles` key may still be present in an old stored document — it is
  // dropped here, and on the next write, now the fleet lives in Postgres.
  const it = asObject(r.itServices)
  return {
    security,
    itServices: {
      services: asObject(it.services) as Record<string, ITServiceOverviewEdit>,
      packages: asObject(it.packages) as Record<string, Partial<ITPackage>>,
      // Absent in documents written before the estimate model existed.
      estimates: asObject(it.estimates) as Record<string, ITServiceEstimateEdit>,
    },
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : undefined,
  }
}

/** Effective product list for one security solution: base − removed + edits + added. */
export function mergeSecurityProducts(
  solutionId: string,
  base: SecurityProduct[],
  ov: CatalogOverrides,
): SecurityProduct[] {
  const o = ov.security[solutionId]
  if (!o) return base
  const kept = base
    .filter((p) => !o.removed.includes(p.id))
    .map((p) => ({ ...p, ...o.edits[p.id] }))
  return [...kept, ...o.added]
}

/**
 * Effective IT services list: base data file + admin overview/package edits.
 *
 * Unlike security/vehicles there is no add/remove here — the dashboard only
 * edits the built-in services and their packages, so the shape of the list is
 * always the static one.
 */
export function mergeITServices(
  base: ITServiceItem[],
  ov: CatalogOverrides,
): ITServiceItem[] {
  const o = ov.itServices
  return base.map((svc) => ({
    ...svc,
    ...o.services[svc.id],
    packages: svc.packages.map((p) => ({
      ...p,
      ...o.packages[itPackageKey(svc.id, p.id)],
    })),
  }))
}

/** Display text for an estimate range, e.g. "$1,500 – $8,000". */
export function formatEstimateRange(from: number, to: number): string {
  const n = (v: number) => Math.round(v).toLocaleString("en-AU")
  return `$${n(from)} – $${n(to)}`
}

/**
 * Effective estimate-led service list: data-file defaults + admin edits.
 *
 * Used by the IT services landing page (server) and the quote form (client),
 * which both show a guide range, never a fixed price.
 */
export function mergeITEstimates(base: ITService[], ov: CatalogOverrides): ITService[] {
  const edits = ov.itServices.estimates
  return base.map((svc) => {
    const e = edits[svc.id]
    if (!e) return svc
    const merged = { ...svc, ...e }
    // Keep the display text honest if only the numbers were saved.
    if (!e.estimatedDisplay) {
      merged.estimatedDisplay = formatEstimateRange(merged.estimatedFrom, merged.estimatedTo)
    }
    return merged
  })
}

/** Stable-ish unique id for a newly added custom item. */
export function makeCustomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
