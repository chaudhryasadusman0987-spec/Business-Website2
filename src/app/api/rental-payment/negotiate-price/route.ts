import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/mailer"
import { SITE_EMAIL, SITE_PHONE } from "@/data/site"
import { getNegotiations, insertNegotiation, updateNegotiationStatus } from "@/lib/db"

export const runtime = "nodejs"

function newNegotiationId(): string {
  return `neg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    vehicleId,
    vehicleName,
    customerName,
    customerEmail,
    customerPhone,
    listedPrice,
    offeredPrice,
  } = body

  if (!vehicleId || !vehicleName || !offeredPrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const id = newNegotiationId()

  try {
    await insertNegotiation({
      id,
      vehicleId,
      vehicleName,
      customerName: customerName || "Website Visitor",
      customerEmail: customerEmail || "not provided",
      customerPhone: customerPhone || "not provided",
      listedPrice: Number(listedPrice) || 0,
      offeredPrice: Number(offeredPrice) || 0,
    })
  } catch (e) {
    console.error("Negotiation save error:", e)
    return NextResponse.json({ error: "Could not save offer" }, { status: 500 })
  }

  try {
    await sendEmail(
      SITE_EMAIL,
      `💬 Price offer — ${vehicleName} — $${offeredPrice}/wk (listed $${listedPrice})`,
      `<div style="font-family:Arial;max-width:600px;margin:0 auto">
        <div style="background:#f5a623;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">💬 New Price Offer</h1>
        </div>
        <div style="padding:24px">
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Customer:</strong> ${customerName || "Website Visitor"}</p>
          <p><strong>Phone:</strong> ${customerPhone || "not provided"}</p>
          <p><strong>Email:</strong> ${customerEmail || "not provided"}</p>
          <div style="background:#f8f8f8;border-radius:10px;padding:16px;margin:16px 0">
            <p style="margin:0;font-size:13px;color:#666">Listed price</p>
            <p style="margin:2px 0 10px;font-size:18px;text-decoration:line-through;color:#999">
              $${listedPrice}/week
            </p>
            <p style="margin:0;font-size:13px;color:#666">Customer offered</p>
            <p style="margin:2px 0;font-size:24px;font-weight:bold;color:#0f6e56">
              $${offeredPrice}/week
            </p>
          </div>
          <p style="color:#666;font-size:13px">
            Reply to this offer by texting or calling the customer, then
            approve/decline it from your dashboard's "Offers" tab.
          </p>
        </div>
      </div>`
    )
  } catch (e) {
    console.error("Negotiation email error:", e)
  }

  return NextResponse.json({ success: true, id })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id") || undefined
  try {
    const negotiations = await getNegotiations(id)
    return NextResponse.json({ negotiations })
  } catch (e) {
    console.error("Negotiation list error:", e)
    return NextResponse.json({ negotiations: [] })
  }
}

export async function PATCH(req: Request) {
  const { id, status, approvedPrice } = await req.json()
  if (!id || (status !== "approved" && status !== "declined")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  let row
  try {
    row = await updateNegotiationStatus(id, status, approvedPrice ?? null)
  } catch (e) {
    console.error("Negotiation update error:", e)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  if (row) {
    try {
      await sendEmail(
        row.customerEmail,
        status === "approved"
          ? `Your price offer was approved! — Pak Oz Rentals`
          : `About your price offer — Pak Oz Rentals`,
        `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:${status === "approved" ? "#0f6e56" : "#c62828"};padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">
              ${status === "approved" ? "✅ Offer Approved!" : "Offer Update"}
            </h1>
          </div>
          <div style="padding:24px">
            <p>Hi ${row.customerName.split(" ")[0]},</p>
            ${
              status === "approved"
                ? `<p>Good news — we've approved your price of
                    <strong>$${row.approvedPrice}/week</strong> for the ${row.vehicleName}.</p>
                  <p>Go back to the vehicle on our website and complete your
                    booking — the approved price will apply automatically.</p>`
                : `<p>We're unable to match $${row.offeredPrice}/week for the
                    ${row.vehicleName} at this time. Our best price is
                    $${row.listedPrice}/week.</p>
                  <p>Feel free to make another offer or call us to discuss:
                    <strong>${SITE_PHONE}</strong></p>`
            }
          </div>
        </div>`
      )
    } catch (e) {
      console.error("Negotiation response email error:", e)
    }
  }

  return NextResponse.json({ success: true })
}
