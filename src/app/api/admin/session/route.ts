import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  checkPassword,
  createSession,
  roleFromRequest,
  type AdminRole,
} from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

// GET — who is logged in (used by the dashboards on load)
export async function GET(req: Request) {
  return NextResponse.json(
    { role: await roleFromRequest(req) },
    { headers: { "Cache-Control": "no-store" } },
  )
}

// POST {role, password} — log in. Attempts are rate-limited in middleware.ts.
export async function POST(req: Request) {
  let role: AdminRole
  let password: string
  try {
    const body = await req.json()
    role = body.role === "rental" ? "rental" : "admin"
    password = typeof body.password === "string" ? body.password : ""
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!(await checkPassword(role, password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const res = NextResponse.json({ role })
  res.cookies.set(ADMIN_COOKIE, await createSession(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  })
  return res
}

// DELETE — log out
export async function DELETE() {
  const res = NextResponse.json({ role: null })
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
