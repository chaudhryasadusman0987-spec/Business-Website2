import { NextResponse } from "next/server"
import { getLeaseAgreement, signLeaseAgreement } from "@/lib/db"
import { sendEmail, type EmailAttachment } from "@/lib/mailer"
import { SITE_EMAIL } from "@/data/site"
import { generateLeaseAgreementPdf } from "@/lib/generateLeaseAgreement"

// Customer submits their drawn signature from the public /sign-agreement/[id]
// page. This records it, renders the final signed PDF, and emails a copy to
// both the customer and Pak Oz Rentals.
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { signatureDataUrl } = await req.json()
    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json({ error: "Signature is required." }, { status: 400 })
    }

    const existing = await getLeaseAgreement(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 })
    }
    if (existing.status === "signed") {
      return NextResponse.json({ success: true, alreadySigned: true })
    }

    const forwardedFor = req.headers.get("x-forwarded-for")
    const signedIp = forwardedFor ? forwardedFor.split(",")[0].trim() : null

    const agreement = await signLeaseAgreement(params.id, signatureDataUrl, signedIp)
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 })
    }

    const base64 = signatureDataUrl.split(",")[1] || ""
    const sigBytes = Buffer.from(base64, "base64")
    const signedAtLabel = agreement.signedAt
      ? new Date(agreement.signedAt).toLocaleString("en-AU")
      : new Date().toLocaleString("en-AU")

    const pdfBytes = await generateLeaseAgreementPdf({
      renterName: agreement.renterName,
      renterAddress: agreement.renterAddress,
      renterDob: agreement.renterDob,
      licenceNumber: agreement.licenceNumber,
      licenceState: agreement.licenceState,
      renterPhone: agreement.renterPhone,
      renterEmail: agreement.renterEmail,
      rego: agreement.rego,
      make: agreement.make,
      model: agreement.model,
      year: agreement.year,
      vin: agreement.vin,
      odometerStart: agreement.odometerStart,
      weeklyRent: agreement.weeklyRent,
      securityDeposit: agreement.securityDeposit,
      insuranceAccessFee: agreement.insuranceAccessFee,
      startDate: agreement.startDate,
      startTime: agreement.startTime,
      signatureImageBytes: new Uint8Array(sigBytes),
      signedAt: signedAtLabel,
    })

    const attachments: EmailAttachment[] = [
      {
        filename: `Pak-Oz-Rentals-Agreement-${agreement.rego}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ]

    try {
      await sendEmail(
        agreement.renterEmail,
        "Your Signed Rental Agreement — Pak Oz Rentals",
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#0f6e56;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">✅ Agreement Signed</h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${agreement.renterName.split(" ")[0]},</p>
            <p>Thank you — your signed rental agreement is attached for your records.</p>
          </div>
        </div>`,
        attachments,
      )
    } catch (e) {
      console.error("Customer PDF email error:", e)
    }

    try {
      await sendEmail(
        SITE_EMAIL,
        `✅ Agreement signed — ${agreement.renterName} — ${agreement.rego}`,
        `<p>Agreement ${agreement.id} has been signed by ${agreement.renterName}
          for ${agreement.make} ${agreement.model} (${agreement.rego}).
          Signed copy attached.</p>`,
        attachments,
      )
    } catch (e) {
      console.error("Admin PDF email error:", e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const e = err as { message?: string }
    console.error("Sign agreement error:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
