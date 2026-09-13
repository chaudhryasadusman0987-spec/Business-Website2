import { NextResponse } from "next/server"
import { getLeaseAgreement } from "@/lib/db"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const agreement = await getLeaseAgreement(params.id)
    if (!agreement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(
      { agreement },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    )
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
