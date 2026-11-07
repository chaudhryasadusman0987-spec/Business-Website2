// Lead finder storage — a SEPARATE Neon database from the main site (env LEADS_URL),
// so prospecting never adds load to the catalog / rentals database.
// Server-only: import from route handlers, never from client components.
//
// Google's terms: we store ONLY the place_id plus OUR OWN data (status, notes, AI scoring,
// our website audit). Business name/phone/address/reviews are re-fetched live from Google.
//
// The table is called `prospects` (not `leads`) so it can't be confused with the
// contact-form leads that live on Vercel KV. It is created automatically on first use.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import type { LeadStatus, SavedLead, Service, WebsiteStatus } from "./types"

let client: NeonQueryFunction<false, false> | null = null
let schemaReady: Promise<void> | null = null

function sql(): NeonQueryFunction<false, false> {
  if (client) return client
  const url = process.env.LEADS_URL
  if (!url) throw new Error("LEADS_URL is not set — add the lead finder's Neon connection string")
  // no-store: otherwise the Next Data Cache wraps Neon's fetch and reads go stale.
  client = neon(url, { fetchOptions: { cache: "no-store" } })
  return client
}

async function db(): Promise<NeonQueryFunction<false, false>> {
  const q = sql()
  if (!schemaReady) {
    schemaReady = (async () => {
      await q`
        CREATE TABLE IF NOT EXISTS prospects (
          place_id        TEXT PRIMARY KEY,
          status          TEXT NOT NULL DEFAULT 'shortlisted'
                          CHECK (status IN ('shortlisted','demo_built','contacted','replied','won','not_interested')),
          notes           TEXT,
          search_query    TEXT,
          need_score      INTEGER CHECK (need_score BETWEEN 1 AND 10),
          pain_points     JSONB NOT NULL DEFAULT '[]'::jsonb,
          services        JSONB NOT NULL DEFAULT '[]'::jsonb,
          pitch           TEXT,
          website_status  TEXT,
          website_issues  JSONB NOT NULL DEFAULT '[]'::jsonb,
          contacted_at    TIMESTAMPTZ,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      await q`CREATE INDEX IF NOT EXISTS prospects_status_idx ON prospects (status)`
      await q`CREATE INDEX IF NOT EXISTS prospects_updated_idx ON prospects (updated_at DESC)`
    })().catch((e) => {
      schemaReady = null // retry next request
      throw e
    })
  }
  await schemaReady
  return q
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSaved(r: any): SavedLead {
  return {
    placeId: r.place_id,
    status: r.status,
    notes: r.notes,
    searchQuery: r.search_query,
    needScore: r.need_score,
    painPoints: r.pain_points ?? [],
    services: r.services ?? [],
    pitch: r.pitch,
    websiteStatus: r.website_status ?? undefined,
    websiteIssues: r.website_issues ?? [],
    contactedAt: r.contacted_at ? new Date(r.contacted_at).toISOString() : null,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }
}

export async function listSavedLeads(): Promise<SavedLead[]> {
  const q = await db()
  const rows = await q`SELECT * FROM prospects ORDER BY updated_at DESC LIMIT 200`
  return rows.map(rowToSaved)
}

/** Leads we must not show or message again. */
export async function blockedPlaceIds(): Promise<Set<string>> {
  const q = await db()
  const rows = await q`
    SELECT place_id FROM prospects WHERE status IN ('contacted','replied','won','not_interested')`
  return new Set(rows.map((r: any) => r.place_id as string))
}

export interface UpsertLeadInput {
  placeId: string
  status?: LeadStatus
  notes?: string | null
  searchQuery?: string | null
  needScore?: number | null
  painPoints?: string[]
  services?: Service[]
  pitch?: string | null
  websiteStatus?: WebsiteStatus
  websiteIssues?: string[]
}

export async function upsertLead(input: UpsertLeadInput): Promise<SavedLead> {
  const q = await db()
  const status = input.status ?? null
  const notes = input.notes ?? null
  const searchQuery = input.searchQuery ?? null
  const needScore = input.needScore ?? null
  const painPoints = input.painPoints ? JSON.stringify(input.painPoints) : null
  const services = input.services ? JSON.stringify(input.services) : null
  const pitch = input.pitch ?? null
  const websiteStatus = input.websiteStatus ?? null
  const websiteIssues = input.websiteIssues ? JSON.stringify(input.websiteIssues) : null

  const rows = await q`
    INSERT INTO prospects (place_id, status, notes, search_query, need_score, pain_points, services, pitch,
                           website_status, website_issues, contacted_at)
    VALUES (${input.placeId}, COALESCE(${status}::text, 'shortlisted'), ${notes}, ${searchQuery}, ${needScore}::int,
            COALESCE(${painPoints}::jsonb, '[]'::jsonb), COALESCE(${services}::jsonb, '[]'::jsonb), ${pitch},
            ${websiteStatus}, COALESCE(${websiteIssues}::jsonb, '[]'::jsonb),
            CASE WHEN ${status}::text = 'contacted' THEN now() END)
    ON CONFLICT (place_id) DO UPDATE SET
      status         = COALESCE(${status}::text, prospects.status),
      notes          = COALESCE(${notes}, prospects.notes),
      search_query   = COALESCE(${searchQuery}, prospects.search_query),
      need_score     = COALESCE(${needScore}::int, prospects.need_score),
      pain_points    = COALESCE(${painPoints}::jsonb, prospects.pain_points),
      services       = COALESCE(${services}::jsonb, prospects.services),
      pitch          = COALESCE(${pitch}, prospects.pitch),
      website_status = COALESCE(${websiteStatus}, prospects.website_status),
      website_issues = COALESCE(${websiteIssues}::jsonb, prospects.website_issues),
      contacted_at   = CASE WHEN ${status}::text = 'contacted' AND prospects.contacted_at IS NULL
                            THEN now() ELSE prospects.contacted_at END,
      updated_at     = now()
    RETURNING *`
  return rowToSaved(rows[0])
}

export async function deleteLead(placeId: string): Promise<void> {
  const q = await db()
  await q`DELETE FROM prospects WHERE place_id = ${placeId}`
}
