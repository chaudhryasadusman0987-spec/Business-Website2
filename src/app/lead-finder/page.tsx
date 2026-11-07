'use client';

// /lead-finder — lead finder. Separate from /dashboard: its own password
// (LEAD_FINDER_PASSWORD) and its own session cookie.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildMessage, whatsappLink } from '@/lib/lead-finder/messages';
import {
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
  type SavedLead,
  type SearchResponse,
  type WebsiteStatus,
} from '@/lib/lead-finder/types';

const BUSINESS_TYPES = [
  'mechanic', 'barber', 'hair salon', 'beauty salon', 'nail salon', 'restaurant', 'cafe', 'takeaway',
  'bakery', 'grocery store', 'cleaning service', 'plumber', 'electrician', 'landscaper', 'painter',
  'removalist', 'driving school', 'tutoring', 'childcare', 'physiotherapist', 'dentist', 'massage',
  'gym', 'tattoo studio', 'car detailing', 'towing', 'accountant', 'migration agent', 'real estate agent',
];
const LOCATIONS = [
  'Sunnybank QLD', 'Sunnybank Hills QLD', 'Calamvale QLD', 'Logan QLD', 'Woodridge QLD', 'Springwood QLD',
  'Browns Plains QLD', 'Beenleigh QLD', 'Inala QLD', 'Ipswich QLD', 'Brisbane CBD QLD', 'Gold Coast QLD',
  'Moreton Bay QLD', 'Sunshine Coast QLD',
];

const WEBSITE_BADGE: Record<WebsiteStatus, { label: string; cls: string }> = {
  none: { label: 'No website', cls: 'bg-red-100 text-red-800' },
  social_only: { label: 'Social media only', cls: 'bg-orange-100 text-orange-800' },
  weak: { label: 'Weak website', cls: 'bg-yellow-100 text-yellow-900' },
  ok: { label: 'Website OK', cls: 'bg-green-100 text-green-800' },
};

type CardLead = Partial<Lead> & { placeId: string; status?: LeadStatus; notes?: string | null };

export default function LeadsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [tab, setTab] = useState<'find' | 'mine'>('find');

  // search state
  const [businessType, setBusinessType] = useState('mechanic');
  const [location, setLocation] = useState('Sunnybank QLD');
  const [minReviews, setMinReviews] = useState(15);
  const [includeWeak, setIncludeWeak] = useState(true);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // saved state
  const [saved, setSaved] = useState<SavedLead[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');

  // login state
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // The lead finder session is its own httpOnly cookie (not the dashboard's).
  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setAuthed(d.leadFinder === true))
      .catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'leads', password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      setPassword('');
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/session?role=leads', { method: 'DELETE' }).catch(() => {});
    setSaved([]);
    setResult(null);
    setAuthed(false);
  }

  const api = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (res.status === 401) {
      setAuthed(false);
      throw new Error('Session expired — log in again');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data;
  }, []);

  const savedIds = useMemo(() => new Map(saved.map((s) => [s.placeId, s.status])), [saved]);

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const data = await api('/api/lead-finder/saved');
      setSaved(data.leads);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads');
    } finally {
      setLoadingSaved(false);
    }
  }, [api]);

  useEffect(() => {
    if (authed) loadSaved();
  }, [authed, loadSaved]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const data: SearchResponse = await api('/api/lead-finder/search', {
        method: 'POST',
        body: JSON.stringify({ businessType, location, minReviews, includeWeakSites: includeWeak, limit: 20 }),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function saveLead(lead: CardLead, patch: { status?: LeadStatus; notes?: string }) {
    try {
      await api('/api/lead-finder/saved', {
        method: 'POST',
        body: JSON.stringify({
          placeId: lead.placeId,
          searchQuery: result?.query,
          needScore: lead.needScore ?? undefined,
          painPoints: lead.painPoints,
          services: lead.services,
          pitch: lead.pitch ?? undefined,
          websiteStatus: lead.websiteStatus,
          websiteIssues: lead.websiteIssues,
          ...patch,
        }),
      });
      await loadSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  }

  async function removeLead(placeId: string) {
    try {
      await api(`/api/lead-finder/saved?placeId=${encodeURIComponent(placeId)}`, { method: 'DELETE' });
      setSaved((s) => s.filter((x) => x.placeId !== placeId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  function exportCsv() {
    const rows = filteredSaved.map((l) => [
      l.name ?? '', l.suburb ?? '', l.phone ?? '', l.status, l.needScore ?? '',
      (l.services ?? []).join('; '), (l.painPoints ?? []).join('; '), l.pitch ?? '', l.notes ?? '', l.mapsUrl ?? '',
    ]);
    const header = ['Name', 'Suburb', 'Phone', 'Status', 'Need score', 'Services', 'Pain points', 'Pitch', 'Notes', 'Google Maps'];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pakoz-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredSaved = saved.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  // ---------- login gate: separate lead finder password ----------
  if (authed !== true) {
    return (
      <main className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-bold text-[#1a1a2e]">Lead finder</h1>
          {authed === null ? (
            <p className="text-sm text-gray-600">Checking login…</p>
          ) : (
            <form onSubmit={login} className="space-y-3">
              <input
                type="password"
                autoFocus
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
              />
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <button
                type="submit"
                disabled={loggingIn || !password}
                className="block w-full bg-[#7f85f7] text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
              >
                {loggingIn ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-[#1a1a2e]">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-end">
          <button onClick={logout} className="text-sm text-[#7f85f7] font-semibold">Log out</button>
        </div>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Lead finder</h1>
            <p className="text-sm text-gray-600">Small businesses that need a website, booking, WhatsApp, Facebook &amp; Instagram automation.</p>
          </div>
          <nav className="flex gap-2">
            <TabButton active={tab === 'find'} onClick={() => setTab('find')}>Find leads</TabButton>
            <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>My leads ({saved.length})</TabButton>
          </nav>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm flex justify-between gap-2">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss">✕</button>
          </div>
        )}

        {tab === 'find' && (
          <>
            <form onSubmit={runSearch} className="bg-white rounded-2xl shadow-sm p-5 grid gap-4 sm:grid-cols-2">
              <Field label="Business type" htmlFor="bt">
                <input id="bt" list="bt-list" value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" required />
                <datalist id="bt-list">{BUSINESS_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
              </Field>
              <Field label="Location" htmlFor="loc">
                <input id="loc" list="loc-list" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" required />
                <datalist id="loc-list">{LOCATIONS.map((t) => <option key={t} value={t} />)}</datalist>
              </Field>
              <Field label="Minimum Google reviews" htmlFor="mr">
                <select id="mr" value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2">
                  {[0, 5, 15, 30, 50, 100].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm mt-6">
                <input type="checkbox" checked={includeWeak} onChange={(e) => setIncludeWeak(e.target.checked)} className="w-5 h-5" />
                Include businesses with a weak website
              </label>
              <button disabled={searching}
                className="sm:col-span-2 bg-[#7f85f7] disabled:opacity-60 text-white font-semibold rounded-lg py-3">
                {searching ? 'Searching… (about 20–40 seconds)' : 'Find up to 20 leads'}
              </button>
            </form>

            {result && (
              <section className="space-y-3">
                <p className="text-sm text-gray-600">
                  Google found {result.found} businesses for “{result.query}”. Showing the {result.leads.length} best leads.
                  {result.scoreError && <span className="text-orange-700"> AI scoring: {result.scoreError}.</span>}
                </p>
                {result.leads.length === 0 && (
                  <p className="bg-white rounded-xl p-6 text-center text-gray-600">
                    No matching leads. Try another suburb, a lower review minimum, or include weak websites.
                  </p>
                )}
                {result.leads.map((lead) => (
                  <LeadCard key={lead.placeId} lead={lead} savedStatus={savedIds.get(lead.placeId)}
                    onShortlist={() => saveLead(lead, { status: 'shortlisted' })} />
                ))}
              </section>
            )}
          </>
        )}

        {tab === 'mine' && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm" htmlFor="sf">Show</label>
              <select id="sf" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">All</option>
                {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={loadSaved} className="text-sm border rounded-lg px-3 py-2">Refresh</button>
              <button onClick={exportCsv} disabled={!filteredSaved.length} className="text-sm border rounded-lg px-3 py-2 disabled:opacity-50">Export CSV</button>
            </div>
            {loadingSaved && <p className="text-sm text-gray-600">Loading…</p>}
            {!loadingSaved && filteredSaved.length === 0 && (
              <p className="bg-white rounded-xl p-6 text-center text-gray-600">No saved leads yet. Shortlist some from “Find leads”.</p>
            )}
            {filteredSaved.map((lead) => (
              <LeadCard key={lead.placeId} lead={lead} savedStatus={lead.status} editable
                onStatus={(status) => saveLead(lead, { status })}
                onNotes={(notes) => saveLead(lead, { notes })}
                onDelete={() => removeLead(lead.placeId)} />
            ))}
          </section>
        )}

        <footer className="text-xs text-gray-500 pt-4">Business data from Google. Always include your name and the STOP line when messaging.</footer>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold ${active ? 'bg-[#1a1a2e] text-white' : 'bg-white border'}`}>
      {children}
    </button>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function LeadCard({
  lead, savedStatus, editable, onShortlist, onStatus, onNotes, onDelete,
}: {
  lead: CardLead;
  savedStatus?: LeadStatus;
  editable?: boolean;
  onShortlist?: () => void;
  onStatus?: (s: LeadStatus) => void;
  onNotes?: (n: string) => void;
  onDelete?: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [copied, setCopied] = useState(false);
  const badge = WEBSITE_BADGE[lead.websiteStatus ?? 'none'];
  const message = buildMessage({
    name: lead.name ?? 'there',
    websiteStatus: lead.websiteStatus ?? 'none',
    services: lead.services ?? [],
    pitch: lead.pitch ?? null,
  });
  const score = lead.needScore ?? null;
  const scoreCls = score == null ? 'bg-gray-100 text-gray-700' : score >= 8 ? 'bg-[#1a1a2e] text-white' : score >= 5 ? 'bg-[#7f85f7] text-white' : 'bg-gray-200 text-gray-800';

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight">{lead.name ?? 'Loading…'}</h2>
          <p className="text-sm text-gray-600">
            {[lead.category, lead.suburb].filter(Boolean).join(' · ')}
            {lead.rating != null && <> · ★ {lead.rating} ({lead.reviewCount} reviews)</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoreCls}`}>
            Need {score ?? '–'}/10
          </span>
        </div>
      </div>

      {!!lead.painPoints?.length && (
        <ul className="text-sm list-disc pl-5 text-gray-800">{lead.painPoints.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
      {!!lead.services?.length && (
        <div className="flex flex-wrap gap-2">
          {lead.services.map((s) => (
            <span key={s} className="text-xs bg-[#eef0ff] text-[#3b3f9e] px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      )}
      {lead.pitch && <p className="text-sm"><span className="font-semibold">Pitch:</span> {lead.pitch}</p>}
      {!!lead.websiteIssues?.length && lead.websiteStatus === 'weak' && (
        <p className="text-xs text-gray-600">Website issues: {lead.websiteIssues.join(' · ')}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {lead.whatsappNumber && (
          <a href={whatsappLink(lead.whatsappNumber, message)} target="_blank" rel="noopener noreferrer"
            className="bg-[#25d366] text-white text-sm font-semibold px-4 py-2.5 rounded-lg">WhatsApp</a>
        )}
        {lead.phone && <a href={`tel:${lead.intlPhone ?? lead.phone}`} className="border text-sm font-semibold px-4 py-2.5 rounded-lg">Call {lead.phone}</a>}
        <button onClick={copy} className="border text-sm px-4 py-2.5 rounded-lg">{copied ? 'Copied ✓' : 'Copy message'}</button>
        {lead.mapsUrl && <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="border text-sm px-4 py-2.5 rounded-lg">Google Maps</a>}
        {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="border text-sm px-4 py-2.5 rounded-lg">Their site</a>}
        {!editable && (
          savedStatus
            ? <span className="text-sm px-4 py-2.5 text-green-700 font-semibold">Saved · {LEAD_STATUSES.find((s) => s.value === savedStatus)?.label}</span>
            : <button onClick={onShortlist} className="bg-[#7f85f7] text-white text-sm font-semibold px-4 py-2.5 rounded-lg">Shortlist</button>
        )}
      </div>

      {editable && (
        <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] items-start border-t pt-3">
          <select value={savedStatus} onChange={(e) => onStatus?.(e.target.value as LeadStatus)}
            className="border rounded-lg px-3 py-2 text-sm" aria-label="Lead status">
            {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (lead.notes ?? '') && onNotes?.(notes)}
            placeholder="Notes (demo link, what they said…)" rows={2} className="border rounded-lg px-3 py-2 text-sm" aria-label="Notes" />
          <button onClick={onDelete} className="text-sm text-red-700 px-3 py-2">Remove</button>
        </div>
      )}
    </article>
  );
}
