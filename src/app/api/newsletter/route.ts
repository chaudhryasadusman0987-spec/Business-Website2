import { NextResponse } from "next/server"
import { addNewsletterSubscriber } from "@/lib/newsletter"
import { sendEmail, isSmtpConfigured } from "@/lib/mailer"
import { escapeHtml as esc } from "@/lib/html"
import { SITE_EMAIL, SITE_FULL } from "@/data/site"

// Footer newsletter sign-up. Saves the address to newsletter_subscribers, then
// tells the business by email. The save is what counts: if it fails the
// visitor sees an error; if only the notification fails they still see success.
// Rate-limited per IP in middleware.ts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // Honeypot — a hidden field real visitors never fill in. Answer as if it
  // worked so a bot learns nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ success: true })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
  const source = typeof body.source === "string" ? body.source.slice(0, 200) : "footer"

  let isNew: boolean
  try {
    isNew = await addNewsletterSubscriber(email, source)
  } catch (e) {
    console.error("Newsletter save failed:", (e as Error)?.message)
    return NextResponse.json(
      { error: "We couldn't save your email just now. Please try again shortly." },
      { status: 500 },
    )
  }

  if (isNew && isSmtpConfigured()) {
    try {
      await sendEmail(
        SITE_EMAIL,
        `New newsletter subscriber — ${SITE_FULL}`,
        `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a2e">
          <p><strong>${esc(email)}</strong> subscribed to the newsletter.</p>
          <p style="color:#666">Source: ${esc(source)}<br/>Received: ${new Date().toLocaleString("en-AU")}</p>
        </div>`,
      )
    } catch (e) {
      console.error("Newsletter notify email failed:", (e as Error)?.message)
    }
  }

  return NextResponse.json({ success: true, alreadySubscribed: !isNew })
}
