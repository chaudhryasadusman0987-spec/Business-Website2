import { NextResponse } from "next/server"
import { getRentalAgreement, insertRentalFile } from "@/lib/db"

export const runtime = "nodejs"

const KINDS = ["pickup_photo", "return_photo", "pickup_signature", "return_signature"]
const MAX_BYTES = 3 * 1024 * 1024

// Admin-only (middleware). One checklist photo or signature per request — the
// browser compresses them first, and uploading separately keeps every body
// under Vercel's ~4.5MB cap. The checklist itself then references the ids.
export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const rentalId = String(fd.get("rentalId") || "")
    const kind = String(fd.get("kind") || "")
    const file = fd.get("file")
    if (!KINDS.includes(kind)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 })
    }
    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }
    if (file.size > MAX_BYTES || !["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ error: "Photo must be a JPEG/PNG under 3MB." }, { status: 400 })
    }
    if (!(await getRentalAgreement(rentalId))) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }
    const id = await insertRentalFile({
      rentalId,
      kind,
      filename: file.name || `${kind}.jpg`,
      contentType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
    })
    return NextResponse.json({ id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Evidence upload error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
