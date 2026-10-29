import { listRentalFiles, type RentalEvidenceInput } from "@/lib/db"

export const MAX_CHECKLIST_PHOTOS = 8

/**
 * Validates a pickup / return checklist posted from /rental-admin. Photo and
 * signature ids must be files already uploaded for this same rental, so a
 * checklist can't point at another customer's images.
 */
export async function parseChecklist(
  rentalId: string,
  kind: "pickup" | "return",
  body: Record<string, unknown>,
): Promise<{ ok: true; value: RentalEvidenceInput } | { ok: false; error: string }> {
  const recordedAt = new Date(String(body.recordedAt ?? ""))
  if (isNaN(recordedAt.getTime())) return { ok: false, error: "Enter the date and time." }

  const odometerRaw = String(body.odometer ?? "").replace(/[^\d]/g, "")
  if (!odometerRaw) return { ok: false, error: "Enter the odometer reading." }
  const fuel = String(body.fuel ?? "").trim()
  if (!fuel) return { ok: false, error: "Select the fuel level." }

  const photoIds = Array.isArray(body.photoIds) ? body.photoIds.map(String) : []
  if (photoIds.length > MAX_CHECKLIST_PHOTOS) {
    return { ok: false, error: `Up to ${MAX_CHECKLIST_PHOTOS} photos.` }
  }
  const signatureFileId = body.signatureFileId ? String(body.signatureFileId) : null
  if (!signatureFileId) return { ok: false, error: "The customer must sign on screen." }

  const files = await listRentalFiles(rentalId)
  const owned = (id: string, k: string) => files.some((f) => f.id === id && f.kind === k)
  if (!photoIds.every((id) => owned(id, `${kind}_photo`)) || !owned(signatureFileId, `${kind}_signature`)) {
    return { ok: false, error: "Photos or signature don't belong to this rental." }
  }

  let amountOwed: number | null = null
  if (kind === "return") {
    amountOwed = Number(body.amountOwed ?? 0)
    if (!Number.isFinite(amountOwed) || amountOwed < 0) {
      return { ok: false, error: "Amount still owed must be 0 or more." }
    }
  }

  return {
    ok: true,
    value: {
      rentalId,
      kind,
      recordedAt: recordedAt.toISOString(),
      odometer: Number(odometerRaw),
      fuel: fuel.slice(0, 40),
      photoIds,
      signatureFileId,
      signedName: String(body.signedName ?? "").trim().slice(0, 120),
      amountOwed,
      notes: String(body.notes ?? "").trim().slice(0, 1000),
    },
  }
}
