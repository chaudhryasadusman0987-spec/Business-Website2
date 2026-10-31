"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import {
  RefreshCw,
  AlertCircle,
  Undo2,
  KeyRound,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react"
import RentalChecklist from "@/components/dashboard/RentalChecklist"

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
  threeDsResult: string | null
  cardholderName: string | null
  nameCheck: string | null
  trusted: boolean
}

interface TrustedRenter {
  email: string
  note: string
}

type PanelMode = "details" | "pickup" | "return"

// Dashboard "Active Rentals" tab — rentals in the rental_agreements table.
// Flags chargeback risks (cardholder ≠ licence name, 3D Secure outcome),
// manages the Trusted list that gates BECS direct debit, and records the
// pickup / return checklists. Returning a vehicle cancels its Stripe
// subscription, detaches the saved payment method and emails a PDF
// confirmation; any refund is processed manually in the Stripe dashboard.
export default function ActiveRentalsDbTab() {
  const [rows, setRows] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [panel, setPanel] = useState<{ id: string; mode: PanelMode } | null>(null)
  const [result, setResult] = useState<string[]>([])

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

  const toggle = (id: string, mode: PanelMode) =>
    setPanel((p) => (p?.id === id && p.mode === mode ? null : { id, mode }))

  const setTrusted = async (row: Agreement, trusted: boolean) => {
    setError(null)
    const res = trusted
      ? await fetch("/api/rental-payment/trusted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: row.customerEmail, note: row.customerName }),
        })
      : await fetch(`/api/rental-payment/trusted?email=${encodeURIComponent(row.customerEmail)}`, {
          method: "DELETE",
        })
    if (!res.ok) setError("Could not update Trusted status.")
    load()
  }

  const btn =
    "border border-[#e8e8f0] text-[#666] rounded-[8px] px-2.5 h-[30px] text-[11px] font-semibold flex items-center gap-1 hover:border-[#7f85f7] hover:text-[#7f85f7] whitespace-nowrap"

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
        Record the pickup checklist at handover and the return checklist when
        the car comes back — both are your evidence if a charge is disputed.
      </p>
      <div className="bg-[#fff8e1] border border-[#f0c040] rounded-[10px] p-3 mb-6">
        <p className="text-[12px] text-[#7d5a00]">
          ⚠️ This is the only place a rental subscription gets cancelled —
          there is no cancel option on the customer-facing site. Confirming a
          return cancels weekly billing and removes the customer&apos;s saved
          card/bank details.
        </p>
      </div>

      <TrustedRenters onChange={load} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500" />
          <p className="text-red-600 text-[13px]">{error}</p>
        </div>
      )}

      {result.length > 0 && (
        <div className="bg-[#e1f5ee] border border-[#0f6e56] rounded-[10px] p-3 mb-4">
          {result.map((msg, i) => (
            <p key={i} className="text-[13px] text-[#085041]">
              {msg}
            </p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[880px]">
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
                        <div className="font-semibold text-[14px] text-[#1a1a2e]">{r.vehicleName}</div>
                        <div className="text-[11px] text-[#9496a8]">{r.vehicleRego}</div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#444]">
                        <div className="flex items-center gap-1">
                          {r.customerName}
                          {r.trusted && (
                            <span title="Priority customer — direct debit allowed">
                              <Star size={12} className="text-[#f0ad4e] fill-[#f0ad4e]" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#9496a8]">{r.customerPhone}</div>
                        {r.nameCheck === "mismatch" && (
                          <div
                            className="mt-1 inline-block bg-red-50 border border-red-200 text-red-700 rounded-[6px] px-2 py-0.5 text-[11px] font-semibold"
                            title={`Cardholder: ${r.cardholderName ?? "—"}`}
                          >
                            Name mismatch – verify before handover
                          </div>
                        )}
                        <button
                          onClick={() => setTrusted(r, !r.trusted)}
                          className="block mt-1 text-[11px] text-[#7f85f7] hover:underline"
                        >
                          {r.trusted ? "Remove Priority" : "Mark Priority"}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[14px] text-[#1a1a2e]">
                        ${r.agreedWeeklyRate}/wk
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#666]">
                        {r.bondAmount > 0
                          ? `$${r.bondAmount}${r.bondWeeks > 0 ? ` (${r.bondWeeks}wk)` : ""}`
                          : "In person"}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#666]">
                        {r.paymentMethod === "au_becs_debit"
                          ? "Direct debit"
                          : r.paymentMethod === "bank-transfer"
                            ? "Bank transfer"
                            : r.paymentMethod === "lease-agreement"
                              ? "Lease agreement"
                              : "Card"}
                        {r.threeDsResult && r.threeDsResult !== "not_applicable" && (
                          <div
                            className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                              r.threeDsResult === "authenticated" ? "text-[#0f6e56]" : "text-[#b26a00]"
                            }`}
                          >
                            {r.threeDsResult === "authenticated" ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                            3DS {r.threeDsResult.replace(/_/g, " ")}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#9496a8] whitespace-nowrap">
                        {new Date(r.startDate).toLocaleDateString("en-AU")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => toggle(r.id, "details")} className={btn}>
                            <FileSearch size={12} /> Evidence
                          </button>
                          <button onClick={() => toggle(r.id, "pickup")} className={btn}>
                            <KeyRound size={12} /> Pickup
                          </button>
                          <button onClick={() => toggle(r.id, "return")} className={btn}>
                            <Undo2 size={12} /> Return
                          </button>
                        </div>
                      </td>
                    </tr>
                    {panel?.id === r.id && (
                      <tr className="bg-[#f9f9ff] border-b border-[#f0f0f8]">
                        <td colSpan={7} className="px-5 py-4">
                          {panel.mode === "details" ? (
                            <RentalDetails id={r.id} />
                          ) : (
                            <RentalChecklist
                              key={`${r.id}-${panel.mode}`}
                              rental={r}
                              kind={panel.mode}
                              onCancel={() => setPanel(null)}
                              onDone={(msg) => {
                                setResult((prev) => [...prev, `${r.vehicleRego} — ${msg}`])
                                setPanel(null)
                                if (panel.mode === "return") setRows((prev) => prev.filter((x) => x.id !== r.id))
                              }}
                            />
                          )}
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
          <p className="py-10 text-center text-[#9496a8] text-[14px]">No active weekly rentals yet.</p>
        )}
      </div>
    </div>
  )
}

/** The Trusted list — the only customers offered BECS direct debit at checkout. */
function TrustedRenters({ onChange }: { onChange: () => void }) {
  const [list, setList] = useState<TrustedRenter[]>([])
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState("")

  const load = useCallback(() => {
    fetch("/api/rental-payment/trusted", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d.trusted) ? d.trusted : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const add = async () => {
    setErr("")
    const res = await fetch("/api/rental-payment/trusted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, note: "" }),
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) return setErr(d.error || "Could not add")
    setEmail("")
    load()
    onChange()
  }

  const remove = async (e: string) => {
    await fetch(`/api/rental-payment/trusted?email=${encodeURIComponent(e)}`, { method: "DELETE" })
    load()
    onChange()
  }

  return (
    <div className="bg-white border border-[#e8e8f0] rounded-[12px] p-4 mb-6">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a2e]">
        <Star size={14} className="text-[#f0ad4e]" /> Priority customers (direct debit offered first at checkout)
        <span className="text-[#9496a8] font-normal">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-3">
          <p className="text-[12px] text-[#666] mb-3">
            BECS direct-debit disputes can&apos;t be contested, so only renters listed here see the
            direct debit option at checkout (matched by email) — and they must pay at least a 1 week
            bond. Everyone else pays by card.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com"
              className="flex-1 border border-[#e8e8f0] rounded-[8px] px-3 h-[36px] text-[13px]"
            />
            <button onClick={add} className="bg-[#7f85f7] text-white rounded-[8px] px-4 h-[36px] text-[12px] font-semibold">
              Add
            </button>
          </div>
          {err && <p className="text-red-600 text-[12px] mb-2">{err}</p>}
          {list.length === 0 ? (
            <p className="text-[12px] text-[#9496a8]">No trusted renters yet.</p>
          ) : (
            <ul className="divide-y divide-[#f0f0f8]">
              {list.map((t) => (
                <li key={t.email} className="flex justify-between items-center py-2 text-[13px]">
                  <span>
                    {t.email}
                    {t.note && <span className="text-[#9496a8]"> · {t.note}</span>}
                  </span>
                  <button onClick={() => remove(t.email)} className="text-[#9496a8] hover:text-red-600" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface RentalDetail {
  agreement: {
    customerName: string
    customerAddress: string | null
    licenceNumber: string | null
    licenceState: string | null
    cardholderName: string | null
    nameCheck: string | null
    cardBrand: string | null
    cardLast4: string | null
    threeDsResult: string | null
    threeDsVersion: string | null
    termsAcceptedAt: string | null
    termsIp: string | null
    termsTypedName: string | null
    termsVersion: string | null
    termsText: string | null
  }
  files: { id: string; kind: string; filename: string; createdAt: string }[]
  evidence: {
    kind: "pickup" | "return"
    recordedAt: string
    odometer: number | null
    fuel: string
    photoIds: string[]
    signatureFileId: string | null
    signedName: string
    amountOwed: number | null
    notes: string
  }[]
  emails: { kind: string; subject: string; sentAt: string }[]
}

/** Everything on file for one rental — what a dispute evidence pack is built from. */
function RentalDetails({ id }: { id: string }) {
  const [data, setData] = useState<RentalDetail | null>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    fetch(`/api/rental-payment/agreements/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setData(d)))
      .catch(() => setErr("Could not load rental details."))
  }, [id])

  if (err) return <p className="text-red-600 text-[13px]">{err}</p>
  if (!data) return <p className="text-[#9496a8] text-[13px]">Loading…</p>

  const a = data.agreement
  const when = (s: string | null) => (s ? new Date(s).toLocaleString("en-AU") : "—")
  const fileLink = (fid: string, label: string) => (
    <a key={fid} href={`/api/rental-files/${fid}`} target="_blank" rel="noreferrer" className="text-[#7f85f7] underline mr-3">
      {label}
    </a>
  )
  const licence = data.files.filter((f) => f.kind.startsWith("licence_"))
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex gap-3 py-1 text-[12px]">
      <span className="w-[150px] flex-shrink-0 text-[#9496a8]">{k}</span>
      <span className="text-[#1a1a2e]">{v}</span>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <p className="font-semibold text-[13px] mb-2">Identity & payment</p>
        <Row k="Licence" v={[a.licenceNumber, a.licenceState].filter(Boolean).join(" ") || "—"} />
        <Row k="Licence images" v={licence.length ? licence.map((f) => fileLink(f.id, f.kind === "licence_front" ? "Front" : "Back")) : "Not uploaded"} />
        <Row k="Address" v={a.customerAddress || "—"} />
        <Row k="Licence name" v={a.customerName} />
        <Row
          k="Cardholder name"
          v={
            <span className={a.nameCheck === "mismatch" ? "text-red-700 font-semibold" : ""}>
              {a.cardholderName || "—"} {a.nameCheck ? `(${a.nameCheck})` : ""}
            </span>
          }
        />
        <Row k="Card" v={[a.cardBrand, a.cardLast4 && `•••• ${a.cardLast4}`].filter(Boolean).join(" ") || "—"} />
        <Row k="3D Secure" v={[a.threeDsResult, a.threeDsVersion].filter(Boolean).join(" · ") || "—"} />
        <p className="font-semibold text-[13px] mt-4 mb-2">Agreement at checkout</p>
        <Row k="Accepted" v={when(a.termsAcceptedAt)} />
        <Row k="IP address" v={a.termsIp || "—"} />
        <Row k="Typed name" v={a.termsTypedName || "—"} />
        <Row k="Terms version" v={a.termsVersion || "—"} />
        {a.termsText && (
          <pre className="mt-2 whitespace-pre-wrap text-[11px] text-[#444] bg-white border border-[#e8e8f0] rounded-[8px] p-2 max-h-[160px] overflow-y-auto">
            {a.termsText}
          </pre>
        )}
      </div>
      <div>
        {(["pickup", "return"] as const).map((kind) => {
          const ev = data.evidence.find((e) => e.kind === kind)
          return (
            <div key={kind} className="mb-4">
              <p className="font-semibold text-[13px] mb-2">{kind === "pickup" ? "Pickup" : "Return"} checklist</p>
              {!ev ? (
                <p className="text-[12px] text-[#b26a00]">Not recorded yet.</p>
              ) : (
                <>
                  <Row k="Date / time" v={when(ev.recordedAt)} />
                  <Row k="Odometer / fuel" v={`${ev.odometer ?? "—"} km · ${ev.fuel}`} />
                  {kind === "return" && <Row k="Amount owed" v={`$${(ev.amountOwed ?? 0).toFixed(2)}`} />}
                  <Row k="Signed by" v={ev.signatureFileId ? fileLink(ev.signatureFileId, ev.signedName || "Signature") : "—"} />
                  <Row k="Photos" v={ev.photoIds.length ? ev.photoIds.map((p, i) => fileLink(p, `#${i + 1}`)) : "None"} />
                  {ev.notes && <Row k="Notes" v={ev.notes} />}
                </>
              )}
            </div>
          )
        })}
        <p className="font-semibold text-[13px] mb-2">Emails sent ({data.emails.length})</p>
        {data.emails.map((e, i) => (
          <Row key={i} k={new Date(e.sentAt).toLocaleDateString("en-AU")} v={e.subject} />
        ))}
      </div>
    </div>
  )
}
