// Google Places API (New) — server-side only.
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
import type { Lead } from './types';

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

const PLACE_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'rating',
  'userRatingCount',
  'regularOpeningHours',
  'reviews',
  'googleMapsUri',
  'businessStatus',
  'primaryTypeDisplayName',
];

const SEARCH_FIELD_MASK = PLACE_FIELDS.map((f) => `places.${f}`).join(',') + ',nextPageToken';
// Details for saved leads: no reviews needed (cheaper).
const DETAIL_FIELD_MASK = PLACE_FIELDS.filter((f) => f !== 'reviews').join(',');

/** Big chains and franchises we don't want to pitch. Edit freely. */
export const CHAIN_BLOCKLIST = [
  'ultra tune', 'mycar', 'bob jane', 'midas', 'kmart tyre', 'jax tyres', 'beaurepaires',
  "mcdonald", 'kfc', 'hungry jack', 'subway', 'domino', 'pizza hut', 'guzman', 'grill\'d',
  'oporto', 'red rooster', 'nando', 'boost juice', 'gloria jean', 'starbucks', 'zarraffa',
  'just cuts', 'jim\'s', 'snap fitness', 'anytime fitness', 'f45', 'bupa', 'priceline',
  'chemist warehouse', 'terry white', 'woolworths', 'coles', 'aldi', 'iga', '7-eleven',
  'bunnings', 'officeworks', 'jb hi-fi', 'harvey norman', 'repco', 'supercheap',
];

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY is not set');
  return key;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function searchPlaces(textQuery: string, maxResults = 60): Promise<any[]> {
  const out: any[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey(),
        'X-Goog-FieldMask': SEARCH_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        pageSize: 20,
        regionCode: 'AU',
        languageCode: 'en',
        ...(pageToken ? { pageToken } : {}),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Google Places search failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    }
    const data = await res.json();
    out.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken && out.length < maxResults);

  return out.slice(0, maxResults);
}

export async function getPlace(placeId: string): Promise<any | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { 'X-Goog-Api-Key': apiKey(), 'X-Goog-FieldMask': DETAIL_FIELD_MASK },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

/** "61 Shelley St, Sunnybank QLD 4109, Australia" -> "Sunnybank QLD" */
export function suburbFromAddress(address: string): string {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  const candidate = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? '';
  return candidate.replace(/\s+\d{4}$/, '');
}

/** Only Australian mobiles (04xx / +614xx) can receive WhatsApp reliably. */
export function whatsappNumberFrom(intlPhone: string | null | undefined): string | null {
  if (!intlPhone) return null;
  const digits = intlPhone.replace(/\D/g, '');
  return /^614\d{8}$/.test(digits) ? digits : null;
}

export function isChain(name: string): boolean {
  const n = name.toLowerCase();
  return CHAIN_BLOCKLIST.some((c) => n.includes(c));
}

export function toLead(p: any): Lead {
  const address: string = p.formattedAddress ?? '';
  const reviews: string[] = (p.reviews ?? [])
    .map((r: any) => (r.originalText?.text ?? r.text?.text ?? '').trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    placeId: p.id,
    name: p.displayName?.text ?? 'Unknown',
    address,
    suburb: suburbFromAddress(address),
    category: p.primaryTypeDisplayName?.text ?? null,
    phone: p.nationalPhoneNumber ?? null,
    intlPhone: p.internationalPhoneNumber ?? null,
    whatsappNumber: whatsappNumberFrom(p.internationalPhoneNumber),
    mapsUrl: p.googleMapsUri ?? null,
    website: p.websiteUri ?? null,
    websiteStatus: 'none',
    websiteIssues: [],
    rating: typeof p.rating === 'number' ? p.rating : null,
    reviewCount: p.userRatingCount ?? 0,
    hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
    reviews,
    needScore: null,
    painPoints: [],
    services: [],
    pitch: null,
  };
}
