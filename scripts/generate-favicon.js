// Generates the Pak Oz Solutions branded favicon set from a single SVG:
// a purple rounded square with white "PO" text.
//
// Uses `sharp` (already a Next.js dependency) to rasterise the SVG at each
// size, so every asset referenced by the metadata + web manifest exists.
// Run with:  node scripts/generate-favicon.js

const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#7f85f7"/>
  <text x="16" y="22" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">PO</text>
</svg>`

const svgBuf = Buffer.from(svg)
const pub = path.join(__dirname, "..", "public")

// Render crisply: rasterise the SVG near the target resolution rather than
// upscaling a tiny bitmap (viewBox is 32 units → density 72 == 32px).
const densityFor = (size) => Math.max(72, Math.round((72 * size) / 32))

const targets = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]

// Wrap a PNG in a minimal single-image .ico container (PNG-in-ICO, Vista+).
function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(size >= 256 ? 0 : size, 0) // width  (0 == 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1) // height (0 == 256)
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // colour planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8) // image size
  entry.writeUInt32LE(22, 12) // offset (6 + 16)

  return Buffer.concat([header, entry, png])
}

async function main() {
  for (const [name, size] of targets) {
    await sharp(svgBuf, { density: densityFor(size) })
      .resize(size, size)
      .png()
      .toFile(path.join(pub, name))
    console.log("Created", name)
  }

  const png32 = await sharp(svgBuf, { density: densityFor(32) })
    .resize(32, 32)
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(pub, "favicon.ico"), pngToIco(png32, 32))
  console.log("Created favicon.ico")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
