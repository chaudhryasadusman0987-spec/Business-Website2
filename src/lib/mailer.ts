import nodemailer from "nodemailer"
import { SITE_FULL } from "@/data/site"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await transporter.sendMail({
    from: `"${SITE_FULL}" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  })
}
