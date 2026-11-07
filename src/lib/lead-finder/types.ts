// Shared types for the Pak Oz lead finder.

export type WebsiteStatus = 'none' | 'social_only' | 'weak' | 'ok';

export type LeadStatus =
  | 'shortlisted'
  | 'demo_built'
  | 'contacted'
  | 'replied'
  | 'won'
  | 'not_interested';

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'demo_built', label: 'Demo built' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'won', label: 'Won' },
  { value: 'not_interested', label: 'Not interested' },
];

/** Services we can pitch. The AI picks from this list only. */
export const SERVICES = [
  'Website',
  'Online booking',
  'AI website chat agent',
  'WhatsApp auto-replies',
  'Facebook & Instagram DM automation',
  'Missed-call text-back',
  'Google review automation',
  'Social media post automation',
  'Quote & invoice automation',
] as const;
export type Service = (typeof SERVICES)[number];

export interface Lead {
  placeId: string;
  name: string;
  address: string;
  suburb: string;
  category: string | null;
  phone: string | null; // national format, e.g. 0494 421 150
  intlPhone: string | null; // +61 494 421 150
  whatsappNumber: string | null; // digits only, AU mobiles only, e.g. 61494421150
  mapsUrl: string | null;
  website: string | null;
  websiteStatus: WebsiteStatus;
  websiteIssues: string[];
  rating: number | null;
  reviewCount: number;
  hours: string[];
  reviews: string[]; // short review snippets (shown live, never stored)

  // AI scoring
  needScore: number | null; // 1–10
  painPoints: string[];
  services: Service[];
  pitch: string | null;
}

export interface SavedLead extends Partial<Lead> {
  placeId: string;
  status: LeadStatus;
  notes: string | null;
  searchQuery: string | null;
  contactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchRequest {
  businessType: string;
  country?: string; // ISO code from countries.ts, default AU
  city?: string;
  location?: string; // old name for city
  minReviews?: number;
  includeWeakSites?: boolean;
  limit?: number;
}

export interface SearchResponse {
  query: string;
  found: number; // businesses Google returned
  leads: Lead[];
  scoreError: string | null;
}
