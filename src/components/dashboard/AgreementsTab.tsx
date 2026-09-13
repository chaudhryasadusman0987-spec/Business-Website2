"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, AlertCircle, Copy, Check } from "lucide-react"

interface Vehicle {
  id: string
  name: string
  rego: string
  make: string
  model: string
  year: number
  weeklyRate: number
}

interface Agreement {
  id: string
  renterName: string
  renterEmail: string
  make: string
  model: string
  rego: string
  status: string
  createdAt: string
}

const EMPTY_FORM = {
  renterName: "",
  renterAddress: "",
  renterDob: "",
  licenceNumber: "",
  licenceState: "QLD",
  renterPhone: "",
  renterEmail: "",
  vehicleId: "",
  rego: "",
  make: "",
  model: "",
  year: "",
  vin: "",
  odometerStart: "",
  weeklyRent: "",
  securityDeposit: "",
  insuranceAccessFee: "",
  startDate: "",
  startTime: "",
}

const inp =
  "w-full border border-[#e8e8f0] rounded-[10px] h-[44px] px-3 text-[13px] focus:border-[#7f85f7] outline-none transition-colors"
const lbl =
  "block text-[11px] font-semibold text-[#666880] uppercase tracking-wider mb-1"

// Dashboard "Agreements" tab — Ehtsham fills in renter + vehicle + rental
// details, generates a lease agreement, and the customer gets an email with
// a link to review and sign it. Reads/writes go through /api/agreements/*.
export default function AgreementsTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ signUrl: string; emailSent: boolean } | null>(
    null,
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadVehicles = useCallback(() => {
    fetch("/api/vehicles?all=1&light=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setVehicles(Array.isArray(d.vehicles) ? d.vehicles : []))
      .catch(() => setVehicles([]))
  }, [])

  const loadAgreements = useCallback(() => {
    setLoadingList(true)
    fetch("/api/agreements", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAgreements(Array.isArray(d.agreements) ? d.agreements : []))
      .catch(() => setAgreements([]))
      .finally(() => setLoadingList(false))
  }, [])

  useEffect(() => {
    loadVehicles()
    loadAgreements()
  }, [loadVehicles, loadAgreements])

  const set = (k: keyof typeof EMPTY_FORM, val: string) =>
    setForm((f) => ({ ...f, [k]: val }))

  const selectVehicle = (id: string) => {
    const v = vehicles.find((x) => x.id === id)
    setForm((f) => ({
      ...f,
      vehicleId: id,
      rego: v?.rego || "",
      make: v?.make || "",
      model: v?.model || "",
      year: v ? String(v.year) : "",
      weeklyRent: v?.weeklyRate ? String(v.weeklyRate) : f.weeklyRent,
    }))
  }

  const canSubmit =
    form.renterName.trim() &&
    form.renterEmail.trim() &&
    form.rego.trim() &&
    Number(form.weeklyRent) > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/agreements/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Failed to create agreement")
      setResult({ signUrl: data.signUrl, emailSent: data.emailSent })
      setForm(EMPTY_FORM)
      loadAgreements()
    } catch (e) {
      setError((e as Error).message || "Could not generate the agreement.")
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = (id: string, url: string) => {
    navigator.clipboard?.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
  }

  const signUrlFor = (id: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/sign-agreement/${id}`

  return (
    <div>
      <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-2">Agreements</h1>
      <p className="text-[#666] text-[14px] mb-6">
        Generate a lease agreement for a renter — they get an email with a
        link to review the terms, draw a signature, and submit.
      </p>

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-8">
        <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-4">
          Renter Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className={lbl}>Renter Name *</label>
            <input
              className={inp}
              value={form.renterName}
              onChange={(e) => set("renterName", e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className={lbl}>Email *</label>
            <input
              className={inp}
              type="email"
              value={form.renterEmail}
              onChange={(e) => set("renterEmail", e.target.value)}
              placeholder="john@email.com"
            />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input
              className={inp}
              value={form.renterPhone}
              onChange={(e) => set("renterPhone", e.target.value)}
              placeholder="0412 345 678"
            />
          </div>
          <div>
            <label className={lbl}>Date of Birth</label>
            <input
              className={inp}
              type="date"
              value={form.renterDob}
              onChange={(e) => set("renterDob", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Address</label>
            <input
              className={inp}
              value={form.renterAddress}
              onChange={(e) => set("renterAddress", e.target.value)}
              placeholder="123 Main St, Brisbane QLD 4000"
            />
          </div>
          <div>
            <label className={lbl}>Licence No.</label>
            <input
              className={inp}
              value={form.licenceNumber}
              onChange={(e) => set("licenceNumber", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Licence State</label>
            <select
              className={`${inp} appearance-none`}
              value={form.licenceState}
              onChange={(e) => set("licenceState", e.target.value)}
            >
              {["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-4">
          Vehicle
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="sm:col-span-2">
            <label className={lbl}>Select Vehicle</label>
            <select
              className={`${inp} appearance-none`}
              value={form.vehicleId}
              onChange={(e) => selectVehicle(e.target.value)}
            >
              <option value="">— Choose a vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.rego})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Registration *</label>
            <input
              className={inp}
              value={form.rego}
              onChange={(e) => set("rego", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>VIN</label>
            <input
              className={inp}
              value={form.vin}
              onChange={(e) => set("vin", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Make</label>
            <input
              className={inp}
              value={form.make}
              onChange={(e) => set("make", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Model</label>
            <input
              className={inp}
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Year</label>
            <input
              className={inp}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Odometer at Start</label>
            <input
              className={inp}
              value={form.odometerStart}
              onChange={(e) => set("odometerStart", e.target.value)}
            />
          </div>
        </div>

        <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-4">
          Rental Terms
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className={lbl}>Weekly Rent ($) *</label>
            <input
              className={inp}
              type="number"
              value={form.weeklyRent}
              onChange={(e) => set("weeklyRent", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Security Deposit ($)</label>
            <input
              className={inp}
              type="number"
              value={form.securityDeposit}
              onChange={(e) => set("securityDeposit", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Insurance Access Fee ($)</label>
            <input
              className={inp}
              type="number"
              value={form.insuranceAccessFee}
              onChange={(e) => set("insuranceAccessFee", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Start Date</label>
            <input
              className={inp}
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className={lbl}>Start Time</label>
            <input
              className={inp}
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-red-600 text-[13px]">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-[#e1f5ee] border border-[#0f6e56] rounded-[10px] p-4 mb-4">
            <p className="text-[13px] font-semibold text-[#085041] mb-2">
              {result.emailSent
                ? "Agreement created — email sent to the customer."
                : "Agreement created, but the email could not be sent. Share the link below manually."}
            </p>
            <div className="flex items-center gap-2 bg-white rounded-[8px] px-3 py-2">
              <input
                readOnly
                value={result.signUrl}
                className="flex-1 text-[12px] text-[#444] outline-none bg-transparent"
              />
              <button
                onClick={() => navigator.clipboard?.writeText(result.signUrl)}
                className="text-[#0f6e56] hover:text-[#085041]"
                aria-label="Copy link"
              >
                <Copy size={15} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="bg-[#7f85f7] text-white rounded-[10px] h-[48px] px-6 font-bold text-[14px] hover:bg-[#6b71f0] disabled:opacity-40 transition-all"
        >
          {submitting ? "Generating…" : "Generate & Send Agreement"}
        </button>
      </div>

      <div className="flex justify-between items-start mb-2">
        <h2 className="font-bold text-[18px] text-[#1a1a2e]">Existing Agreements</h2>
        <button
          onClick={loadAgreements}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                <th className="px-4 py-3">Renter</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {!loadingList &&
                agreements.map((a) => (
                  <tr key={a.id} className="border-b border-[#f0f0f8] last:border-0">
                    <td className="px-4 py-4 text-[13px] text-[#1a1a2e] font-medium">
                      {a.renterName}
                      <div className="text-[11px] text-[#9496a8]">{a.renterEmail}</div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#444]">
                      {a.make} {a.model} ({a.rego})
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                          a.status === "signed"
                            ? "text-[#2e7d32] border-[#8cc98f] bg-[rgba(76,175,80,0.08)]"
                            : "text-[#b45a00] border-[#f0a868] bg-[rgba(245,124,0,0.08)]"
                        }`}
                      >
                        {a.status === "signed" ? "Signed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#9496a8] whitespace-nowrap">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {a.status !== "signed" && (
                        <button
                          onClick={() => copyLink(a.id, signUrlFor(a.id))}
                          className="flex items-center gap-1 text-[12px] font-semibold text-[#7f85f7] hover:text-[#6b71f0]"
                        >
                          {copiedId === a.id ? (
                            <>
                              <Check size={13} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy Link
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {loadingList && (
          <p className="py-10 text-center text-[#9496a8] text-[14px]">Loading…</p>
        )}
        {!loadingList && agreements.length === 0 && (
          <p className="py-10 text-center text-[#9496a8] text-[14px]">
            No agreements created yet.
          </p>
        )}
      </div>
    </div>
  )
}
