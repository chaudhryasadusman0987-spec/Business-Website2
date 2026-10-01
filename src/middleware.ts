import { NextResponse, type NextRequest } from "next/server"
import { roleFromRequest, type AdminRole } from "@/lib/admin-auth"

// Guards every /api route in one place:
//   1. Admin-only routes require a valid session cookie (see lib/admin-auth).
//   2. Public write endpoints (forms, chat, login) are rate-limited per IP so
//      they can't be used to spam the inbox or run up the Gemini bill.

const BOTH: AdminRole[] = ["admin", "rental"]
const ADMIN: AdminRole[] = ["admin"]

// /api/dashboard/update allows both roles here; the route itself limits the
// rental login to vehicle edits.
const PROTECTED: { path: RegExp; methods: string[]; roles: AdminRole[] }[] = [
  { path: /^\/api\/dashboard\/leads$/, methods: ["GET", "POST"], roles: BOTH },
  { path: /^\/api\/leads$/, methods: ["GET"], roles: BOTH },
  { path: /^\/api\/dashboard\/update$/, methods: ["POST"], roles: BOTH },
  { path: /^\/api\/catalog$/, methods: ["POST"], roles: ADMIN },
  { path: /^\/api\/promo$/, methods: ["POST"], roles: ADMIN },
  { path: /^\/api\/packages$/, methods: ["POST", "DELETE"], roles: ADMIN },
  { path: /^\/api\/db\/setup$/, methods: ["GET", "POST"], roles: ADMIN },
  { path: /^\/api\/agreements$/, methods: ["GET"], roles: BOTH },
  { path: /^\/api\/agreements\/create$/, methods: ["POST"], roles: BOTH },
  { path: /^\/api\/rental-payment\/agreements$/, methods: ["GET"], roles: BOTH },
  { path: /^\/api\/rental-payment\/return-vehicle$/, methods: ["POST"], roles: BOTH },
  { path: /^\/api\/rental-payment\/negotiate-price$/, methods: ["PATCH"], roles: BOTH },
]

// [max requests, window in ms] per IP. In-memory, so it is per server
// instance — a speed bump against scripted abuse, not a hard guarantee.
const LIMITS: { path: RegExp; max: number; windowMs: number }[] = [
  { path: /^\/api\/admin\/session$/, max: 8, windowMs: 15 * 60_000 },
  { path: /^\/api\/chat$/, max: 20, windowMs: 60_000 },
  {
    path: /^\/api\/(contact|leads|quote\/[\w-]+|rental-application|rental-payment\/(negotiate-price|create-intent|create-setup|start-subscription)|agreements\/[\w-]+\/sign)$/,
    max: 6,
    windowMs: 60_000,
  },
]

const hits = new Map<string, number[]>()

function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > max
}

function clientIp(req: NextRequest): string {
  return req.ip ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

function needsAdmin(req: NextRequest): AdminRole[] | null {
  const { pathname, searchParams } = req.nextUrl
  // Customers poll their own offer by id; only the full list is admin-only.
  if (
    pathname === "/api/rental-payment/negotiate-price" &&
    req.method === "GET" &&
    !searchParams.get("id")
  ) {
    return BOTH
  }
  const rule = PROTECTED.find((r) => r.path.test(pathname) && r.methods.includes(req.method))
  return rule ? rule.roles : null
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const roles = needsAdmin(req)
  if (roles) {
    const role = await roleFromRequest(req)
    if (!role || !roles.includes(role)) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (req.method === "POST") {
    const limit = LIMITS.find((l) => l.path.test(pathname))
    if (limit && rateLimited(`${pathname}|${clientIp(req)}`, limit.max, limit.windowMs)) {
      return NextResponse.json(
        { error: "Too many requests — please wait a minute and try again." },
        { status: 429 },
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
