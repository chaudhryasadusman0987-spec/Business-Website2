"use client"

import { useRef, useState } from "react"
import { Camera, X } from "lucide-react"
import SignaturePad, { type SignaturePadHandle } from "@/components/dashboard/SignaturePad"
import { compressImage } from "@/lib/compressImage"

const MAX_PHOTOS = 8
const FUEL_LEVELS = ["Empty", "1/4", "1/2", "3/4", "Full"]

export interface ChecklistRental {
  id: string
  customerName: string
  agreedWeeklyRate: number
  startDate: string
}

function nowLocal(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

// Pickup (handover) or return checklist in /rental-admin: date/time, odometer,
// fuel, up to 8 photos and the customer's on-screen signature. Photos upload
// one at a time as they're added (compressed in the browser), so the final
// save only sends their ids. The return checklist also ends weekly billing.
export default function RentalChecklist({
  rental,
  kind,
  onDone,
  onCancel,
}: {
  rental: ChecklistRental
  kind: "pickup" | "return"
  onDone: (message: string) => void
  onCancel: () => void
}) {
  const [recordedAt, setRecordedAt] = useState(nowLocal())
  const [odometer, setOdometer] = useState("")
  const [fuel, setFuel] = useState("")
  const [notes, setNotes] = useState("")
  const [signedName, setSignedName] = useState(rental.customerName)
  const [amountOwed, setAmountOwed] = useState("0")
  const [lastPaymentAmount, setLastPaymentAmount] = useState(String(rental.agreedWeeklyRate))
  const [lastPaymentDate, setLastPaymentDate] = useState(rental.startDate.slice(0, 10))
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([])
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const sigRef = useRef<SignaturePadHandle>(null)

  const upload = async (file: Blob, fileKind: string, name: string): Promise<string> => {
    const fd = new FormData()
    fd.append("rentalId", rental.id)
    fd.append("kind", fileKind)
    fd.append("file", file, name)
    const res = await fetch("/api/rental-evidence/photo", { method: "POST", body: fd })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.id) throw new Error(data.error || "Upload failed")
    return data.id
  }

  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    const room = MAX_PHOTOS - photos.length - uploading
    const picked = Array.from(files).slice(0, Math.max(0, room))
    setError("")
    setUploading((n) => n + picked.length)
    for (const f of picked) {
      try {
        const small = await compressImage(f, 1280, 0.75)
        if (small.type !== "image/jpeg" && small.type !== "image/png") {
          throw new Error(`${f.name}: use a JPEG or PNG photo`)
        }
        const id = await upload(small, `${kind}_photo`, small.name)
        setPhotos((p) => [...p, { id, url: URL.createObjectURL(small) }])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Photo upload failed")
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const save = async () => {
    setError("")
    if (!odometer || !fuel) return setError("Enter the odometer and fuel level.")
    if (!sigRef.current || sigRef.current.isEmpty()) return setError("The customer must sign on screen.")
    if (uploading > 0) return setError("Wait for the photos to finish uploading.")
    setSaving(true)
    try {
      const blob = await sigRef.current.toBlob()
      if (!blob) throw new Error("Could not read the signature.")
      const signatureFileId = await upload(blob, `${kind}_signature`, "signature.png")
      const body = {
        rentalId: rental.id,
        agreementId: rental.id,
        recordedAt: new Date(recordedAt).toISOString(),
        odometer,
        fuel,
        photoIds: photos.map((p) => p.id),
        signatureFileId,
        signedName,
        notes,
        ...(kind === "return" ? { amountOwed: Number(amountOwed) || 0, lastPaymentAmount, lastPaymentDate } : {}),
      }
      const res = await fetch(kind === "return" ? "/api/rental-payment/return-vehicle" : "/api/rental-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Save failed")
      onDone(
        kind === "return"
          ? `Returned · days used ${data.daysUsed}/7 · refund owed $${Number(data.refundAmount).toFixed(2)} · ` +
              (data.emailed ? "confirmation PDF emailed" : "⚠️ confirmation email FAILED — resend manually")
          : "Pickup checklist saved",
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const lbl = "block text-[11px] text-[#9496a8] uppercase tracking-wider mb-1"
  const inp = "w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px] bg-white"

  return (
    <div className="max-w-[720px]">
      <p className="font-semibold text-[14px] text-[#1a1a2e] mb-3">
        {kind === "pickup" ? "Pickup checklist (handover)" : "Return checklist"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={lbl}>Date / time</label>
          <input type="datetime-local" value={recordedAt} onChange={(e) => setRecordedAt(e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Odometer (km)</label>
          <input inputMode="numeric" value={odometer} onChange={(e) => setOdometer(e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Fuel</label>
          <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={inp}>
            <option value="">Select…</option>
            {FUEL_LEVELS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        {kind === "return" && (
          <>
            <div>
              <label className={lbl}>Amount still owed ($)</label>
              <input type="number" min="0" step="0.01" value={amountOwed} onChange={(e) => setAmountOwed(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Last payment ($)</label>
              <input type="number" value={lastPaymentAmount} onChange={(e) => setLastPaymentAmount(e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Last payment date</label>
              <input type="date" value={lastPaymentDate} onChange={(e) => setLastPaymentDate(e.target.value)} className={inp} />
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        <label className={lbl}>
          Photos ({photos.length}/{MAX_PHOTOS}){uploading > 0 ? ` · uploading ${uploading}…` : ""}
        </label>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative w-[84px] h-[64px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="w-full h-full object-cover rounded-[6px] border border-[#e8e8f0]" />
              <button
                type="button"
                onClick={() => setPhotos((all) => all.filter((x) => x.id !== p.id))}
                className="absolute -top-1.5 -right-1.5 bg-white border border-[#e8e8f0] rounded-full p-0.5"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length + uploading < MAX_PHOTOS && (
            <label className="w-[84px] h-[64px] border-2 border-dashed border-[#e8e8f0] rounded-[6px] flex items-center justify-center cursor-pointer hover:border-[#7f85f7]">
              <Camera size={18} className="text-[#9496a8]" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files)
                  e.target.value = ""
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label className={lbl}>Notes (damage, extras)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inp} h-auto py-2`} />
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-end">
          <label className={lbl}>Customer signature</label>
          <button type="button" onClick={() => sigRef.current?.clear()} className="text-[11px] text-[#7f85f7] mb-1">
            Clear
          </button>
        </div>
        <SignaturePad ref={sigRef} />
        <input
          value={signedName}
          onChange={(e) => setSignedName(e.target.value)}
          placeholder="Signer's full name"
          className={`${inp} mt-2`}
        />
      </div>

      {error && <p className="text-red-600 text-[12px] mt-3">{error}</p>}

      <div className="flex gap-2 mt-4">
        <button
          onClick={save}
          disabled={saving || uploading > 0}
          className="bg-[#0f6e56] text-white rounded-[8px] px-4 h-[36px] text-[12px] font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : kind === "return" ? "Confirm return & email PDF" : "Save pickup checklist"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="border border-[#e8e8f0] text-[#666] rounded-[8px] px-4 h-[36px] text-[12px] font-semibold"
        >
          Cancel
        </button>
      </div>
      {kind === "return" && (
        <p className="text-[11px] text-[#9496a8] mt-2">
          Confirming cancels weekly billing, removes the saved card/bank details and emails the
          customer a PDF return confirmation.
        </p>
      )}
    </div>
  )
}
