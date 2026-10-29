import { sendEmail, type EmailAttachment } from "@/lib/mailer"
import { logRentalEmail } from "@/lib/db"

/**
 * sendEmail plus an entry in rental_email_log — the evidence pack lists every
 * email the customer was sent about their rental, so customer-facing rental
 * mail should go through here. Logging failures never fail the send.
 */
export async function sendRentalEmail(
  rentalId: string,
  kind: string,
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[],
): Promise<void> {
  await sendEmail(to, subject, html, attachments)
  try {
    await logRentalEmail(rentalId, kind, to, subject)
  } catch (e) {
    console.error("Email log write failed:", e)
  }
}
