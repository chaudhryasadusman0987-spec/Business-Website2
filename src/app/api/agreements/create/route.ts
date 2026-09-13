import { NextResponse } from "next/server"
import { createLeaseAgreement } from "@/lib/db"
import { sendEmail } from "@/lib/mailer"
import { SITE_PHONE } from "@/data/site"

// Admin (rental-admin dashboard "Agreements" tab) creates a lease agreement
// for a renter + vehicle, then this emails the renter a link to review and
// sign it. The signed PDF itself is generated later, at signing time — see
// /api/agreements/[id]/sign.
export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.renterName || !body.renterEmail || !body.rego || !body.weeklyRent) {
      return NextResponse.json(
        { error: "Renter name, email, vehicle rego and weekly rent are required." },
        { status: 400 },
      )
    }

    const agreement = await createLeaseAgreement({
      renterName: body.renterName,
      renterAddress: body.renterAddress || "",
      renterDob: body.renterDob || "",
      licenceNumber: body.licenceNumber || "",
      licenceState: body.licenceState || "",
      renterPhone: body.renterPhone || "",
      renterEmail: body.renterEmail,
      vehicleId: body.vehicleId || "",
      rego: body.rego,
      make: body.make || "",
      model: body.model || "",
      year: body.year || "",
      vin: body.vin || "",
      odometerStart: body.odometerStart || "",
      weeklyRent: Number(body.weeklyRent),
      securityDeposit: Number(body.securityDeposit || 0),
      insuranceAccessFee: Number(body.insuranceAccessFee || 0),
      startDate: body.startDate || "",
      startTime: body.startTime || "",
    })

    const signUrl = `${
      process.env.NEXT_PUBLIC_APP_URL ?? "https://pakozsolutions.com.au"
    }/sign-agreement/${agreement.id}`

    let emailSent = true
    try {
      await sendEmail(
        agreement.renterEmail,
        "Your Pak Oz Rentals Agreement — Please Sign",
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#7f85f7;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">Your Rental Agreement</h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${agreement.renterName.split(" ")[0]},</p>
            <p>Please review and sign your vehicle lease agreement for the
              ${agreement.make} ${agreement.model} (${agreement.rego}).</p>
            <a href="${signUrl}"
              style="display:inline-block;background:#7f85f7;color:white;
                padding:14px 28px;border-radius:10px;text-decoration:none;
                font-weight:bold;margin:16px 0">
              Review &amp; Sign Agreement
            </a>
            <p style="color:#666;font-size:13px">Questions? Call ${SITE_PHONE}</p>
          </div>
        </div>`,
      )
    } catch (e) {
      console.error("Agreement email error:", e)
      emailSent = false
    }

    return NextResponse.json({
      success: true,
      id: agreement.id,
      signUrl,
      emailSent,
    })
  } catch (err) {
    const e = err as { message?: string }
    console.error("Create agreement error:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
