// Shared catalog override model. SAFE for both client and server (no node
// imports) — only types and pure functions live here.
//
// The public product/vehicle pages are built from the static data files
// (src/data/*). Admin additions/edits/removals are stored separately as an
// "overrides" object in KV (see catalog-store.ts) and merged on top of the
// static base at read time. This mirrors how the promo system works.

import type { SecurityProduct } from "@/types"
import type { Vehicle } from "@/data/car-rental"

export type { SecurityProduct } from "@/types"
export type { Vehicle } from "@/data/car-rental"

export interface SecuritySolutionOverride {
  added: SecurityProduct[]
  edits: Record<string, Partial<SecurityProduct>>
  removed: string[]
}

export interface VehiclesOverride {
  added: Vehicle[]
  edits: Record<string, Partial<Vehicle>>
  removed: string[]
}

export interface CatalogOverrides {
  // keyed by security solution id (e.g. "surveillance")
  security: Record<string, SecuritySolutionOverride>
  vehicles: VehiclesOverride
  updatedAt?: string
}

export const EMPTY_OVERRIDES: CatalogOverrides = {
  security: {},
  vehicles: { added: [], edits: {}, removed: [] },
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

  const veh = asObject(r.vehicles)
  return {
    security,
    vehicles: {
      added: Array.isArray(veh.added) ? (veh.added as Vehicle[]) : [],
      edits: asObject(veh.edits) as Record<string, Partial<Vehicle>>,
      removed: Array.isArray(veh.removed) ? (veh.removed as string[]) : [],
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

/** Effective vehicle list: base − removed + edits + added. */
export function mergeVehicles(base: Vehicle[], ov: CatalogOverrides): Vehicle[] {
  const o = ov.vehicles
  const kept = base
    .filter((v) => !o.removed.includes(v.id))
    .map((v) => ({ ...v, ...o.edits[v.id] }))
  return [...kept, ...o.added]
}

/** Stable-ish unique id for a newly added custom item. */
export function makeCustomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
