// POST /api/lead-finder/search  — find up to 20 small businesses that need a website / automation.
// Admin-only: middleware.ts checks the dashboard session cookie before this runs.
import { auditWebsite, mapLimit } from '@/lib/lead-finder/audit';
import { blockedPlaceIds } from '@/lib/lead-finder/db';
import { isChain, searchPlaces, toLead } from '@/lib/lead-finder/places';
import { ScoreError, scoreLeads } from '@/lib/lead-finder/score';
import type { Lead, SearchRequest, SearchResponse, WebsiteStatus } from '@/lib/lead-finder/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const STATUS_RANK: Record<WebsiteStatus, number> = { none: 3, social_only: 3, weak: 2, ok: 0 };

export async function POST(req: Request) {

  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const businessType = String(body.businessType ?? '').trim().slice(0, 60);
  const location = String(body.location ?? '').trim().slice(0, 60);
  if (!businessType || !location) {
    return Response.json({ error: 'Enter a business type and a location' }, { status: 400 });
  }
  const minReviews = Math.max(0, Number(body.minReviews ?? 15));
  const includeWeakSites = body.includeWeakSites !== false;
  const limit = Math.min(20, Math.max(1, Number(body.limit ?? 20)));
  const query = `${businessType} in ${location}, Australia`;

  try {
    // 1. Google Places (up to 60 businesses, 3 requests)
    const raw = await searchPlaces(query, 60);
    const blocked = await blockedPlaceIds().catch(() => new Set<string>());

    // 2. Basic filters: open, has phone, enough reviews, not a chain, not already contacted
    let leads: Lead[] = raw
      .filter((p) => !p.businessStatus || p.businessStatus === 'OPERATIONAL')
      .map(toLead)
      .filter((l) => l.phone && l.reviewCount >= minReviews && !isChain(l.name) && !blocked.has(l.placeId));

    // 3. Website check (only real websites need fetching)
    const audits = await mapLimit(leads, 6, (l) => auditWebsite(l.website));
    leads = leads.map((l, i) => ({ ...l, websiteStatus: audits[i].status, websiteIssues: audits[i].issues }));

    leads = leads.filter((l) =>
      l.websiteStatus === 'none' || l.websiteStatus === 'social_only' || (includeWeakSites && l.websiteStatus === 'weak'),
    );

    // 4. Pre-rank, keep the best 30 for AI scoring
    leads.sort(
      (a, b) =>
        STATUS_RANK[b.websiteStatus] - STATUS_RANK[a.websiteStatus] ||
        Number(Boolean(b.whatsappNumber)) - Number(Boolean(a.whatsappNumber)) ||
        b.reviewCount - a.reviewCount,
    );
    leads = leads.slice(0, 30);

    // 5. AI scoring — one Gemini request for the whole batch
    let scoreError: string | null = null;
    try {
      const scores = await scoreLeads(leads, businessType);
      leads = leads.map((l) => {
        const s = scores.get(l.placeId);
        return s ? { ...l, ...s } : l;
      });
    } catch (e) {
      scoreError = e instanceof ScoreError ? e.message : 'AI scoring unavailable — try again later';
    }

    // 6. Final rank
    leads.sort(
      (a, b) =>
        (b.needScore ?? 0) - (a.needScore ?? 0) ||
        STATUS_RANK[b.websiteStatus] - STATUS_RANK[a.websiteStatus] ||
        b.reviewCount - a.reviewCount,
    );

    const response: SearchResponse = { query, found: raw.length, leads: leads.slice(0, limit), scoreError };
    return Response.json(response);
  } catch (e) {
    console.error('[leads/search]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Search failed' }, { status: 500 });
  }
}
