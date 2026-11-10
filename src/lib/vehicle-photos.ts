// Public URLs for fleet photos. SERVER-ONLY (uses node:crypto): imported by
// db.ts, fleet-summary.ts and the /api/vehicles routes, never by components.
//
// Dashboard uploads are stored in Postgres as inline data: URLs. Sent to the
// browser as-is they bloat the /api/vehicles JSON (megabytes for a full
// fleet), can't be cached, and next/image can't optimise them. Public reads
// swap each one for /api/vehicles/photo/<id>/<n>/<version>. That route serves
// the decoded bytes with a one-year immutable cache, and because the URL is a
// local path, next/image resizes it and serves WebP.
//
// <version> is the md5 of the stored data URL, so replacing a photo in the
// dashboard changes the URL and no cache serves the old one. It is md5 because
// Postgres can compute the same hash in the query (see getVehiclesLight), so
// the photo data never has to leave the database just to build a URL.
//
// The dashboard (?all=1) keeps the raw data URLs: its edit forms need them.

import { createHash } from "node:crypto"
import type { RentalVehicle } from "@/lib/vehicles"

/** md5 hex of the stored photo string — matches Postgres md5(image). */
export function photoVersion(src: string): string {
  return createHash("md5").update(src, "utf8").digest("hex")
}

/** n = 0 is the main photo, 1… are the gallery photos in order. */
export function photoPath(vehicleId: string, n: number, version: string): string {
  return `/api/vehicles/photo/${encodeURIComponent(vehicleId)}/${n}/${version}`
}

export function photoUrl(vehicleId: string, n: number, src: string): string {
  if (!src || !src.startsWith("data:")) return src
  return photoPath(vehicleId, n, photoVersion(src))
}

/** The vehicle with every inline photo replaced by its cacheable URL. */
export function withPhotoUrls(v: RentalVehicle): RentalVehicle {
  return {
    ...v,
    image: photoUrl(v.id, 0, v.image),
    images: v.images.map((src, i) => photoUrl(v.id, i + 1, src)),
  }
}

/** The stored photo for index n (0 = main), or "" if there is none. */
export function photoSource(v: RentalVehicle, n: number): string {
  return (n === 0 ? v.image : v.images[n - 1]) ?? ""
}
