import nodemailer from "nodemailer"
import { SITE_FULL } from "@/data/site"

// Hostinger SMTP settings
// These must be set in Vercel environment
// variables and in .env.local for local dev

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST
    || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER
      || "info@pakozsolutions.com.au",
    pass: process.env.SMTP_PASS || "",
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
})

/** True when SMTP credentials look real (not empty / placeholder). */
export function isSmtpConfigured(): boolean {
  const pass = process.env.SMTP_PASS
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      pass &&
      pass !== "" &&
      pass !== "your_password" &&
      pass !== "your_hostinger_email_password"
  )
}

/**
 * Best-effort plain-text version of an HTML email. Sending a text part
 * alongside the HTML (multipart/alternative) improves deliverability — spam
 * filters penalise HTML-only mail — and serves text-only clients.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|table|ul)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const from = process.env.SMTP_FROM
    || "info@pakozsolutions.com.au"

  console.log("Sending email:", {
    from,
    to,
    subject,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    // Never log the password
  })

  try {
    const result = await transporter.sendMail({
      from: `"${SITE_FULL}" <${from}>`,
      to,
      subject,
      html,
      text: htmlToText(html),
    })
    console.log("Email sent successfully:", result.messageId)
  } catch (error) {
    const e = error as {
      message?: string
      code?: string
      command?: string
      response?: string
    }
    console.error("Email send failed:", {
      message: e?.message,
      code: e?.code,
      command: e?.command,
      response: e?.response,
    })
    throw error
  }
}

// Test connection on startup in development
if (process.env.NODE_ENV === "development") {
  transporter.verify((error) => {
    if (error) {
      console.error("SMTP connection failed:", error.message)
    } else {
      console.log("SMTP connection verified ✓")
    }
  })
}
