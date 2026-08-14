/**
 * Trims the transparent margin off the supplied light logo.
 *
 * The source (pak-oz-logo.webp) is a 1024x1024 canvas holding an 846x402
 * horizontal lockup — about 21% of the height is empty padding. Rendered at
 * h-[56px] straight from that canvas the artwork itself would come out ~22px
 * tall, the same "renders at half size" trap the old pak-oz-logo-trimmed.png
 * was made to avoid.
 *
 * Run: node scripts/make-logo-light.js
 */
const sharp = require("sharp")

const SRC = "public/images/pak-oz-logo.webp"
const OUT = "public/images/pak-oz-logo-light.webp"

;(async () => {
  const { data, info } = await sharp(SRC)
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true })

  await sharp(data).webp({ quality: 92 }).toFile(OUT)

  const src = await sharp(SRC).metadata()
  console.log(`${src.width}x${src.height} -> ${info.width}x${info.height}`)
  console.log(`aspect ${(info.width / info.height).toFixed(2)}:1`)
  console.log(`wrote ${OUT}`)
})()
