"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw, AlertCircle, FileText, Send, Hammer, Clock } from "lucide-react"

interface EvidenceSummary {
  files: { field: string; name: string; bytes: number }[]
  textFields: string[]
  payments: number
  emails: number
  warnings: string[]
}

interface Dispute {
  id: string
  rentalId: string | null
  customerName: string
  amount: number
  currency: string
  reason: string
  status: string
  dueBy: string | null
  evidenceStatus: "none" | "draft" | "submitted"
  evidencePackFileId: string | null
  evidenceSummary: EvidenceSummary | null
  evidenceBuiltAt: string | null
  evidenceSubmittedAt: string | null
}

function countdown(dueBy: string | null, now: number): { label: string; urgent: boolean } {
  if (!dueBy) return { label: "No deadline from Stripe", urgent: false }
  const ms = new Date(dueBy).getTime() - now
  if (ms <= 0) return { label: "Deadline passed", urgent: true }
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  return {
    label: days > 0 ? `${days}d ${hours}h left` : `${hours}h ${mins}m left`,
    urgent: ms < 3 * 86_400_000,
  }
}

// /rental-admin "Disputes" tab. Chargebacks arrive via the Stripe webhook
// (charge.dispute.*). "Build evidence pack" uploads everything on file for
// the rental to Stripe as a draft; "Submit to bank" sends it — once, for good.
export default function DisputesTab() {
  const [rows, setRows] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/disputes${showClosed ? "?all=1" : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setRows(Array.isArray(d.disputes) ? d.disputes : [])
        if (d.error) setError(d.error)
      })
      .catch(() => setError("Could not load disputes."))
      .finally(() => setLoading(false))
  }, [showClosed])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const act = async (d: Dispute, action: "build" | "submit") => {
    if (
      action === "submit" &&
      !window.confirm(
        `Submit the evidence for ${d.customerName}'s $${d.amount.toFixed(2)} dispute to the bank?\n\n` +
          "Stripe allows ONE submission per dispute — it can't be changed afterwards.",
      )
    ) {
      return
    }
    setBusy(`${d.id}:${action}`)
    setError(null)
    try {
      const res = await fetch(`/api/disputes/${encodeURIComponent(d.id)}/${action}`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `${action} failed`)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setBusy(null)
    }
  }

  const btn = "rounded-[8px] px-3 h-[34px] text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">Disputes</h1>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[#666]">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Show closed
          </label>
          <button
            onClick={load}
            className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7]"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>
      <p className="text-[#666] text-[14px] mb-6">
        Build the evidence pack, open the PDF to check it, then submit before the deadline. A missed
        deadline loses the dispute automatically.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      {loading && <p className="py-10 text-center text-[#9496a8] text-[14px]">Loading…</p>}
      {!loading && rows.length === 0 && (
        <div className="bg-white rounded-[16px] border border-[#e8e8f0] py-12 text-center text-[#9496a8] text-[14px]">
          {showClosed ? "No disputes yet." : "No open disputes. 🎉"}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((d) => {
          const c = countdown(d.dueBy, now)
          const closed = ["won", "lost", "warning_closed", "prevented"].includes(d.status)
          const summary = d.evidenceSummary
          return (
            <div key={d.id} className="bg-white rounded-[16px] border border-[#e8e8f0] p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-[16px] text-[#1a1a2e]">
                    {d.customerName} — ${d.amount.toFixed(2)} {d.currency.toUpperCase()}
                  </p>
                  <p className="text-[12px] text-[#666] mt-0.5">
                    Reason: <strong>{d.reason.replace(/_/g, " ")}</strong> · Stripe status:{" "}
                    {d.status.replace(/_/g, " ")} · {d.id}
                  </p>
                  {d.dueBy && (
                    <p className="text-[12px] text-[#9496a8]">
                      Respond by {new Date(d.dueBy).toLocaleString("en-AU")}
                    </p>
                  )}
                </div>
                {!closed && (
                  <div
                    className={`flex items-center gap-1.5 rounded-[10px] px-3 h-[34px] text-[13px] font-bold ${
                      c.urgent ? "bg-red-50 text-red-700" : "bg-[#eeedfe] text-[#534ab7]"
                    }`}
                  >
                    <Clock size={14} /> {c.label}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider rounded-[6px] px-2 py-1 ${
                    d.evidenceStatus === "submitted"
                      ? "bg-[#e1f5ee] text-[#085041]"
                      : d.evidenceStatus === "draft"
                        ? "bg-[#fff8e1] text-[#7d5a00]"
                        : "bg-[#f5f5f8] text-[#666]"
                  }`}
                >
                  {d.evidenceStatus === "submitted"
                    ? `Submitted ${d.evidenceSubmittedAt ? new Date(d.evidenceSubmittedAt).toLocaleDateString("en-AU") : ""}`
                    : d.evidenceStatus === "draft"
                      ? "Draft saved in Stripe — review then submit"
                      : "No evidence yet"}
                </span>
                {d.evidenceStatus !== "submitted" && !closed && (
                  <button
                    onClick={() => act(d, "build")}
                    disabled={!!busy || !d.rentalId}
                    title={d.rentalId ? "" : "Not linked to a rental — respond in the Stripe dashboard"}
                    className={`${btn} border border-[#7f85f7] text-[#7f85f7] hover:bg-[#eeedfe]`}
                  >
                    <Hammer size={13} />
                    {busy === `${d.id}:build`
                      ? "Building…"
                      : d.evidenceStatus === "draft"
                        ? "Rebuild evidence pack"
                        : "Build evidence pack"}
                  </button>
                )}
                {d.evidencePackFileId && (
                  <a
                    href={`/api/rental-files/${d.evidencePackFileId}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${btn} border border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]`}
                  >
                    <FileText size={13} /> Review pack PDF
                  </a>
                )}
                {d.evidenceStatus === "draft" && !closed && (
                  <button
                    onClick={() => act(d, "submit")}
                    disabled={!!busy}
                    className={`${btn} bg-[#0f6e56] text-white`}
                  >
                    <Send size={13} /> {busy === `${d.id}:submit` ? "Submitting…" : "Submit to bank"}
                  </button>
                )}
              </div>

              {summary && (
                <div className="mt-4 bg-[#f8f8ff] rounded-[10px] p-3 text-[12px] text-[#444]">
                  <p>
                    <strong>Draft contents:</strong>{" "}
                    {summary.files.map((f) => `${f.field} (${Math.round(f.bytes / 1024)}KB)`).join(", ")} ·{" "}
                    {summary.textFields.length} text fields · {summary.payments} payments · {summary.emails} emails
                  </p>
                  {summary.warnings.length > 0 && (
                    <ul className="mt-2 text-[#b26a00] list-disc pl-5">
                      {summary.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
