// Quick, polite website check: does this business have a *proper* website?
import type { WebsiteStatus } from './types';

const SOCIAL_ONLY =
  /(facebook\.com|fb\.com|fb\.me|instagram\.com|linktr\.ee|linkin\.bio|beacons\.ai|business\.site|sites\.google\.com|tiktok\.com|wa\.me|whatsapp\.com|m\.me\/)/i;

const BOOKING =
  /(book now|book online|booking|appointment|schedule|reserve|reservation|order online|calendly|fresha|setmore|timely|square\.site|squareup|simplybook|halaxy|cliniko|opentable|quandoo|resdiary|mr ?yum|hungry ?panda|uber ?eats|doordash|menulog)/i;

const CHAT_OR_WHATSAPP =
  /(tawk\.to|tidio|intercom|crisp\.chat|livechat|zendesk|drift\.com|hs-scripts|hubspot|chatwoot|manychat|wa\.me|api\.whatsapp|whatsapp\.com\/send|m\.me\/|messenger)/i;

const SOCIAL_LINKS = /(instagram\.com|facebook\.com|tiktok\.com)/i;

export interface AuditResult {
  status: WebsiteStatus;
  issues: string[];
}

// The URL comes from a public Google listing, which any business owner can set.
// Only fetch public http(s) hosts so a listing can't point our server at
// localhost or a private network address.
export function isPublicHttpUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || /\.(localhost|local|internal)$/.test(host)) return false;
  if (host.startsWith('[') || host.includes(':')) return false; // IPv6 literals: real business sites use names
  if (/^\d+(\.\d+){3}$/.test(host)) {
    const [a, b] = host.split('.').map(Number);
    if (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    ) return false;
  }
  return true;
}

export async function auditWebsite(url: string | null): Promise<AuditResult> {
  if (!url) return { status: 'none', issues: ['No website'] };
  if (SOCIAL_ONLY.test(url)) {
    return { status: 'social_only', issues: ['Only a social media page, no real website'] };
  }
  if (!isPublicHttpUrl(url)) return { status: 'weak', issues: ['Website address is not valid'] };

  const issues: string[] = [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    // Follow redirects by hand so every hop gets the same public-address check.
    let finalUrl = url;
    let res: Response | null = null;
    for (let hop = 0; hop < 5; hop++) {
      res = await fetch(finalUrl, {
        signal: ctrl.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebsiteHealthCheck/1.0)' },
        cache: 'no-store',
      });
      const location = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
      if (!location) break;
      finalUrl = new URL(location, finalUrl).toString();
      if (SOCIAL_ONLY.test(finalUrl)) break;
      if (!isPublicHttpUrl(finalUrl)) {
        clearTimeout(timer);
        return { status: 'weak', issues: ['Website redirects to an invalid address'] };
      }
      res = null;
    }
    clearTimeout(timer);

    if (SOCIAL_ONLY.test(finalUrl)) {
      return { status: 'social_only', issues: ['Website redirects to a social media page'] };
    }
    if (!res) return { status: 'weak', issues: ['Website has too many redirects'] };
    if (!res.ok) return { status: 'weak', issues: [`Website shows an error (${res.status})`] };

    const html = (await res.text()).slice(0, 500_000);

    if (!finalUrl.startsWith('https://')) issues.push('No HTTPS (browsers show "Not secure")');
    if (!/<meta[^>]+name=["']?viewport/i.test(html)) issues.push('Not mobile friendly');
    if (!BOOKING.test(html)) issues.push('No online booking or ordering');
    if (!CHAT_OR_WHATSAPP.test(html)) issues.push('No chat or WhatsApp button');
    if (!SOCIAL_LINKS.test(html)) issues.push('No links to Facebook or Instagram');

    const year = html.match(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/i)?.[1];
    if (year && Number(year) < new Date().getFullYear() - 2) issues.push(`Looks outdated (© ${year})`);
    if (html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length < 400) {
      issues.push('Almost no content on the homepage');
    }
  } catch {
    return { status: 'weak', issues: ['Website not loading'] };
  }

  return { status: issues.length >= 2 ? 'weak' : 'ok', issues };
}

/** Run async jobs with a concurrency limit. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}
