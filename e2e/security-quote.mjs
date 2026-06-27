// End-to-end check for the Security Solutions quote wizard.
//
// Drives a real browser through the whole wizard against a running dev/prod
// server and asserts the database-backed behaviour we care about:
//   - categories + product cards load from Postgres (GET /api/products)
//   - sale price renders (current price + struck-through original + "Sale")
//   - quantity steppers update a live subtotal
//   - the summary computes item subtotal + install fee + 10% GST
//   - an out-of-stock product is shown disabled and cannot be selected
//   - a product added via the dashboard API appears with no redeploy
//
// The script seeds a temporary product through /api/dashboard/update and
// deletes it again at the end, so it leaves the catalogue exactly as it found
// it. Screenshots are written to e2e/screenshots (gitignored).
//
// Usage (server must already be running):
//   npm run dev            # in one terminal
//   npm run e2e:quote      # in another
//
// Env overrides:
//   BASE_URL        default http://localhost:3000
//   PW_EXECUTABLE   path to a Chromium-based browser (default: system Edge)
//   OUTDIR          screenshot directory (default: e2e/screenshots)

import { chromium } from "playwright-core"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { mkdirSync } from "node:fs"

const HERE = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const OUT = process.env.OUTDIR ?? join(HERE, "screenshots")
const EXECUTABLE =
  process.env.PW_EXECUTABLE ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"

mkdirSync(OUT, { recursive: true })

const log = (...a) => console.log(...a)

// On a cold dev server the page's client bundle compiles on demand, so early
// clicks can land before React hydrates and silently do nothing. Retry the
// "select property type + Continue" handshake until the next step appears —
// once it does, the page is interactive and later steps are reliable.
async function enterWizard(page) {
  await page.getByText("What type of property").waitFor({ timeout: 30000 })
  const nextHeading = page.getByText("Which security solutions")
  for (let i = 0; i < 8; i++) {
    await page.locator("button", { hasText: "Residential" }).click().catch(() => {})
    await page.getByRole("button", { name: /Continue/ }).click().catch(() => {})
    try {
      await nextHeading.waitFor({ timeout: 3000 })
      return
    } catch {
      await page.waitForTimeout(500)
    }
  }
  throw new Error("wizard did not advance past the property step (hydration?)")
}

const fails = []
function check(label, cond, detail = "") {
  log(`${cond ? "PASS" : "FAIL"}: ${label}${detail ? ` — ${detail}` : ""}`)
  if (!cond) fails.push(label)
}

// --- Seed a temporary on-sale product via the dashboard API -----------------
async function dashboard(payload) {
  const res = await fetch(`${BASE}/api/dashboard/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}

const TEST_NAME = "E2E Smoke Alarm (temp)"
let testId = null

async function seed() {
  const r = await dashboard({
    type: "product",
    action: "create",
    name: TEST_NAME,
    description: "Temporary product created by the e2e check",
    price: 99,
    discountPrice: 79,
    badge: "Sale",
    inStock: true,
    solutionSlug: "smoke-alarms",
    category: "Test",
  })
  testId = r?.product?.id
  if (!testId) throw new Error("Could not seed test product: " + JSON.stringify(r))
  log("seeded test product:", testId)
}

async function setStock(inStock) {
  await dashboard({
    type: "product",
    action: "update",
    id: testId,
    name: TEST_NAME,
    description: "Temporary product created by the e2e check",
    price: 99,
    discountPrice: 79,
    badge: "Sale",
    inStock,
    solutionSlug: "smoke-alarms",
    category: "Test",
  })
}

async function cleanup() {
  if (testId) {
    await dashboard({ type: "product", action: "delete", id: testId })
    log("deleted test product:", testId)
  }
}

// --- Drive the wizard -------------------------------------------------------
async function run() {
  await seed()

  const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true })
  try {
    const ctx = await browser.newContext({ viewport: { width: 800, height: 1100 } })
    const page = await ctx.newPage()
    page.on("pageerror", (e) => log("PAGE-EXCEPTION:", e.message))
    const shot = (n) => page.screenshot({ path: join(OUT, `${n}.png`), fullPage: true })

    // Step 0 — property type
    await page.goto(`${BASE}/services/security-solutions/quote`, { waitUntil: "load" })
    await shot("01-step0-property")
    await enterWizard(page)

    // Step 1 — categories (loaded from DB)
    await page.locator("button", { hasText: "products" }).first().waitFor({ timeout: 20000 })
    await shot("02-step1-categories")
    const catCount = await page.locator("button", { hasText: "product" }).count()
    check("all 6 categories show DB product counts", catCount === 6, `got ${catCount}`)

    await page.locator("button", { hasText: "Smoke Alarms" }).click()
    await page.locator("button", { hasText: "Deterrence" }).click()
    await page.getByRole("button", { name: /Continue/ }).click()

    // Step 2 — product picker
    await page.getByText("Select your products").waitFor({ timeout: 15000 })
    await page.getByText(TEST_NAME).waitFor({ timeout: 15000 })
    await shot("03-step2-products")
    const headers = await page.locator("main h3").allInnerTexts()
    check(
      "both selected category sections render",
      headers.includes("Smoke Alarms") && headers.includes("Deterrence"),
      JSON.stringify(headers)
    )
    check("seeded product appears with no redeploy", await page.getByText(TEST_NAME).count() === 1)
    check("on-sale strikethrough price shown", (await page.locator("main .line-through").count()) >= 1)
    check("'Sale' badge shown", (await page.locator("main").getByText("Sale", { exact: true }).count()) >= 1)

    // Bump the on-sale product ×2 and one Deterrence product ×1
    const saleCard = page
      .locator("main div")
      .filter({ hasText: TEST_NAME })
      .filter({ has: page.locator("button:has(svg.lucide-plus)") })
      .last()
    await saleCard.locator("button:has(svg.lucide-plus)").click()
    await saleCard.locator("button:has(svg.lucide-plus)").click()
    await page.locator("main button:has(svg.lucide-plus)").last().click()
    await page.waitForTimeout(300)
    await shot("04-step2-qty")
    const runLabel = await page.locator("text=/selected/").first().innerText().catch(() => "")
    check("running subtotal reflects selection", runLabel.includes("3 items"), runLabel)

    // Step 3 — timing
    await page.getByRole("button", { name: /Continue/ }).click()
    await page.getByText("When are you looking").waitFor({ timeout: 15000 })
    await shot("05-step3-timing")
    await page.locator("button", { hasText: "ASAP" }).click()
    await page.getByRole("button", { name: /Continue/ }).click()

    // Step 4 — contact + summary
    await page.getByText("Your details").waitFor({ timeout: 15000 })
    await page.getByPlaceholder("John", { exact: true }).fill("Jane")
    await page.getByPlaceholder("Smith").fill("Verify")
    await page.getByPlaceholder("john@example.com.au").fill("jane@example.com.au")
    await page.getByPlaceholder("04xx xxx xxx").fill("0400111222")
    await page.getByPlaceholder("Brisbane, 4000").fill("Sydney 2000")
    await page.waitForTimeout(300)
    await shot("06-step4-summary")
    const summary = await page
      .locator("text=Quote summary")
      .locator("xpath=ancestor::div[1]")
      .innerText()
      .catch(() => "")
    log("=== SUMMARY BLOCK ===\n" + summary + "\n=== END ===")
    check("summary shows sale unit price ($79)", summary.includes("$79"))
    check("summary shows struck original ($99)", summary.includes("$99"))
    check("summary shows install fee ($150)", summary.includes("$150"))
    check("summary shows GST line", /GST/.test(summary))
    check("summary shows expected total ($470)", summary.includes("$470"), "119 + 158 + 150 = 427, +10% GST = 470")

    // Submit
    await page.getByRole("button", { name: /Generate My Quote/ }).click()
    await page.getByText("Quote sent successfully").waitFor({ timeout: 20000 })
    await shot("07-submitted")
    check("success screen shown after submit", (await page.getByText("Quote sent successfully").count()) === 1)

    // Step 2 (again) — out-of-stock rendering
    await setStock(false)
    await page.goto(`${BASE}/services/security-solutions/quote?solution=smoke-alarms`, { waitUntil: "load" })
    await enterWizard(page)
    await page.locator("button", { hasText: "products" }).first().waitFor({ timeout: 20000 })
    await page.getByRole("button", { name: /Continue/ }).click() // smoke-alarms preselected via query
    await page.getByText("Select your products").waitFor({ timeout: 15000 })
    await page.getByText(TEST_NAME).waitFor({ timeout: 15000 })
    await shot("08-out-of-stock")
    check("out-of-stock label shown", (await page.locator("main").getByText("Out of Stock").count()) >= 1)
    const oosCard = page.locator("main div").filter({ hasText: TEST_NAME }).last()
    check(
      "out-of-stock product has no quantity stepper",
      (await oosCard.locator("button:has(svg.lucide-plus)").count()) === 0
    )
  } finally {
    await browser.close()
  }
}

try {
  await run()
} finally {
  await cleanup()
}

if (fails.length) {
  log(`\n${fails.length} check(s) FAILED:`)
  for (const f of fails) log("  - " + f)
  process.exit(1)
}
log("\nAll checks passed. Screenshots in " + OUT)
