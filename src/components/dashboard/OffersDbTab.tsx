"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, Check, X, AlertCircle } from "lucide-react"

interface Negotiation {
  id: string
  vehicleId: string
  vehicleName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedPrice: number
  offeredPrice: number
  status: string
  approvedPrice: number | null
  createdAt: string
  respondedAt: string | null
}

function statusPill(status: string): string {
  switch (status) {
    case "approved":
      return "text-[#2e7d32] border-[#8cc98f] bg-[rgba(76,175,80,0.08)]"
    case "declined":
      return "text-[#c62828] border-[#e58a8a] bg-[rgba(198,40,40,0.06)]"
    default:
      return "text-[#b45a00] border-[#f0a868] bg-[rgba(245,124,0,0.08)]"
  }
}

// Dashboard "Offers" tab — vehicle price negotiations sent from the car rental
// detail modal. Reads/writes go through /api/rental-payment/negotiate-price.
export default function OffersDbTab() {
  const [rows, setRows] = useState<Negotiation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch("/api/rental-payment/negotiate-price", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data.negotiations) ? data.negotiations : []))
      .catch(() => setError("Could not load offers."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const respond = async (row: Negotiation, status: "approved" | "declined") => {
    let approvedPrice: number | null = null
    if (status === "approved") {
      const input = window.prompt(
        `Approve at what weekly price? (customer offered $${row.offeredPrice}, listed $${row.listedPrice})`,
        String(row.offeredPrice)
      )
      if (input === null) return
      approvedPrice = Number(input)
      if (!approvedPrice || approvedPrice <= 0) return
    }
    setBusyId(row.id)
    try {
      const res = await fetch("/api/rental-payment/negotiate-price", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, status, approvedPrice }),
      })
      if (!res.ok) throw new Error()
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, status, approvedPrice: approvedPrice ?? r.approvedPrice } : r
        )
      )
    } catch {
      setError("Could not update this offer.")
    } finally {
      setBusyId(null)
    }
  }

  const pending = rows.filter((r) => r.status === "pending")
  const resolved = rows.filter((r) => r.status !== "pending")

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">Price Offers</h1>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="text-[#666] text-[14px] mb-6">
        Counter-offers customers send from the car rental listing. Approving
        one lets the customer complete their booking at the approved rate.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden mb-8">
        <div className="bg-[#f8f8ff] px-5 py-3 border-b border-[#e8e8f0]">
          <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider">
            Pending ({pending.length})
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <tbody>
              {!loading &&
                pending.map((r) => (
                  <tr key={r.id} className="border-b border-[#f0f0f8] last:border-0 align-top">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[14px] text-[#1a1a2e]">
                        {r.vehicleName}
                      </div>
                      <div className="text-[11px] text-[#9496a8] mt-1">
                        {r.customerName} · {r.customerPhone} · {r.customerEmail}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-[11px] text-[#9496a8] line-through">
                        ${r.listedPrice}/wk listed
                      </div>
                      <div className="font-bold text-[16px] text-[#0f6e56]">
                        ${r.offeredPrice}/wk offered
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => respond(r, "approved")}
                          disabled={busyId === r.id}
                          className="bg-[#0f6e56] text-white rounded-[8px] px-3 h-[34px] text-[12px] font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => respond(r, "declined")}
                          disabled={busyId === r.id}
                          className="border border-[#e8e8f0] text-[#666] rounded-[8px] px-3 h-[34px] text-[12px] font-semibold flex items-center gap-1 hover:border-[#c62828] hover:text-[#c62828] disabled:opacity-50"
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="py-10 text-center text-[#9496a8] text-[14px]">Loading…</p>}
        {!loading && pending.length === 0 && (
          <p className="py-10 text-center text-[#9496a8] text-[14px]">No pending offers.</p>
        )}
      </div>

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="bg-[#f8f8ff] px-5 py-3 border-b border-[#e8e8f0]">
          <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider">
            Resolved ({resolved.length})
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <tbody>
              {resolved.map((r) => (
                <tr key={r.id} className="border-b border-[#f0f0f8] last:border-0 align-top">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[14px] text-[#1a1a2e]">
                      {r.vehicleName}
                    </div>
                    <div className="text-[11px] text-[#9496a8] mt-1">{r.customerName}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-[13px] text-[#666]">
                    ${r.listedPrice} → ${r.offeredPrice}
                    {r.status === "approved" && r.approvedPrice != null
                      ? ` (approved $${r.approvedPrice})`
                      : ""}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusPill(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && resolved.length === 0 && (
          <p className="py-10 text-center text-[#9496a8] text-[14px]">Nothing resolved yet.</p>
        )}
      </div>
    </div>
  )
}
