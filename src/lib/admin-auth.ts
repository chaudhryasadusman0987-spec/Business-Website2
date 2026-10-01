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

export type AdminRole = "admin" | "rental"

export const ADMIN_COOKIE = "pakoz_admin"
export const SESSION_SECONDS = 12 * 60 * 60

function passwordFor(role: AdminRole): string {
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

function sessionSecret(): string {
  // Without an explicit secret, derive one from both passwords — changing
  // either password then logs every existing session out.
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
  return `${payload}.${await hmacHex(sessionSecret(), payload)}`
}

export async function verifySession(token: string | undefined | null): Promise<AdminRole | null> {
  if (!token) return null
  const [role, exp, sig] = token.split(".")
  if ((role !== "admin" && role !== "rental") || !exp || !sig) return null
  if (!(Number(exp) > Date.now())) return null
  if (!passwordFor(role)) return null
  const ok = await safeEqual(sig, await hmacHex(sessionSecret(), `${role}.${exp}`))
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

/** Role of the admin making this request, or null if not logged in. */
export async function roleFromRequest(req: Request): Promise<AdminRole | null> {
  return verifySession(readCookie(req.headers.get("cookie"), ADMIN_COOKIE))
}
