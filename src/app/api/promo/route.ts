import { readPromo, writePromo } from "@/lib/promo-store"

// Always read/write fresh — never serve a cached promo config.
export const dynamic = "force-dynamic"

export async function GET() {
  const config = await readPromo()
  // Never let a browser or the Vercel CDN cache the promo config — a stale empty
  // response would hide a discount that was just set in the dashboard.
  return Response.json(config, {
    headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
  })
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
