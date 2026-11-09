/**
 * Internal link audit.
 *
 * Crawls a running copy of the site (start it first: `npm run build && npm start`)
 * from /sitemap.xml plus every internal link it discovers, then reports, for
 * each page, how many OTHER pages link to it:
 *   - content: links inside <main> (page body — what internal-linking work moves)
 *   - all:     including the site-wide header, mobile menu and footer
 * Pages with fewer than 3 content inbound links are flagged as orphans.
 * Also reports broken internal links (404 / other non-200) with the pages
 * linking to them, and pages that link to themselves in their body (a link
 * back to the same URL — pure #section jumps are fine and not counted).
 *
 * Reads the server-rendered HTML, i.e. what a crawler sees before JS runs, so
 * links injected by client-side fetches (product grids, fleet) don't count.
 *
 *   npx tsx scripts/link-audit.ts                 # http://localhost:3000
 *   BASE_URL=http://localhost:3001 npx tsx scripts/link-audit.ts
 *   npx tsx scripts/link-audit.ts --json          # machine-readable output
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const ORPHAN_THRESHOLD = 3
const AS_JSON = process.argv.includes("--json")

// Never crawled: admin / private / API areas (mirrors robots.ts).
const SKIP = [/^\/api\//, /^\/dashboard/, /^\/rental-admin/, /^\/lead-finder/, /^\/sign-agreement\//, /^\/_next\//]
const ASSET = /\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|xml|txt|json|js|css|woff2?)$/i

/** Normalise an href to a site path, or null if external / not a page. */
function toPath(href: string, from: string): string | null {
  if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return null
  let url: URL
  try {
    url = new URL(href.replace(/&amp;/g, "&"), BASE + from)
  } catch {
    return null
  }
  if (url.origin !== new URL(BASE).origin) return null
  let p = decodeURIComponent(url.pathname)
  if (p.length > 1) p = p.replace(/\/$/, "")
  if (ASSET.test(p) || SKIP.some((r) => r.test(p))) return null
  return p
}

function hrefs(html: string): string[] {
  const out: string[] = []
  const re = /<a\b[^>]*?\bhref\s*=\s*"([^"]*)"/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out.push(m[1])
  return out
}

/** Page body = the layout's <main> (first opening tag to last closing tag). */
function mainOf(html: string): string {
  const start = html.search(/<main[\s>]/i)
  const end = html.toLowerCase().lastIndexOf("</main>")
  return start >= 0 && end > start ? html.slice(start, end) : html
}

async function sitemapPaths(): Promise<string[]> {
  const res = await fetch(`${BASE}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml → HTTP ${res.status}`)
  const xml = await res.text()
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
    .map((m) => new URL(m[1]).pathname.replace(/(.)\/$/, "$1"))
}

async function main() {
  let seeds: string[]
  try {
    seeds = await sitemapPaths()
  } catch (e) {
    console.error(`Could not reach ${BASE} (${(e as Error).message}). Start the site first: npm run build && npm start`)
    process.exit(1)
  }

  const inSitemap = new Set(seeds)
  const queue = ["/", ...seeds]
  const seen = new Set<string>()
  const status = new Map<string, number>()
  const contentIn = new Map<string, Set<string>>()
  const allIn = new Map<string, Set<string>>()
  const selfLinks: string[] = []
  const add = (m: Map<string, Set<string>>, to: string, from: string) => {
    if (to === from) return
    if (!m.has(to)) m.set(to, new Set())
    m.get(to)!.add(from)
  }

  // Small worker pool — fast enough, and gentle on the dev DB.
  async function worker() {
    while (queue.length) {
      const path = queue.shift()!
      if (seen.has(path)) continue
      seen.add(path)
      let html = ""
      try {
        const res = await fetch(BASE + path, { redirect: "follow" })
        status.set(path, res.status)
        if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) continue
        html = await res.text()
      } catch {
        status.set(path, 0)
        continue
      }
      const body = mainOf(html)
      for (const h of hrefs(body)) {
        const to = toPath(h, path)
        if (!to) continue
        if (to === path) selfLinks.push(`${path}  (href="${h}")`)
        add(contentIn, to, path)
      }
      for (const h of hrefs(html)) {
        const to = toPath(h, path)
        if (!to) continue
        add(allIn, to, path)
        if (!seen.has(to)) queue.push(to)
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))

  const pages = Array.from(seen)
    .filter((p) => status.get(p) === 200)
    .sort()
    .map((p) => ({
      path: p,
      content: contentIn.get(p)?.size ?? 0,
      all: allIn.get(p)?.size ?? 0,
      inSitemap: inSitemap.has(p),
      from: Array.from(contentIn.get(p) ?? []).sort(),
    }))
  const orphans = pages.filter((p) => p.path !== "/" && p.content < ORPHAN_THRESHOLD)
  const broken = Array.from(status.entries())
    .filter(([, s]) => s !== 200)
    .map(([p, s]) => ({ path: p, status: s, linkedFrom: Array.from(allIn.get(p) ?? []) }))

  if (AS_JSON) {
    console.log(JSON.stringify({ base: BASE, pages, orphans: orphans.map((o) => o.path), broken, selfLinks }, null, 2))
    return
  }

  const w = Math.max(...pages.map((p) => p.path.length), 4)
  console.log(`\nInternal link audit — ${BASE}`)
  console.log(`${pages.length} pages crawled · inbound = distinct other pages linking in\n`)
  console.log(`${"PAGE".padEnd(w)}  CONTENT  ALL   SITEMAP`)
  console.log("-".repeat(w + 26))
  for (const p of pages) {
    const flag = p.path !== "/" && p.content < ORPHAN_THRESHOLD ? "  ⚠ orphan" : ""
    console.log(
      `${p.path.padEnd(w)}  ${String(p.content).padStart(7)}  ${String(p.all).padStart(3)}   ${p.inSitemap ? "yes" : "no "}${flag}`
    )
  }

  console.log(`\nOrphans (< ${ORPHAN_THRESHOLD} in-content inbound links): ${orphans.length}`)
  for (const o of orphans) {
    console.log(`  ${o.path}  (${o.content}${o.from.length ? ": " + o.from.join(", ") : ""})`)
  }
  const missing = seeds.filter((s) => !seen.has(s) || status.get(s) !== 200)
  const notFound = broken.filter((b) => b.status === 404)
  const otherBad = broken.filter((b) => b.status !== 404)
  console.log(`\nBroken internal links (404): ${notFound.length}`)
  for (const b of notFound) console.log(`  ${b.path}  ← linked from ${b.linkedFrom.join(", ") || "sitemap"}`)
  if (otherBad.length) {
    console.log(`\nOther non-200 responses: ${otherBad.length}`)
    for (const b of otherBad) console.log(`  ${b.path} → ${b.status || "fetch failed"}  (from ${b.linkedFrom.slice(0, 3).join(", ") || "sitemap"})`)
  }
  console.log(`\nSelf-links in page body: ${selfLinks.length}`)
  for (const s of selfLinks) console.log(`  ${s}`)
  if (missing.length) console.log(`\nSitemap URLs not reachable: ${missing.join(", ")}`)
  console.log("")
}

main()
