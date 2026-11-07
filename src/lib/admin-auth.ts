// Server-side admin sessions for /dashboard and /rental-admin.
//
// The passwords used to be NEXT_PUBLIC_* and were compared in the browser,
// which shipped them inside the public JS bundle and left every admin API
// open to anyone who called it directly. Now the password is checked here and
// the browser only ever holds a signed, httpOnly cookie; middleware.ts
// verifies that cookie before any admin API route runs.
//
// Uses Web Crypto only, so the same code runs in middleware (Edge) and in
// Node route handlers.

export type AdminRole = "admin" | "rental" | "leads"

export const ADMIN_COOKIE = "pakoz_admin"
// The lead finder (/lead-finder) has its own password and its own cookie, so
// it is fully separate from the dashboards: logging into one never logs out
// the other, and the main dashboard password does not open the lead finder.
export const LEADS_COOKIE = "pakoz_leads"
export const SESSION_SECONDS = 12 * 60 * 60

export function cookieFor(role: AdminRole): string {
  return role === "leads" ? LEADS_COOKIE : ADMIN_COOKIE
}

function isRole(v: string | undefined): v is AdminRole {
  return v === "admin" || v === "rental" || v === "leads"
}

function passwordFor(role: AdminRole): string {
  if (role === "leads") return process.env.LEAD_FINDER_PASSWORD ?? ""
  // The NEXT_PUBLIC_ names are read as a fallback so an existing deployment
  // keeps working until the env vars are renamed. They are only referenced
  // server-side now, so Next no longer inlines them into client JS.
  const pw =
    role === "admin"
      ? process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD
      : process.env.RENTAL_ADMIN_PASSWORD ||
        process.env.NEXT_PUBLIC_RENTAL_DASHBOARD_PASSWORD
  return pw ?? ""
}

function sessionSecret(role: AdminRole): string {
  // Without an explicit secret, derive one from the passwords — changing a
  // password then logs its existing sessions out.
  if (role === "leads") {
    return `pakoz-leads|${process.env.ADMIN_SESSION_SECRET ?? ""}|${passwordFor("leads")}`
  }
  return (
    process.env.ADMIN_SESSION_SECRET ||
    `pakoz-session|${passwordFor("admin")}|${passwordFor("rental")}`
  )
}

const encoder = new TextEncoder()

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Constant-time string compare (both sides hashed to equal length first). */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hmacHex("cmp", a), hmacHex("cmp", b)])
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i)
  return diff === 0
}

export async function checkPassword(role: AdminRole, attempt: string): Promise<boolean> {
  const expected = passwordFor(role)
  // An unset password must never match an empty attempt.
  if (!expected || !attempt) return false
  return safeEqual(attempt, expected)
}

export async function createSession(role: AdminRole): Promise<string> {
  const exp = Date.now() + SESSION_SECONDS * 1000
  const payload = `${role}.${exp}`
  return `${payload}.${await hmacHex(sessionSecret(role), payload)}`
}

export async function verifySession(token: string | undefined | null): Promise<AdminRole | null> {
  if (!token) return null
  const [role, exp, sig] = token.split(".")
  if (!isRole(role) || !exp || !sig) return null
  if (!(Number(exp) > Date.now())) return null
  if (!passwordFor(role)) return null
  const ok = await safeEqual(sig, await hmacHex(sessionSecret(role), `${role}.${exp}`))
  return ok ? role : null
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=")
    if (k === name) return decodeURIComponent(v.join("="))
  }
  return null
}

/** Dashboard role (admin / rental) of this request, or null if not logged in. */
export async function roleFromRequest(req: Request): Promise<AdminRole | null> {
  const role = await verifySession(readCookie(req.headers.get("cookie"), ADMIN_COOKIE))
  return role === "leads" ? null : role
}

/** True when the request carries a valid lead finder session. */
export async function hasLeadFinderSession(req: Request): Promise<boolean> {
  return (await verifySession(readCookie(req.headers.get("cookie"), LEADS_COOKIE))) === "leads"
}

/** Every role this request is logged in as (dashboard cookie + lead finder cookie). */
export async function rolesFromRequest(req: Request): Promise<AdminRole[]> {
  const [role, leads] = await Promise.all([roleFromRequest(req), hasLeadFinderSession(req)])
  const roles: AdminRole[] = role ? [role] : []
  if (leads) roles.push("leads")
  return roles
}
