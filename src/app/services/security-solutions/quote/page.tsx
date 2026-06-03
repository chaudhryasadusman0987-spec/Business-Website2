"use client"

// SECURITY SOLUTIONS QUOTE WIZARD
// Ported from cctv_quote_form_template (1).html
// This handles ALL security solutions, not just CCTV.
// Theme stays GREEN (#0F6E56) per PROJECT.md — the rest of the site is purple.

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  Home,
  Building,
  Factory,
  Building2,
  Zap,
  CalendarDays,
  CalendarRange,
  Compass,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  FileText,
  CircleCheck,
  type LucideIcon,
} from "lucide-react"
import {
  securitySolutions,
  installFee,
  gstRate,
  type SecuritySolution,
} from "@/data/security-solutions"
import { calcCCTVQuote, formatAUD } from "@/lib/formatters"
import { SITE_NAME, SITE_SUFFIX } from "@/data/site"

const fromPrice = (sol: SecuritySolution) =>
  Math.min(...sol.products.map((p) => p.price))

const prices: Record<string, number> = Object.fromEntries(
  securitySolutions.map((s) => [s.id, fromPrice(s)])
)

const propertyTypes = [
  { val: "residential", label: "Residential", sub: "Home & apartments", Icon: Home },
  { val: "commercial", label: "Commercial", sub: "Offices & retail", Icon: Building },
  { val: "industrial", label: "Industrial", sub: "Warehouses & sites", Icon: Factory },
  { val: "strata", label: "Strata / Body Corp", sub: "Multi-unit buildings", Icon: Building2 },
]

const timings = [
  { val: "now", label: "ASAP", sub: "Within this week", Icon: Zap },
  { val: "2weeks", label: "Next 2 weeks", sub: "Planning ahead", Icon: CalendarDays },
  { val: "month", label: "This month", sub: "No rush", Icon: CalendarRange },
  { val: "later", label: "Just exploring", sub: "Getting a price idea", Icon: Compass },
]

function QuoteWizard() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(0)
  const [ptype, setPtype] = useState<string | null>(null)
  const [solutions, setSolutions] = useState<string[]>([])
  const [qty, setQty] = useState<Record<string, number>>({})
  const [timing, setTiming] = useState<string | null>(null)
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    suburb: "",
    source: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Preselect a solution if arriving from a product card (?solution=id)
  useEffect(() => {
    const pre = searchParams.get("solution")
    if (pre && securitySolutions.some((s) => s.id === pre)) {
      setSolutions((prev) => (prev.includes(pre) ? prev : [...prev, pre]))
      setQty((prev) => ({ ...prev, [pre]: prev[pre] ?? 1 }))
    }
  }, [searchParams])

  const toggleSolution = (id: string) => {
    setSolutions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
    setQty((prev) => ({ ...prev, [id]: prev[id] ?? 1 }))
  }

  const changeQty = (id: string, delta: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }))

  const quote = calcCCTVQuote(solutions, qty, prices, installFee, gstRate)
  const selectedSolutions = securitySolutions.filter((s) =>
    solutions.includes(s.id)
  )
  const labelOf = (id: string) =>
    securitySolutions.find((s) => s.id === id)?.name ?? id

  const next = () => {
    if (step === 0 && !ptype) return setError("Please select a property type.")
    if (step === 1 && solutions.length === 0)
      return setError("Please select at least one solution.")
    if (step === 3 && !timing) return setError("Please select a timeframe.")
    setError(null)
    setStep((s) => s + 1)
  }
  const back = () => {
    setError(null)
    setStep((s) => s - 1)
  }

  const submit = async () => {
    if (!form.fname || !form.email || !form.phone)
      return setError("Please fill in all required fields.")
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/quote/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyType: ptype,
          timing,
          items: quote.items.map((i) => ({
            name: labelOf(i.key),
            qty: i.qty,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
          })),
          installFee,
          subtotal: quote.subtotal,
          gst: Math.round(quote.gst),
          total: Math.round(quote.total),
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setSubmitted(true)
    } catch {
      setError("Something went wrong sending your quote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <CircleCheck size={28} className="text-[#0F6E56]" />
        </div>
        <h2 className="text-[20px] font-medium text-[#1a1a2e] mb-2">
          Quote sent successfully!
        </h2>
        <p className="text-[14px] text-gray-500 leading-relaxed">
          Your personalised quote has been emailed to you.
          <br />
          Our team will also follow up within 1 business day.
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] mt-5">
          <ShieldCheck size={13} /> Quote valid for 30 days
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-8 border-b border-gray-200">
        <div className="w-[38px] h-[38px] rounded-[8px] bg-[#0F6E56] flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div className="text-[17px] font-medium text-[#1a1a2e]">
          {SITE_NAME}
          <span className="text-[#0F6E56]"> {SITE_SUFFIX}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-7">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step
                ? "bg-[#5DCAA5]"
                : i === step
                ? "bg-[#0F6E56]"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* STEP 0 — property type */}
      {step === 0 && (
        <Step label="Step 1 of 5" title="What type of property are you securing?">
          <div className="grid grid-cols-2 gap-2.5">
            {propertyTypes.map((p) => (
              <OptionCard
                key={p.val}
                selected={ptype === p.val}
                onClick={() => setPtype(p.val)}
                Icon={p.Icon}
                label={p.label}
                sub={p.sub}
              />
            ))}
          </div>
        </Step>
      )}

      {/* STEP 1 — solutions */}
      {step === 1 && (
        <Step label="Step 2 of 5" title="Which security solutions do you need?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {securitySolutions.map((s) => (
              <CheckItem
                key={s.id}
                selected={solutions.includes(s.id)}
                onClick={() => toggleSolution(s.id)}
                label={s.name}
                price={`From ${formatAUD(fromPrice(s))}`}
              />
            ))}
          </div>
        </Step>
      )}

      {/* STEP 2 — quantities */}
      {step === 2 && (
        <Step label="Step 3 of 5" title="How many of each do you need?">
          {selectedSolutions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border border-gray-200 rounded-[8px] px-3.5 py-2.5 mb-2"
            >
              <div>
                <div className="text-[13px] font-medium text-[#1a1a2e]">
                  {s.name}
                </div>
                <div className="text-[11px] text-gray-500">
                  From {formatAUD(fromPrice(s))} each
                </div>
              </div>
              <div className="flex items-center gap-2">
                <QtyBtn onClick={() => changeQty(s.id, -1)} Icon={Minus} />
                <span className="text-[14px] font-medium min-w-[20px] text-center text-[#1a1a2e]">
                  {qty[s.id] ?? 1}
                </span>
                <QtyBtn onClick={() => changeQty(s.id, 1)} Icon={Plus} />
              </div>
            </div>
          ))}
        </Step>
      )}

      {/* STEP 3 — timing */}
      {step === 3 && (
        <Step label="Step 4 of 5" title="When are you looking to install?">
          <div className="grid grid-cols-2 gap-2.5">
            {timings.map((t) => (
              <OptionCard
                key={t.val}
                selected={timing === t.val}
                onClick={() => setTiming(t.val)}
                Icon={t.Icon}
                label={t.label}
                sub={t.sub}
              />
            ))}
          </div>
        </Step>
      )}

      {/* STEP 4 — contact + summary */}
      {step === 4 && (
        <Step label="Step 5 of 5" title="Your details & instant quote">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="First name" value={form.fname} placeholder="John"
              onChange={(v) => setForm({ ...form, fname: v })} />
            <Field label="Last name" value={form.lname} placeholder="Smith"
              onChange={(v) => setForm({ ...form, lname: v })} />
          </div>
          <Field label="Email address" type="email" value={form.email}
            placeholder="john@example.com.au"
            onChange={(v) => setForm({ ...form, email: v })} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Phone number" type="tel" value={form.phone}
              placeholder="04xx xxx xxx"
              onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Suburb / Postcode" value={form.suburb}
              placeholder="Brisbane, 4000"
              onChange={(v) => setForm({ ...form, suburb: v })} />
          </div>
          <div className="mb-4">
            <label className="text-[12px] text-gray-500 block mb-1">
              How did you hear about us?
            </label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-[14px] text-[#1a1a2e] bg-white"
            >
              <option value="">Select an option</option>
              <option>Google</option>
              <option>Social Media</option>
              <option>Referral</option>
              <option>Other</option>
            </select>
          </div>

          {/* Live summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-[12px] p-5 mb-3">
            <h3 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-3">
              Quote summary
            </h3>
            {quote.items.map((i) => (
              <Line key={i.key} left={`${labelOf(i.key)} × ${i.qty}`}
                right={formatAUD(i.lineTotal)} />
            ))}
            <Line left="Installation & labour" right={formatAUD(installFee)} />
            <Line muted left="Subtotal (ex. GST)" right={formatAUD(quote.subtotal)} />
            <Line muted left="GST (10%)" right={formatAUD(Math.round(quote.gst))} />
            <div className="flex justify-between text-[16px] font-medium text-[#1a1a2e] pt-2.5">
              <span>Total (AUD)</span>
              <span>{formatAUD(Math.round(quote.total))}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] mt-3">
              <ShieldCheck size={13} /> Valid 30 days · GST included
            </span>
          </div>
        </Step>
      )}

      {error && <p className="text-[12px] text-[#A32D2D] mt-1.5">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-2.5 mt-6">
        {step > 0 && (
          <button
            onClick={back}
            className="px-4 py-2.5 border border-gray-300 rounded-[8px] text-gray-500 text-[14px] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] text-white text-[14px] font-medium rounded-[8px] transition-colors"
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] disabled:opacity-60 text-white text-[14px] font-medium rounded-[8px] transition-colors"
          >
            <FileText size={16} />{" "}
            {submitting ? "Sending…" : "Generate My Quote & Send Email"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Small presentational helpers ---- */

function Step({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-[#0F6E56] uppercase tracking-[0.06em] mb-1.5">
        {label}
      </div>
      <div className="text-[20px] font-medium text-[#1a1a2e] mb-6 leading-snug">
        {title}
      </div>
      {children}
    </div>
  )
}

function OptionCard({
  selected,
  onClick,
  Icon,
  label,
  sub,
}: {
  selected: boolean
  onClick: () => void
  Icon: LucideIcon
  label: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-center rounded-[12px] p-4 transition-colors ${
        selected
          ? "border-2 border-[#0F6E56] bg-[#E1F5EE]"
          : "border border-gray-200 bg-white hover:border-[#5DCAA5]"
      }`}
    >
      <Icon size={26} className="text-[#0F6E56] mx-auto mb-2" />
      <div className="text-[13px] font-medium text-[#1a1a2e]">{label}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>
    </button>
  )
}

function CheckItem({
  selected,
  onClick,
  label,
  price,
}: {
  selected: boolean
  onClick: () => void
  label: string
  price: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left transition-colors ${
        selected
          ? "border-[1.5px] border-[#0F6E56] bg-[#E1F5EE]"
          : "border border-gray-200 bg-white hover:border-[#5DCAA5]"
      }`}
    >
      <ShieldCheck size={18} className="text-[#0F6E56] flex-shrink-0" />
      <span>
        <span className="block text-[13px] font-medium text-[#1a1a2e]">
          {label}
        </span>
        <span className="block text-[11px] text-gray-500">{price}</span>
      </span>
    </button>
  )
}

function QtyBtn({
  onClick,
  Icon,
}: {
  onClick: () => void
  Icon: LucideIcon
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#1a1a2e] hover:bg-gray-50 transition-colors"
    >
      <Icon size={14} />
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="mb-4">
      <label className="text-[12px] text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-[14px] text-[#1a1a2e] bg-white"
      />
    </div>
  )
}

function Line({
  left,
  right,
  muted,
}: {
  left: string
  right: string
  muted?: boolean
}) {
  return (
    <div
      className={`flex justify-between py-1 border-b border-gray-200 last:border-0 ${
        muted ? "text-[12px] text-gray-500" : "text-[13px] text-[#1a1a2e]"
      }`}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  )
}

export default function SecurityQuotePage() {
  return (
    <main className="bg-white min-h-screen">
      <Suspense fallback={null}>
        <QuoteWizard />
      </Suspense>
    </main>
  )
}
