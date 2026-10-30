import { getRentalFile } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin-only (middleware). Serves a stored licence image, checklist photo,
// signature or evidence pack. Never cached: these are identity documents.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const file = await getRentalFile(params.id)
  if (!file) return new Response("Not found", { status: 404 })
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${file.filename.replace(/[^\w.-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
