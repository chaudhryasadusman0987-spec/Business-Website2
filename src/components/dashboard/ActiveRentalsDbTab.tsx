"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { RefreshCw, AlertCircle, Undo2 } from "lucide-react"

interface Agreement {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleRego: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedWeeklyRate: number
  agreedWeeklyRate: number
  bondWeeks: number
  bondAmount: number
  paymentMethod: string
  status: string
  startDate: string
  returnDate: string | null
}

function todayLocalDate(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

// Dashboard "Active Rentals" tab — subscriptions started via the car rental
// Stripe flow (rental_agreements table). "Mark Returned" cancels the Stripe
// subscription, detaches the saved payment method, and shows the pro-rated
// refund the owner should process manually in the Stripe dashboard.
export default function ActiveRentalsDbTab() {
  const [rows, setRows] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [returnDate, setReturnDate] = useState(todayLocalDate())
  const [lastPaymentAmount, setLastPaymentAmount] = useState("")
  const [lastPaymentDate, setLastPaymentDate] = useState(todayLocalDate())
  const [result, setResult] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch("/api/rental-payment/agreements?status=active", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data.agreements) ? data.agreements : []))
      .catch(() => setError("Could not load active rentals."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openReturn = (row: Agreement) => {
    setReturningId(row.id)
    setReturnDate(todayLocalDate())
    setLastPaymentAmount(String(row.agreedWeeklyRate))
    setLastPaymentDate(row.startDate.slice(0, 10))
  }

  const submitReturn = async (row: Agreement) => {
    setSubmittingId(row.id)
    setError(null)
    try {
      const res = await fetch("/api/rental-payment/return-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId: row.id,
          returnDate,
          lastPaymentAmount: Number(lastPaymentAmount) || row.agreedWeeklyRate,
          lastPaymentDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Return failed")
      setResult((prev) => ({
        ...prev,
        [row.id]: `Days used: ${data.daysUsed}/7 · Refund owed: $${Number(data.refundAmount).toFixed(2)}`,
      }))
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setReturningId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Return failed.")
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">Active Rentals</h1>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="text-[#666] text-[14px] mb-6">
        Vehicles on a weekly Stripe subscription. Mark a vehicle returned to
        cancel its billing and remove the saved payment method.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      {Object.entries(result).length > 0 && (
        <div className="bg-[#e1f5ee] border border-[#0f6e56] rounded-[10px] p-3 mb-4">
          {Object.entries(result).map(([id, msg]) => (
            <p key={id} className="text-[13px] text-[#085041]">
              {msg} — process the refund from your Stripe dashboard.
            </p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Weekly Rate</th>
                <th className="px-5 py-3">Bond</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Started</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="border-b border-[#f0f0f8] last:border-0 align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[14px] text-[#1a1a2e]">
                          {r.vehicleName}
                        </div>
                        <div className="text-[11px] text-[#9496a8]">{r.vehicleRego}</div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#444]">
                        <div>{r.customerName}</div>
                        <div className="text-[11px] text-[#9496a8]">{r.customerPhone}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[14px] text-[#1a1a2e]">
                        ${r.agreedWeeklyRate}/wk
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#666]">
                        {r.bondWeeks > 0 ? `$${r.bondAmount} (${r.bondWeeks}wk)` : "In person"}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#666]">
                        {r.paymentMethod === "au_becs_debit" ? "Direct debit" : "Card"}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#9496a8] whitespace-nowrap">
                        {new Date(r.startDate).toLocaleDateString("en-AU")}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openReturn(r)}
                          className="border border-[#e8e8f0] text-[#666] rounded-[8px] px-3 h-[34px] text-[12px] font-semibold flex items-center gap-1 hover:border-[#7f85f7] hover:text-[#7f85f7]"
                        >
                          <Undo2 size={13} /> Mark Returned
                        </button>
                      </td>
                    </tr>
                    {returningId === r.id && (
                      <tr className="bg-[#f9f9ff] border-b border-[#f0f0f8]">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[600px]">
                            <div>
                              <label className="block text-[11px] text-[#9496a8] uppercase tracking-wider mb-1">
                                Return Date
                              </label>
                              <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#9496a8] uppercase tracking-wider mb-1">
                                Last Payment ($)
                              </label>
                              <input
                                type="number"
                                value={lastPaymentAmount}
                                onChange={(e) => setLastPaymentAmount(e.target.value)}
                                className="w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#9496a8] uppercase tracking-wider mb-1">
                                Last Payment Date
                              </label>
                              <input
                                type="date"
                                value={lastPaymentDate}
                                onChange={(e) => setLastPaymentDate(e.target.value)}
                                className="w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px]"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => submitReturn(r)}
                              disabled={submittingId === r.id}
                              className="bg-[#0f6e56] text-white rounded-[8px] px-4 h-[36px] text-[12px] font-semibold disabled:opacity-50"
                            >
                              {submittingId === r.id ? "Processing…" : "Confirm Return"}
                            </button>
                            <button
                              onClick={() => setReturningId(null)}
                              disabled={submittingId === r.id}
                              className="border border-[#e8e8f0] text-[#666] rounded-[8px] px-4 h-[36px] text-[12px] font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="py-10 text-center text-[#9496a8] text-[14px]">Loading…</p>}
        {!loading && rows.length === 0 && (
          <p className="py-10 text-center text-[#9496a8] text-[14px]">
            No active weekly rentals yet.
          </p>
        )}
      </div>
    </div>
  )
}
