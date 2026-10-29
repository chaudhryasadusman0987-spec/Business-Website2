import Stripe from "stripe"
import { NextResponse } from "next/server"
import {
  findSignedLease,
  getDispute,
  getRentalAgreement,
  getRentalEmailLog,
  getRentalEvidence,
  getRentalFile,
  insertRentalFile,
  listRentalFiles,
  markDisputeEvidenceDraft,
  type RentalEvidence,
  type RentalFile,
} from "@/lib/db"
import { stripeClient } from "@/lib/stripe-server"
import { generateLeaseAgreementPdf } from "@/lib/generateLeaseAgreement"
import { buildEvidencePackPdf, type PaymentHistoryEntry } from "@/lib/rental-evidence-pdf"

export const runtime = "nodejs"
export const maxDuration = 60

// Stripe rejects a dispute whose evidence files exceed 4.5MB combined.
const STRIPE_EVIDENCE_LIMIT = 4_500_000

async function loadFiles(ids: (string | null)[]): Promise<RentalFile[]> {
  const files = await Promise.all(ids.filter((id): id is string => !!id).map(getRentalFile))
  return files.filter((f): f is RentalFile => f !== null)
}

async function loadChecklist(record: RentalEvidence | undefined) {
  if (!record) return null
  const [signature] = await loadFiles([record.signatureFileId])
  return { record, photos: await loadFiles(record.photoIds), signature: signature ?? null }
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Australia/Brisbane" }) // YYYY-MM-DD

// Admin-only (middleware). Gathers everything on file for the disputed rental,
// uploads it to the Stripe dispute as a DRAFT (submit: false) so the owner can
// review it, and stores the evidence pack PDF for viewing in /rental-admin.
// Re-running replaces the draft. Submitting is a separate, explicit step.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const stripe = stripeClient()
    const dispute = await getDispute(params.id)
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
    if (dispute.evidenceStatus === "submitted") {
      return NextResponse.json({ error: "Evidence was already submitted to the bank." }, { status: 409 })
    }
    const rental = dispute.rentalId ? await getRentalAgreement(dispute.rentalId) : null
    if (!rental) {
      return NextResponse.json(
        { error: "This dispute isn't linked to a rental — respond from the Stripe dashboard." },
        { status: 400 },
      )
    }

    const [fileList, evidence, emails] = await Promise.all([
      listRentalFiles(rental.id),
      getRentalEvidence(rental.id),
      getRentalEmailLog(rental.id),
    ])
    const licenceFiles = await loadFiles(
      ["licence_front", "licence_back"].map((k) => fileList.find((f) => f.kind === k)?.id ?? null),
    )
    const pickup = await loadChecklist(evidence.find((e) => e.kind === "pickup"))
    const returned = await loadChecklist(evidence.find((e) => e.kind === "return"))

    // Payment history straight from Stripe: every weekly charge and the bond.
    const payments: PaymentHistoryEntry[] = []
    if (rental.stripeCustomerId) {
      const charges = await stripe.charges.list({ customer: rental.stripeCustomerId, limit: 100 })
      for (const c of charges.data) {
        payments.push({
          id: c.id,
          created: c.created,
          amount: c.amount / 100,
          currency: c.currency,
          status: c.refunded ? "refunded" : c.status,
          description: c.description || "Weekly rent",
          disputed: c.disputed,
          threeDs: c.payment_method_details?.card?.three_d_secure?.result ?? null,
        })
      }
      payments.sort((a, b) => a.created - b.created)
    }

    // The signed lease from the Agreements tab, re-rendered with its signature.
    let leasePdf: Uint8Array | null = null
    const lease = await findSignedLease(rental.customerEmail, rental.vehicleRego)
    if (lease?.signatureData) {
      leasePdf = await generateLeaseAgreementPdf({
        ...lease,
        signatureImageBytes: new Uint8Array(
          Buffer.from(lease.signatureData.split(",")[1] || "", "base64"),
        ),
        signedAt: lease.signedAt ? new Date(lease.signedAt).toLocaleString("en-AU") : undefined,
      })
    }

    // Fit under Stripe's combined limit by shrinking the photo budget if needed.
    const fixedBytes = (leasePdf?.length ?? 0) + 60_000
    let budget = Math.min(3_200_000, STRIPE_EVIDENCE_LIMIT - fixedBytes - 300_000)
    let built = await buildEvidencePackPdf(
      { rental, disputeId: dispute.id, disputeReason: dispute.reason, disputeAmount: dispute.amount,
        licenceFiles, pickup, returned, payments, emails, signedLeaseAttached: !!leasePdf },
      Math.max(0, budget),
    )
    while (built.pdf.length + fixedBytes > STRIPE_EVIDENCE_LIMIT && budget > 0) {
      budget = Math.floor(budget / 2) - 1
      built = await buildEvidencePackPdf(
        { rental, disputeId: dispute.id, disputeReason: dispute.reason, disputeAmount: dispute.amount,
          licenceFiles, pickup, returned, payments, emails, signedLeaseAttached: !!leasePdf },
        Math.max(0, budget),
      )
    }

    const upload = async (data: Uint8Array, name: string) =>
      (
        await stripe.files.create({
          purpose: "dispute_evidence",
          file: { data: Buffer.from(data), name, type: "application/pdf" },
        })
      ).id

    const packName = `evidence-${rental.vehicleRego}-${dispute.id}.pdf`
    const packStripeId = await upload(built.pdf, packName)
    const leaseStripeId = leasePdf
      ? await upload(leasePdf, `signed-lease-${rental.vehicleRego}.pdf`)
      : null

    const weekly = `$${rental.agreedWeeklyRate.toFixed(2)}`
    const accessLog = [
      `Terms accepted ${rental.termsAcceptedAt ?? "-"} from IP ${rental.termsIp ?? "-"}`,
      `User agent: ${rental.termsUserAgent ?? "-"}`,
      `Customer typed their full name: "${rental.termsTypedName ?? "-"}" (terms version ${rental.termsVersion ?? "-"})`,
      `Card verified with 3D Secure: result=${rental.threeDsResult ?? "-"}, version=${rental.threeDsVersion ?? "-"}, flow=${rental.threeDsFlow ?? "-"}`,
      `Driving licence (front and back) uploaded at application: ${licenceFiles.length === 2 ? "yes" : "incomplete"}`,
      pickup
        ? `Vehicle collected ${pickup.record.recordedAt}, odometer ${pickup.record.odometer} km, signed on screen by ${pickup.record.signedName}`
        : "Pickup checklist not recorded",
    ].join("\n")

    const stripeEvidence: Stripe.DisputeUpdateParams.Evidence = {
      customer_name: rental.customerName,
      customer_email_address: rental.customerEmail,
      ...(rental.termsIp ? { customer_purchase_ip: rental.termsIp } : {}),
      ...(rental.customerAddress ? { billing_address: rental.customerAddress } : {}),
      service_date: day(pickup?.record.recordedAt ?? rental.startDate),
      product_description:
        `Weekly vehicle rental: ${rental.vehicleName} (rego ${rental.vehicleRego}) at ${weekly} per week, ` +
        `charged automatically every week until the vehicle is returned. Rental started ${day(rental.startDate)}.`,
      access_activity_log: accessLog,
      cancellation_policy_disclosure:
        `Shown at checkout and accepted by checkbox + typed name before payment: "${
          rental.termsText?.split("\n")[0] ?? ""
        }" Weekly charges stop only when the vehicle is returned (minimum 4 weeks). ` +
        `The customer was emailed 2 days before every weekly charge.`,
      cancellation_rebuttal: returned
        ? `The customer kept the vehicle until ${returned.record.recordedAt}; weekly billing was cancelled the same day. ` +
          `Every disputed charge covers a week the customer had the vehicle.` +
          (returned.record.amountOwed ? ` $${returned.record.amountOwed.toFixed(2)} remained owing at return.` : "")
        : `The vehicle had not been returned when the disputed charge was made — the customer still had it, ` +
          `so the weekly rent they agreed to was due.`,
      refund_policy_disclosure:
        "Security bond is refundable on return of the vehicle in good condition. A partly used final week is " +
        "refunded pro rata on return. No refunds for weeks the customer had the vehicle.",
      service_documentation: packStripeId,
      ...(leaseStripeId ? { customer_signature: leaseStripeId } : {}),
      uncategorized_text:
        `Full evidence pack attached (service documentation): licence images, checkout agreement with IP and ` +
        `timestamp, 3D Secure result, pickup/return checklists with photos and signatures, payment history ` +
        `(${payments.length} charges) and ${emails.length} emails sent to the customer.` +
        (rental.nameCheck === "mismatch"
          ? ` Note: the cardholder name (${rental.cardholderName}) differs from the licence holder; identity was checked in person at handover.`
          : ""),
    }

    await stripe.disputes.update(dispute.id, { evidence: stripeEvidence, submit: false })

    const packFileId = await insertRentalFile({
      rentalId: rental.id,
      kind: "evidence_pack",
      filename: packName,
      contentType: "application/pdf",
      data: Buffer.from(built.pdf),
    })

    const warnings: string[] = []
    if (!pickup) warnings.push("No pickup checklist — record one if the vehicle was handed over.")
    if (licenceFiles.length < 2) warnings.push("Licence front/back not both on file.")
    if (!rental.termsAcceptedAt) warnings.push("No checkout terms acceptance recorded for this rental.")
    if (rental.paymentMethod === "card" && rental.threeDsResult !== "authenticated")
      warnings.push(`3D Secure result is "${rental.threeDsResult ?? "none"}", not "authenticated".`)
    if (!leasePdf) warnings.push("No signed lease found in the Agreements tab for this renter + rego.")
    if (rental.nameCheck === "mismatch") warnings.push("Cardholder name differs from licence name.")
    if (built.omittedPhotos) warnings.push(`${built.omittedPhotos} photo(s) left out to stay under Stripe's 4.5MB limit.`)

    const summary = {
      files: [
        { field: "service_documentation", name: packName, bytes: built.pdf.length },
        ...(leasePdf ? [{ field: "customer_signature", name: "signed lease", bytes: leasePdf.length }] : []),
      ],
      textFields: Object.keys(stripeEvidence).filter(
        (k) => !["service_documentation", "customer_signature"].includes(k),
      ),
      payments: payments.length,
      emails: emails.length,
      warnings,
    }
    await markDisputeEvidenceDraft(dispute.id, packFileId, summary)

    return NextResponse.json({ success: true, packFileId, summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Evidence pack error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
