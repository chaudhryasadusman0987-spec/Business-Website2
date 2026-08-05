"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Check, Upload, Phone } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import type { RentalVehicle } from "@/data/car-rental"
import { SITE_PHONE } from "@/data/site"

interface Props {
  vehicle: RentalVehicle | null
  onClose: () => void
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  licenceNumber: "",
  dob: "",
  address: "",
  phone: "",
  email: "",
  paymentMethod: "direct-deposit",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardName: "",
  authorise: false,
}

const STEPS = ["details", "apply", "payment"] as const
type View = (typeof STEPS)[number]

/** Keep in sync with MAX_ATTACHMENT_BYTES in /api/rental-application. */
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

export default function VehicleModal({ vehicle, onClose }: Props) {
  const [view, setView] = useState<View>("details")
  const [activeImg, setActiveImg] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [licenceFront, setLicenceFront] = useState<File | null>(null)
  const [licenceBack, setLicenceBack] = useState<File | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset every field when a different vehicle is opened.
  useEffect(() => {
    setView("details")
    setActiveImg(0)
    setSubmitted(false)
    setForm(EMPTY_FORM)
    setErrors({})
    setLicenceFront(null)
    setLicenceBack(null)
  }, [vehicle?.id])

  // Lock body scroll while the modal is open.
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onClose])

  if (!vehicle) return null

  const v = vehicle
  const imgs = v.images.length > 0 ? v.images : [v.image]

  const inp =
    "w-full border border-[#e8e8f0] rounded-[10px] h-[48px] px-4 text-[14px] focus:border-[#7f85f7] outline-none transition-colors"
  const lbl =
    "block text-[11px] font-semibold text-[#666880] uppercase tracking-wider mb-1.5"
  const err = "text-red-500 text-[11px] mt-1"

  const set = (k: keyof typeof EMPTY_FORM, val: string | boolean) =>
    setForm((f) => ({ ...f, [k]: val }))

  const validateApply = () => {
    const e: Record<string, string> = {}
    if (!form.firstName) e.firstName = "Required"
    if (!form.lastName) e.lastName = "Required"
    if (!form.licenceNumber) e.licenceNumber = "Required"
    if (!form.dob) e.dob = "Required"
    if (!form.address) e.address = "Required"
    if (!form.phone) e.phone = "Required"
    if (!form.email) e.email = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePayment = () => {
    const e: Record<string, string> = {}
    if (!form.cardNumber) e.cardNumber = "Required"
    if (!form.cardExpiry) e.cardExpiry = "Required"
    if (!form.cardCvv) e.cardCvv = "Required"
    if (!form.cardName) e.cardName = "Required"
    if (!form.authorise) e.authorise = "You must agree"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validatePayment()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, val]) => fd.append(k, String(val)))
      fd.append("vehicleId", v.id)
      fd.append("vehicleName", v.name)
      fd.append("vehicleRego", v.rego)
      if (licenceFront) fd.append("licenceFront", licenceFront)
      if (licenceBack) fd.append("licenceBack", licenceBack)

      await fetch("/api/rental-application", { method: "POST", body: fd })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.indexOf(view)

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${v.name} — rental details`}
    >
      <div
        className="modal-panel bg-white w-full lg:max-w-[960px] rounded-t-[20px] lg:rounded-[20px] max-h-[96vh] lg:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f8] flex-shrink-0">
          <div>
            <h2 className="font-bold text-[17px] text-[#1a1a2e]">{v.name}</h2>
            <p className="text-[12px] text-[#9496a8]">
              Rego: {v.rego} · {v.type}
            </p>
          </div>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2 mr-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    view === s && !submitted
                      ? "bg-[#7f85f7] text-white"
                      : submitted || i < stepIndex
                        ? "bg-[#0f6e56] text-white"
                        : "bg-[#f0f0f8] text-[#9496a8]"
                  }`}
                >
                  {submitted || i < stepIndex ? <Check size={10} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      submitted || i < stepIndex ? "bg-[#7f85f7]" : "bg-[#e8e8f0]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#f0f0f8] flex items-center justify-center hover:bg-[#1a1a2e] hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ═══ VIEW 1 — DETAILS ═══ */}
          {view === "details" && !submitted && (
            <div className="view-in flex flex-col lg:flex-row h-full">
              {/* LEFT — image gallery */}
              <div className="lg:w-[52%] bg-[#f8f8ff] flex flex-col">
                <div className="relative h-[240px] lg:h-[320px] overflow-hidden bg-[#eeeeff]">
                  <ImageWithFallback
                    key={imgs[activeImg]}
                    src={imgs[activeImg]}
                    alt={v.imageAlt}
                    fill
                    className="object-cover"
                    fallbackIcon="Car"
                    fallbackBg="#eeeeff"
                    placeholderText="Photo coming soon"
                  />

                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg((i) => Math.max(i - 1, 0))}
                        disabled={activeImg === 0}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 hover:bg-[#7f85f7] hover:text-white transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImg((i) => Math.min(i + 1, imgs.length - 1))
                        }
                        disabled={activeImg === imgs.length - 1}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center disabled:opacity-30 hover:bg-[#7f85f7] hover:text-white transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] px-2.5 py-1 rounded-full">
                    {activeImg + 1} / {imgs.length}
                  </div>

                  {v.available && (
                    <div className="absolute top-3 left-3 bg-[#0f6e56] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Available
                    </div>
                  )}
                </div>

                {imgs.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {imgs.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImg(i)}
                        aria-label={`View photo ${i + 1}`}
                        className={`relative flex-shrink-0 w-[72px] h-[52px] rounded-[8px] overflow-hidden border-2 transition-all ${
                          activeImg === i
                            ? "border-[#7f85f7]"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${v.name} view ${i + 1}`}
                          fill
                          className="object-cover"
                          fallbackIcon="Car"
                          fallbackBg="#eeeeff"
                          placeholderText=""
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — vehicle details */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#7f85f7] text-white w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                      {v.number}
                    </span>
                    <span className="bg-[#eeedfe] text-[#7f85f7] text-[12px] font-semibold px-3 py-1 rounded-full">
                      {v.type}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      ["Make", v.make],
                      ["Model", v.model],
                      ["Year", String(v.year)],
                      ["Type", v.type],
                      ["Registration", v.rego],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2.5 border-b border-[#f0f0f8]"
                      >
                        <span className="text-[12px] font-semibold text-[#9496a8] uppercase tracking-wider">
                          {label}
                        </span>
                        <span className="text-[14px] font-medium text-[#1a1a2e]">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#f8f8ff] rounded-[14px] p-4 mb-4">
                    <p className="text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider mb-3">
                      Rental Terms
                    </p>
                    <div className="space-y-2">
                      {[
                        ["Payment", "Weekly in advance"],
                        ["Minimum term", "4 weeks"],
                        ["Bond", "Refunded at the end"],
                        ["Insurance excess", "$1,300 AUD"],
                        ["Roadside assistance", "Included"],
                        ["Maintenance", "Included"],
                      ].map(([k, val]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-[12px] text-[#666]">{k}</span>
                          <span className="text-[12px] font-semibold text-[#1a1a2e]">
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#eeedfe] rounded-[10px] p-3 mb-2">
                    <p className="text-[12px] text-[#534ab7] font-medium text-center">
                      Weekly rate confirmed when you contact us. Fill the
                      application to get started.
                    </p>
                  </div>
                </div>

                <div className="p-5 border-t border-[#f0f0f8] flex flex-col gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => setView("apply")}
                    className="w-full bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] transition-colors"
                  >
                    Apply for this car
                  </button>
                  <a
                    href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                    className="flex items-center justify-center gap-2 border-2 border-[#e8e8f0] text-[#1a1a2e] rounded-[10px] h-[46px] font-semibold text-[14px] hover:border-[#7f85f7] hover:text-[#7f85f7] transition-all"
                  >
                    <Phone size={15} />
                    Call {SITE_PHONE}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ═══ VIEW 2 — APPLICATION ═══ */}
          {view === "apply" && !submitted && (
            <div className="view-in p-6 max-w-[640px] mx-auto">
              <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-1">
                Your Details
              </h3>
              <p className="text-[13px] text-[#9496a8] mb-6">
                Fill in your personal details. We will email you the rental quote
                with weekly pricing.
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="firstName">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      className={inp}
                      placeholder="John"
                    />
                    {errors.firstName && <p className={err}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className={lbl} htmlFor="lastName">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className={inp}
                      placeholder="Smith"
                    />
                    {errors.lastName && <p className={err}>{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="licenceNumber">
                      Driving Licence No. *
                    </label>
                    <input
                      id="licenceNumber"
                      value={form.licenceNumber}
                      onChange={(e) => set("licenceNumber", e.target.value)}
                      className={inp}
                      placeholder="123456789"
                    />
                    {errors.licenceNumber && (
                      <p className={err}>{errors.licenceNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className={lbl} htmlFor="dob">
                      Date of Birth *
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) => set("dob", e.target.value)}
                      className={inp}
                    />
                    {errors.dob && <p className={err}>{errors.dob}</p>}
                  </div>
                </div>

                <div>
                  <label className={lbl} htmlFor="address">
                    Address *
                  </label>
                  <input
                    id="address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className={inp}
                    placeholder="123 Main St, Brisbane QLD 4000"
                  />
                  {errors.address && <p className={err}>{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="phone">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={inp}
                      placeholder="04XX XXX XXX"
                    />
                    {errors.phone && <p className={err}>{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={lbl} htmlFor="email">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inp}
                      placeholder="john@email.com"
                    />
                    {errors.email && <p className={err}>{errors.email}</p>}
                  </div>
                </div>

                {/* Licence upload — a <label htmlFor> opens the hidden file input,
                    so no ref juggling is needed inside the map. */}
                <div>
                  <span className={lbl}>Upload Driving Licence</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "licenceFront",
                        label: "Front",
                        file: licenceFront,
                        setter: setLicenceFront,
                      },
                      {
                        id: "licenceBack",
                        label: "Back",
                        file: licenceBack,
                        setter: setLicenceBack,
                      },
                    ].map(({ id, label, file, setter }) => (
                      <div key={id}>
                        <input
                          id={id}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null
                            // Serverless request bodies are capped, so reject
                            // oversized photos here rather than failing silently.
                            if (f && f.size > MAX_UPLOAD_BYTES) {
                              setErrors((prev) => ({
                                ...prev,
                                [id]: "File must be under 3MB",
                              }))
                              e.target.value = ""
                              setter(null)
                              return
                            }
                            setErrors((prev) => {
                              const next = { ...prev }
                              delete next[id]
                              return next
                            })
                            setter(f)
                          }}
                        />
                        <label
                          htmlFor={id}
                          className={`block w-full border-2 border-dashed rounded-[10px] py-5 text-center cursor-pointer transition-all ${
                            file
                              ? "border-[#0f6e56] bg-[#e1f5ee]"
                              : "border-[#e8e8f0] hover:border-[#7f85f7] bg-[#f9f9ff]"
                          }`}
                        >
                          <Upload
                            size={18}
                            className={`mx-auto mb-1 ${
                              file ? "text-[#0f6e56]" : "text-[#9496a8]"
                            }`}
                          />
                          <span
                            className={`block text-[11px] font-medium px-2 truncate ${
                              file ? "text-[#0f6e56]" : "text-[#9496a8]"
                            }`}
                          >
                            {file ? `✓ ${file.name}` : `${label} of licence`}
                          </span>
                        </label>
                        {errors[id] && <p className={err}>{errors[id]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setView("details")}
                  className="flex-1 border-2 border-[#e8e8f0] text-[#666] rounded-[10px] h-[52px] font-semibold text-[14px] hover:border-[#7f85f7] hover:text-[#7f85f7] transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateApply()) {
                      setErrors({})
                      setView("payment")
                    }
                  }}
                  className="flex-[2] bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] transition-all"
                >
                  Next: Payment →
                </button>
              </div>
            </div>
          )}

          {/* ═══ VIEW 3 — PAYMENT ═══ */}
          {view === "payment" && !submitted && (
            <div className="view-in p-6 max-w-[640px] mx-auto">
              <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-1">
                Payment Details
              </h3>
              <p className="text-[13px] text-[#9496a8] mb-6">
                Your card will be charged weekly for rent and once for the
                security bond. We call you before processing.
              </p>

              <div className="bg-[#eeedfe] rounded-[12px] p-4 mb-5">
                <p className="font-bold text-[13px] text-[#534ab7] mb-2">
                  Vehicle: {v.name} ({v.rego})
                </p>
                <ul className="text-[12px] text-[#534ab7] space-y-1">
                  <li>• Weekly rent paid in advance automatically</li>
                  <li>• Security bond held on card — refunded at end</li>
                  <li>• We confirm pricing before first charge</li>
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl} htmlFor="paymentMethod">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    value={form.paymentMethod}
                    onChange={(e) => set("paymentMethod", e.target.value)}
                    className={`${inp} appearance-none`}
                  >
                    <option value="direct-deposit">
                      Direct Deposit (Bank Transfer)
                    </option>
                    <option value="card">Credit / Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className={lbl} htmlFor="cardNumber">
                    Card Number *
                  </label>
                  <input
                    id="cardNumber"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.cardNumber}
                    onChange={(e) => set("cardNumber", e.target.value)}
                    className={inp}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className={err}>{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="cardExpiry">
                      Expiry *
                    </label>
                    <input
                      id="cardExpiry"
                      autoComplete="off"
                      value={form.cardExpiry}
                      onChange={(e) => set("cardExpiry", e.target.value)}
                      className={inp}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.cardExpiry && <p className={err}>{errors.cardExpiry}</p>}
                  </div>
                  <div>
                    <label className={lbl} htmlFor="cardCvv">
                      CVV *
                    </label>
                    <input
                      id="cardCvv"
                      type="password"
                      autoComplete="off"
                      value={form.cardCvv}
                      onChange={(e) => set("cardCvv", e.target.value)}
                      className={inp}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cardCvv && <p className={err}>{errors.cardCvv}</p>}
                  </div>
                </div>

                <div>
                  <label className={lbl} htmlFor="cardName">
                    Name on Card *
                  </label>
                  <input
                    id="cardName"
                    autoComplete="off"
                    value={form.cardName}
                    onChange={(e) => set("cardName", e.target.value)}
                    className={inp}
                    placeholder="JOHN SMITH"
                  />
                  {errors.cardName && <p className={err}>{errors.cardName}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer bg-[#f9f9ff] border border-[#e8e8f0] rounded-[10px] p-4 hover:border-[#7f85f7] transition-colors">
                  <input
                    type="checkbox"
                    checked={form.authorise}
                    onChange={(e) => set("authorise", e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-[#7f85f7] w-4 h-4"
                  />
                  <span className="text-[12px] text-[#444] leading-relaxed">
                    I authorise Pak Oz Rentals to charge this payment method
                    weekly for rent and once for the security bond. I confirm I
                    have read and agree to the rental terms.
                  </span>
                </label>
                {errors.authorise && (
                  <p className={`${err} -mt-2`}>{errors.authorise}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setView("apply")}
                  className="flex-1 border-2 border-[#e8e8f0] text-[#666] rounded-[10px] h-[52px] font-semibold text-[14px] hover:border-[#7f85f7] hover:text-[#7f85f7] transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] disabled:bg-[#b0bec5] transition-all"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </div>

              <p className="text-[11px] text-[#9496a8] text-center mt-4">
                We call you before any payment is processed.
              </p>
            </div>
          )}

          {/* ═══ SUCCESS ═══ */}
          {submitted && (
            <div className="view-in p-10 text-center max-w-[500px] mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#e1f5ee] flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-[#0f6e56]" />
              </div>
              <h3 className="font-bold text-[22px] text-[#1a1a2e] mb-3">
                Application Received!
              </h3>
              <p className="text-[#555] text-[14px] leading-relaxed mb-4">
                We have emailed your rental quote to{" "}
                <strong>{form.email}</strong>. We will call you on{" "}
                <strong>{form.phone}</strong> within 2 hours to confirm
                availability and pricing.
              </p>
              <div className="bg-[#f8f8ff] rounded-[14px] p-4 text-left text-[13px] text-[#444]">
                <p className="font-semibold text-[#1a1a2e] mb-2">
                  Vehicle requested:
                </p>
                <p>
                  #{v.number} — {v.name}
                </p>
                <p className="text-[#9496a8]">Rego: {v.rego}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full bg-[#0d0d1a] text-white rounded-[10px] h-[46px] font-semibold text-[14px] hover:bg-[#7f85f7] transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
