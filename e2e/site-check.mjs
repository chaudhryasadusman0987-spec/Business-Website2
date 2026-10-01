// Read-only usability + health check for the whole public site.
//
// Crawls every internal page reachable from "/" and, at desktop and phone
// widths, reports:
//   - HTTP errors, JS exceptions and console errors
//   - missing/duplicate <title>, missing meta description, h1 count
//   - images without alt, unlabeled form fields, nameless buttons/links
//   - horizontal scrolling on phones, tap targets under 24px
// Then runs a few user flows (contact form validation + submit, AI chat,
// 404 page, dashboard login gate). Every write endpoint is intercepted and
// answered with a fake success, so this sends no email and saves no lead.
//
// Usage (server must already be running):
//   node e2e/site-check.mjs
// Env: BASE_URL (default http://localhost:3000), PW_EXECUTABLE, OUTDIR,
//      ADMIN_PASSWORD (optional — enables the dashboard login check)

import { chromium } from "playwright-core"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { mkdirSync, writeFileSync } from "node:fs"

const HERE = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const OUT = process.env.OUTDIR ?? join(HERE, "screenshots", "site-check")
const EXECUTABLE =
  process.env.PW_EXECUTABLE ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
const MAX_PAGES = 120
const SKIP = /^\/(api|dashboard|rental-admin|sign-agreement)(\/|$)/
const CONTACT_FORM = "form:has(textarea[name=\"message\"])"

mkdirSync(OUT, { recursive: true })

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
}

// Any POST/PATCH/DELETE to our API gets a canned success instead of running.
async function blockWrites(ctx) {
  await ctx.route("**/api/**", (route) => {
    const req = route.request()
    if (req.method() === "GET" || req.url().includes("/api/admin/session")) return route.continue()
    const reply = req.url().includes("/api/chat")
      ? { reply: "Test reply from the site check.", leadCollected: false }
      : { success: true, id: "site-check" }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply) })
  })
}

// Runs in the page: collects usability problems for the current viewport.
function audit() {
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"
  }
  const name = (el) =>
    (el.getAttribute("aria-label") || "").trim() ||
    (el.getAttribute("aria-labelledby") &&
      document.getElementById(el.getAttribute("aria-labelledby"))?.textContent?.trim()) ||
    (el.getAttribute("title") || "").trim() ||
    (el.textContent || "").trim() ||
    [...el.querySelectorAll("img[alt]")].map((i) => i.alt).join(" ").trim()
  const describe = (el) => {
    const t = (el.textContent || el.getAttribute("placeholder") || el.getAttribute("name") || "").trim()
    return `<${el.tagName.toLowerCase()}${t ? ` "${t.slice(0, 40)}"` : ""}>`
  }

  const fields = [...document.querySelectorAll("input, select, textarea")].filter(
    (el) => el.type !== "hidden" && el.type !== "submit" && visible(el),
  )
  const unlabeled = fields.filter((el) => {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false
    if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false
    if (el.closest("label")) return false
    return true
  })

  const tapTargets = [...document.querySelectorAll("a[href], button")].filter((el) => {
    if (!visible(el)) return false
    const r = el.getBoundingClientRect()
    return r.width < 24 || r.height < 24
  })

  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? "",
    h1: document.querySelectorAll("h1").length,
    imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src.slice(0, 80)),
    unlabeledFields: unlabeled.map(describe),
    namelessButtons: [...document.querySelectorAll("button")].filter((b) => visible(b) && !name(b)).length,
    namelessLinks: [...document.querySelectorAll("a[href]")].filter((a) => visible(a) && !name(a)).map((a) => a.getAttribute("href")),
    overflowPx: document.documentElement.scrollWidth - window.innerWidth,
    smallTapTargets: tapTargets.map(describe).slice(0, 8),
    smallTapCount: tapTargets.length,
    links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
  }
}

const results = []
const flows = []
const flow = (label, ok, detail = "") => {
  flows.push({ label, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}${detail ? ` — ${detail}` : ""}`)
}

async function crawl(browser) {
  const queue = ["/"]
  const seen = new Set(queue)
  const ctxs = {}
  for (const [k, vp] of Object.entries(VIEWPORTS)) {
    const { isMobile, hasTouch, ...viewport } = vp
    ctxs[k] = await browser.newContext({ viewport, isMobile, hasTouch })
    await blockWrites(ctxs[k])
  }

  while (queue.length && results.length < MAX_PAGES) {
    const path = queue.shift()
    const row = { path }
    for (const [k, ctx] of Object.entries(ctxs)) {
      const page = await ctx.newPage()
      const errors = []
      page.on("pageerror", (e) => errors.push(`exception: ${e.message}`))
      page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 160)}`))
      let status = 0
      try {
        const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 90000 })
        status = res?.status() ?? 0
        await page.waitForTimeout(400)
        const a = await page.evaluate(audit)
        row[k] = { status, errors, ...a, links: undefined }
        if (k === "mobile") {
          await page.screenshot({ path: join(OUT, `${path.replace(/\W+/g, "_") || "home"}.png`), fullPage: true })
        }
        for (const href of a.links) {
          const u = new URL(href)
          if (u.origin !== new URL(BASE).origin) continue
          const p = u.pathname.replace(/\/$/, "") || "/"
          if (!seen.has(p) && !SKIP.test(p)) {
            seen.add(p)
            queue.push(p)
          }
        }
      } catch (e) {
        row[k] = { status, errors: [...errors, `load failed: ${e.message.split("\n")[0]}`] }
      }
      await page.close()
    }
    results.push(row)
    const d = row.desktop ?? {}
    const m = row.mobile ?? {}
    console.log(
      `${d.status} ${path}  h1=${d.h1} errs=${(d.errors?.length ?? 0) + (m.errors?.length ?? 0)}` +
        ` overflow=${m.overflowPx ?? "?"}px unlabeled=${d.unlabeledFields?.length ?? 0}`,
    )
  }
  for (const c of Object.values(ctxs)) await c.close()
}

async function flowsRun(browser) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile })
  await blockWrites(ctx)
  const page = await ctx.newPage()

  // 404
  const r404 = await page.goto(`${BASE}/definitely-not-a-page`, { waitUntil: "networkidle" })
  flow("unknown URL returns 404", r404?.status() === 404, `got ${r404?.status()}`)
  flow("404 page offers a way home", (await page.locator('a[href="/"]').count()) > 0)

  // Contact form: empty submit must be blocked, filled submit must succeed.
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" })
  let posted = 0
  page.on("request", (r) => r.url().includes("/api/contact") && r.method() === "POST" && posted++)
  await page.locator(`${CONTACT_FORM} button[type="submit"]`).click()
  await page.waitForTimeout(600)
  const errText = await page.locator(CONTACT_FORM).innerText()
  flow("contact: empty submit shows validation", /required|enter a message/i.test(errText) && posted === 0)
  await page.fill('input[name="fname"]', "Site")
  await page.fill('input[name="lname"]', "Check")
  await page.fill('input[name="email"]', "not-an-email")
  await page.fill('input[name="phone"]', "0400000000")
  await page.fill('textarea[name="message"]', "Automated usability check — ignore.")
  await page.locator(`${CONTACT_FORM} button[type="submit"]`).click()
  await page.waitForTimeout(600)
  flow("contact: bad email rejected", posted === 0 && /valid email/i.test(await page.locator(CONTACT_FORM).innerText()))
  await page.fill('input[name="email"]', "site-check@example.com")
  await page.locator(`${CONTACT_FORM} button[type="submit"]`).click()
  await page.waitForTimeout(1500)
  const after = await page.locator("body").innerText()
  flow("contact: valid submit posts once and confirms", posted === 1 && /thank|sent|received|success/i.test(after), `posts=${posted}`)
  await page.screenshot({ path: join(OUT, "flow-contact-submitted.png"), fullPage: true })

  // AI chat bubble
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  const bubble = page.locator('button[aria-label*="chat" i], button[aria-label*="assistant" i]').first()
  if (await bubble.count()) {
    await bubble.click()
    const box = page.locator('input[placeholder], textarea[placeholder]').last()
    await box.fill("Hi, do you install CCTV?")
    await box.press("Enter")
    await page.waitForTimeout(1500)
    flow("chat: opens, sends, shows reply", /Test reply from the site check/.test(await page.locator("body").innerText()))
  } else {
    flow("chat: bubble button has an accessible name", false, "no button labelled chat/assistant")
  }

  // Dashboard gate
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
  await page.fill('input[type="password"]', "wrong-password")
  await page.getByRole("button", { name: /log in/i }).click()
  await page.waitForTimeout(800)
  flow("dashboard: wrong password rejected", /incorrect password/i.test(await page.locator("body").innerText()))
  if (process.env.ADMIN_PASSWORD) {
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD)
    await page.getByRole("button", { name: /log in/i }).click()
    await page.waitForTimeout(1500)
    flow("dashboard: correct password opens dashboard", (await page.locator('input[type="password"]').count()) === 0)
    await page.reload({ waitUntil: "networkidle" })
    await page.waitForTimeout(800)
    flow("dashboard: session survives reload", (await page.locator('input[type="password"]').count()) === 0)
  }
  await ctx.close()
}

const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true })
try {
  await crawl(browser)
  await flowsRun(browser)
} finally {
  await browser.close()
}

// Titles shared by more than one page
const titles = {}
for (const r of results) if (r.desktop?.title) (titles[r.desktop.title] ??= []).push(r.path)
const dupTitles = Object.entries(titles).filter(([, p]) => p.length > 1)

writeFileSync(join(OUT, "report.json"), JSON.stringify({ results, flows, dupTitles }, null, 2))

const bad = results.filter((r) => r.desktop?.status !== 200 || r.desktop?.errors?.length || r.mobile?.errors?.length)
console.log(`\n${results.length} pages crawled, ${bad.length} with errors, ${flows.filter((f) => !f.ok).length} failed flows`)
console.log(`report: ${join(OUT, "report.json")}`)
process.exit(bad.length || flows.some((f) => !f.ok) ? 1 : 0)
