/**
 * Screenshots each portfolio site's homepage at 1440x900 and saves it as WebP
 * in /public/images/portfolio/ for the "Our Work" cards.
 *
 *   npm run capture:portfolio
 *
 * Reads the project list from src/data/portfolio.ts, so a new project only
 * needs adding there.
 */
import path from "node:path"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import sharp from "sharp"
import { portfolio } from "../src/data/portfolio"

const OUT_DIR = path.join(process.cwd(), "public")
const VIEWPORT = { width: 1440, height: 900 }

async function main() {
  await mkdir(path.join(OUT_DIR, "images", "portfolio"), { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT })
  let failed = 0

  for (const project of portfolio) {
    const page = await context.newPage()
    const out = path.join(OUT_DIR, project.image)
    try {
      // "networkidle" never settles on sites with chat widgets / analytics
      // beacons, so wait for load and give animations a moment instead.
      await page.goto(project.url, { waitUntil: "load", timeout: 60_000 })
      await page.waitForTimeout(3_000)
      const png = await page.screenshot({ type: "png" })
      await sharp(png).webp({ quality: 80 }).toFile(out)
      console.log(`✓ ${project.name} → ${project.image}`)
    } catch (err) {
      failed++
      console.error(`✗ ${project.name}: ${(err as Error).message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  if (failed) process.exit(1)
}

main()
