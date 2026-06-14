import { readCatalog, writeCatalog } from "@/lib/catalog-store"

// Always read/write fresh — never serve a cached catalog.
export const dynamic = "force-dynamic"

export async function GET() {
  const overrides = await readCatalog()
  return Response.json(overrides)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const overrides = await writeCatalog(body)
    return Response.json({ success: true, overrides })
  } catch {
    return Response.json(
      { success: false, error: "Invalid payload" },
      { status: 400 },
    )
  }
}
