/**
 * Lifts the baked-in background off the colour logo and trims it.
 *
 * public/images/pak-oz-logo.png ships as a fully opaque 1024x1024 canvas with a
 * flat grey background (~rgb(207,204,210)) painted in — it has an alpha channel
 * but not a single transparent pixel. Dropped onto a page as-is it renders as a
 * grey rectangle, so it cannot sit on a white card without keying first.
 *
 * The grey is uniform to within ~3 levels across the border, and only ~0.9% of
 * the canvas falls in the transition band, so a straight distance key with a
 * soft ramp lifts it without chewing the anti-aliased edges.
 *
 * Output is the colour lockup on transparency, for LIGHT backgrounds only — the
 * animals and wordmark are near-black. Dark surfaces need the light artwork
 * instead, or this one on a white card.
 *
 * Run: node scripts/make-logo-color.js
 */
const sharp = require("sharp")

const SRC = "public/images/pak-oz-logo.png"
const OUT = "public/images/pak-oz-logo-color.webp"

/** Below this distance from the background colour, a pixel is background. */
const CLEAR = 8
/** Above this, it is solid artwork. Between the two, alpha ramps. */
const SOLID = 45

;(async () => {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info

  // Measure the background off the border rather than hard-coding it.
  const ring = []
  for (let x = 0; x < W; x += 7) ring.push((3 * W + x) * 4, ((H - 4) * W + x) * 4)
  for (let y = 0; y < H; y += 7) ring.push((y * W + 3) * 4, (y * W + W - 4) * 4)
  const bg = [0, 1, 2].map((c) => ring.reduce((s, i) => s + data[i + c], 0) / ring.length)

  for (let i = 0; i < W * H; i++) {
    const o = i * 4
    const d = Math.max(
      Math.abs(data[o] - bg[0]),
      Math.abs(data[o + 1] - bg[1]),
      Math.abs(data[o + 2] - bg[2])
    )
    data[o + 3] =
      d <= CLEAR ? 0 : d >= SOLID ? 255 : Math.round(((d - CLEAR) / (SOLID - CLEAR)) * 255)
  }

  const keyed = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toBuffer()

  const out = await sharp(keyed).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })
  await sharp(out.data).webp({ quality: 92 }).toFile(OUT)

  console.log(`bg ${bg.map((v) => v.toFixed(0)).join(",")} -> keyed`)
  console.log(`${W}x${H} -> trimmed ${out.info.width}x${out.info.height} -> ${OUT}`)
})()
