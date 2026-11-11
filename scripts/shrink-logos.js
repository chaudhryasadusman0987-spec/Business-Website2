/**
 * Scales the two site logos down to what the layout actually shows.
 *
 * Both were ~850px wide (~57 KB each) but render at most 72px tall, and both
 * load on every page (header + footer). On a slow mobile connection they
 * competed with the LCP image for bandwidth. 216px tall covers the largest
 * display size (72px) on a 3x screen.
 *
 * Safe to re-run: an image already at or under the target height is left alone.
 *
 *   node scripts/shrink-logos.js
 */
const fs = require("fs")
const sharp = require("sharp")

const MAX_HEIGHT = 216
const FILES = ["public/images/pak-oz-logo-light.webp", "public/images/pak-oz-logo-color.webp"]

async function main() {
  for (const file of FILES) {
    const input = fs.readFileSync(file)
    const meta = await sharp(input).metadata()
    if (meta.height <= MAX_HEIGHT) {
      console.log(`${file}: already ${meta.width}x${meta.height}, skipped`)
      continue
    }
    const out = await sharp(input).resize({ height: MAX_HEIGHT }).webp({ quality: 90 }).toBuffer()
    fs.writeFileSync(file, out)
    console.log(`${file}: ${meta.width}x${meta.height} ${input.length} B -> ${out.length} B`)
  }
}

main()
