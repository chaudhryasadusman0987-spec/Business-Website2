import { getVehiclePhoto } from "@/lib/db"
import { isListed } from "@/lib/vehicles"
import { photoVersion } from "@/lib/vehicle-photos"

// Serves one fleet photo as a real image file, so browsers and next/image can
// cache and resize it. See src/lib/vehicle-photos.ts for why.
//
// /api/vehicles/photo/<vehicle id>/<n>/<version>, where n = 0 is the main
// photo and <version> is the hash of the stored photo. A URL whose version is
// current never changes content, so it is cached for a year. A stale version
// still gets the current photo, but with a short cache.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

const DATA_URL = /^data:(image\/(?:jpeg|jpg|png|webp|gif|avif|heic|heif));base64,([A-Za-z0-9+/=\s]+)$/

/** Splits a base64 image data URL into its type and bytes. */
function decodeImageDataUrl(src: string): { type: string; bytes: ArrayBuffer } | null {
  const m = DATA_URL.exec(src)
  if (!m) return null
  const type = m[1] === "image/jpg" ? "image/jpeg" : m[1]
  const buf = Buffer.from(m[2], "base64")
  if (buf.byteLength === 0) return null
  // A standalone ArrayBuffer (not Node's pooled one) is a valid Response body.
  const bytes = new ArrayBuffer(buf.byteLength)
  new Uint8Array(bytes).set(buf)
  return { type, bytes }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string; n: string; v: string } },
) {
  const n = Number(params.n)
  if (!Number.isInteger(n) || n < 0 || n > 50) {
    return new Response("Not found", { status: 404 })
  }

  // Just this one photo — not the whole row with every gallery shot in it.
  let photo
  try {
    photo = await getVehiclePhoto(decodeURIComponent(params.id), n)
  } catch {
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } })
  }
  // Hidden cars are off the public site, photos included.
  if (!photo || !isListed(photo)) return new Response("Not found", { status: 404 })

  const src = photo.src
  const image = decodeImageDataUrl(src)
  if (!image) return new Response("Not found", { status: 404 })

  const current = photoVersion(src) === params.v
  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.type,
      "Content-Length": String(image.bytes.byteLength),
      "Cache-Control": current
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
    },
  })
}
