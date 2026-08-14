/**
 * Cuts the ibex-head mark out of the full stacked logo lockup.
 *
 * NOTE: this script can no longer be run as-is. Its source artwork,
 * pak-oz-logo-trimmed.png, was removed from the repo when the light logo
 * replaced it. The output it produced (public/images/pak-oz-mark.png) is still
 * committed and still used by the footer, the page heroes and the OG image, so
 * nothing is broken — but re-running this needs the original dark lockup back,
 * or a rewrite against whatever artwork replaces it. Kept for that reason.
 *
 * The full artwork (pak-oz-logo-trimmed.png) is a square lockup: mark, wordmark
 * and the "better solutions, better living" tagline stacked together. That reads
 * fine at hero size but turns to mush in a 65px navbar, so the navbar uses the
 * mark on its own beside a typeset wordmark.
 *
 * Run: node scripts/make-logo-mark.js
 */
const sharp = require("sharp")

const SRC = "public/images/pak-oz-logo-trimmed.png"
const OUT = "public/images/pak-oz-mark.png"

;(async () => {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const alphaAt = (x, y) => data[(y * W + x) * 4 + 3]

  // The mark sits top-left; the wordmark starts after a vertical gutter. Search
  // the upper 2/3 (above the "SOLUTIONS" band, which spans the full width) for
  // the emptiest column in the plausible gutter range.
  const yLimit = Math.floor(H * 0.62)
  const colInk = (x) => {
    let n = 0
    for (let y = 0; y < yLimit; y++) if (alphaAt(x, y) > 40) n++
    return n
  }
  let gutter = -1
  let best = Infinity // reused by the row scan below
  for (let x = Math.floor(W * 0.25); x < Math.floor(W * 0.42); x++) {
    const n = colInk(x)
    if (n < best) {
      best = n
      gutter = x
    }
  }

  // "SOLUTIONS" and the tagline run the full width, so they sit left of the
  // gutter too. Find the horizontal gap under the head the same way and cut
  // there — otherwise the crop swallows a sliver of "SOL".
  const rowInk = (y) => {
    let n = 0
    for (let x = 0; x < gutter; x++) if (alphaAt(x, y) > 40) n++
    return n
  }
  let floor = -1
  best = Infinity
  for (let y = Math.floor(H * 0.5); y < Math.floor(H * 0.72); y++) {
    const n = rowInk(y)
    if (n < best) {
      best = n
      floor = y
    }
  }

  // Tight alpha bounds of the mark: left of the gutter, above the floor.
  let x0 = W, x1 = 0, y0 = H, y1 = 0
  for (let y = 0; y < floor; y++) {
    for (let x = 0; x < gutter; x++) {
      if (alphaAt(x, y) > 40) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }

  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  console.log(`gutter x=${gutter} (ink ${best}) -> mark ${w}x${h} at ${x0},${y0}`)

  // Square canvas with ~8% breathing room, upscaled so it stays crisp on 2x/3x
  // displays at the ~40px the navbar renders it.
  const side = Math.round(Math.max(w, h) * 1.16)
  const OUT_SIDE = 512

  await sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(SRC).extract({ left: x0, top: y0, width: w, height: h }).toBuffer(),
        left: Math.round((side - w) / 2),
        top: Math.round((side - h) / 2),
      },
    ])
    .png()
    .toBuffer()
    .then((buf) =>
      sharp(buf)
        .resize(OUT_SIDE, OUT_SIDE, { kernel: "lanczos3" })
        .png({ compressionLevel: 9 })
        .toFile(OUT)
    )

  console.log(`wrote ${OUT} (${OUT_SIDE}x${OUT_SIDE})`)
})()
