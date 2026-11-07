// GET    /api/lead-finder/saved   — my saved leads, with live business details from Google
// Admin-only: middleware.ts checks the dashboard session cookie before this runs.
// POST   /api/lead-finder/saved   — save / update a lead (status, notes, scoring)
// DELETE /api/lead-finder/saved?placeId=...  — remove a saved lead
import { mapLimit } from '@/lib/lead-finder/audit';
import { deleteLead, listSavedLeads, upsertLead, type UpsertLeadInput } from '@/lib/lead-finder/db';
import { getPlace, toLead } from '@/lib/lead-finder/places';
import { LEAD_STATUSES, SERVICES, type LeadStatus, type SavedLead, type Service } from '@/lib/lead-finder/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const saved = await listSavedLeads();
    // Live details from Google (not stored). Skip finished leads to save API calls.
    const withDetails: SavedLead[] = await mapLimit(saved, 5, async (s) => {
      if (s.status === 'not_interested') return s;
      const place = await getPlace(s.placeId).catch(() => null);
      if (!place) return s;
      const live = toLead(place);
      return {
        ...s,
        name: live.name,
        address: live.address,
        suburb: live.suburb,
        category: live.category,
        phone: live.phone,
        intlPhone: live.intlPhone,
        whatsappNumber: live.whatsappNumber,
        mapsUrl: live.mapsUrl,
        website: live.website,
        rating: live.rating,
        reviewCount: live.reviewCount,
      };
    });
    return Response.json({ leads: withDetails });
  } catch (e) {
    console.error('[leads/saved GET]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Failed to load leads' }, { status: 500 });
  }
}

const validStatuses = new Set<string>(LEAD_STATUSES.map((s) => s.value));
const validServices = new Set<string>(SERVICES);

export async function POST(req: Request) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let b: any;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!b?.placeId || typeof b.placeId !== 'string') {
    return Response.json({ error: 'placeId is required' }, { status: 400 });
  }
  if (b.status && !validStatuses.has(b.status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  const input: UpsertLeadInput = {
    placeId: b.placeId.slice(0, 300),
    status: b.status as LeadStatus | undefined,
    notes: typeof b.notes === 'string' ? b.notes.slice(0, 2000) : undefined,
    searchQuery: typeof b.searchQuery === 'string' ? b.searchQuery.slice(0, 200) : undefined,
    needScore: typeof b.needScore === 'number' ? b.needScore : undefined,
    painPoints: Array.isArray(b.painPoints) ? b.painPoints.map(String).slice(0, 3) : undefined,
    services: Array.isArray(b.services)
      ? (b.services.map(String).filter((s: string) => validServices.has(s)) as Service[])
      : undefined,
    pitch: typeof b.pitch === 'string' ? b.pitch.slice(0, 300) : undefined,
    websiteStatus: ['none', 'social_only', 'weak', 'ok'].includes(b.websiteStatus) ? b.websiteStatus : undefined,
    websiteIssues: Array.isArray(b.websiteIssues) ? b.websiteIssues.map(String).slice(0, 8) : undefined,
  };

  try {
    const lead = await upsertLead(input);
    return Response.json({ lead });
  } catch (e) {
    console.error('[leads/saved POST]', e);
    return Response.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const placeId = new URL(req.url).searchParams.get('placeId');
  if (!placeId) return Response.json({ error: 'placeId is required' }, { status: 400 });
  await deleteLead(placeId);
  return Response.json({ ok: true });
}
