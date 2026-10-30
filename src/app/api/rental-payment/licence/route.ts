import { NextResponse } from "next/server"
import { getRentalAgreement, replaceRentalFile } from "@/lib/db"
import { MAX_UPLOAD_BYTES } from "@/lib/rental-validation"

export const runtime = "nodejs"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]

// Customer uploads one side of their driving licence for a pending card /
// BECS application. One file per request keeps each body well under Vercel's
// ~4.5MB cap. The unguessable rental id is the credential, and only an
// application that has not been paid yet accepts uploads.
export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const rentalId = String(fd.get("rentalId") || "")
    const side = String(fd.get("side") || "")
    const file = fd.get("file")

    if (side !== "front" && side !== "back") {
      return NextResponse.json({ error: "Invalid licence side." }, { status: 400 })
    }
    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Licence image is too large (3MB max)." }, { status: 400 })
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported licence file type." }, { status: 400 })
    }

    const rental = rentalId ? await getRentalAgreement(rentalId) : null
    if (!rental || rental.status !== "pending_payment") {
      return NextResponse.json({ error: "Application not found." }, { status: 404 })
    }

    const id = await replaceRentalFile({
      rentalId,
      kind: `licence_${side}`,
      filename: file.name || `licence-${side}`,
      contentType: file.type || "application/octet-stream",
      data: Buffer.from(await file.arrayBuffer()),
    })
    return NextResponse.json({ success: true, id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Licence upload error:", message)
    return NextResponse.json({ error: "Licence upload failed." }, { status: 500 })
  }
}
