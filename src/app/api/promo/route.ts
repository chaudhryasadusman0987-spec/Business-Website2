import { readPromo, writePromo } from "@/lib/promo-store"

// Always read/write fresh — never serve a cached promo config.
export const dynamic = "force-dynamic"

export async function GET() {
  const config = await readPromo()
  return Response.json(config)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const config = await writePromo(body)
    return Response.json({ success: true, config })
  } catch {
    return Response.json({ success: false, error: "Invalid payload" }, { status: 400 })
  }
}
