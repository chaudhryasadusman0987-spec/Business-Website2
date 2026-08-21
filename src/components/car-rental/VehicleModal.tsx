"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Check, Upload, Phone } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import {
  galleryImages,
  vehicleAlt,
  type RentalVehicle,
} from "@/lib/vehicles"
import { getColourHex } from "@/lib/colourHex"
import {
  DEFAULT_LICENCE_STATE,
  LICENCE_RULES,
  UPLOAD_ACCEPT,
  validateDob,
  validateEmail,
  validateLicence,
  validateMobile,
  validateRequired,
  validateUpload,
  type FieldResult,
} from "@/lib/rental-validation"
import {
  BANK_NAME,
  BANK_ACCOUNT_NAME,
  BANK_BSB,
  BANK_ACCOUNT,
  BANK_PAYID,
  SITE_PHONE,
} from "@/data/site"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

interface Props {
  vehicle: RentalVehicle | null
  onClose: () => void
  /** Step to open on. "Get on Rent" jumps straight past the photo gallery. */
  initialView?: "details" | "apply"
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  licenceNumber: "",
  licenceState: DEFAULT_LICENCE_STATE,
  dob: "",
  address: "",
  phone: "",
  email: "",
}

type FormState = typeof EMPTY_FORM

const STEPS = ["details", "apply", "payment"] as const
type View = (typeof STEPS)[number]

const STEP_LABELS: Record<View, string> = {
  details: "Details",
  apply: "Your Info",
  payment: "Payment",
}

/**
 * Format rules for the application step, in display order. Each returns a
 * FieldResult; the tidied `value` is written back to the form so what gets
 * submitted is normalised (mobile spaced as 04XX XXX XXX, licence upper-cased).
 */
const APPLY_CHECKS: {
  field: keyof FormState
  check: (form: FormState) => FieldResult
}[] = [
  { field: "firstName", check: (f) => validateRequired(f.firstName, "First name") },
  { field: "lastName", check: (f) => validateRequired(f.lastName, "Last name") },
  {
    field: "licenceNumber",
    check: (f) => validateLicence(f.licenceNumber, f.licenceState),
  },
  { field: "dob", check: (f) => validateDob(f.dob) },
  { field: "address", check: (f) => validateRequired(f.address, "Address", 6) },
  { field: "phone", check: (f) => validateMobile(f.phone) },
  { field: "email", check: (f) => validateEmail(f.email) },
]

export default function VehicleModal({
  vehicle,
  onClose,
  initialView = "details",
}: Props) {
  const [view, setView] = useState<View>(initialView)
  const [activeImg, setActiveImg] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  // Direct-deposit step: the customer transfers first, then tells us they have.
  const [payConfirmed, setPayConfirmed] = useState(false)
  const [paySubmitting, setPaySubmitting] = useState(false)
  const [payError, setPayError] = useState("")
  // Card payment: which method the customer picked, and the Stripe PaymentIntent
  // for the card path once it has been created.
  const [payMethod, setPayMethod] = useState<"card" | "deposit" | null>(null)
  // Optional: pay the 2-week bond online alongside the first week's rent.
  // Unchecked by default — the bond is then collected in person at pickup.
  const [includeBond, setIncludeBond] = useState(false)
  const [clientSecret, setClientSecret] = useState("")
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState("")
  const [licenceFront, setLicenceFront] = useState<File | null>(null)
  const [licenceBack, setLicenceBack] = useState<File | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset every field when a different vehicle is opened.
  useEffect(() => {
    setView(initialView)
    setActiveImg(0)
    setSubmitted(false)
    setForm(EMPTY_FORM)
    setErrors({})
    setLicenceFront(null)
    setLicenceBack(null)
    setPayConfirmed(false)
    setPaySubmitting(false)
    setPayError("")
    setPayMethod(null)
    setIncludeBond(false)
    setClientSecret("")
    setStripeError("")
  }, [vehicle?.id, initialView])

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
  // Main photo first, then the gallery. Always at least one entry so the
  // carousel renders its "photo coming soon" placeholder rather than nothing.
  const gallery = galleryImages(v)
  const imgs = gallery.length > 0 ? gallery : [""]
  const weeklyLabel =
    v.weeklyRate > 0 ? `$${v.weeklyRate.toLocaleString("en-AU")}` : null
  const bondLabel = v.bond > 0 ? `$${v.bond.toLocaleString("en-AU")}` : null

  // What the customer actually transfers up front. A vehicle with no published
  // rate falls back to 0, which the payment step renders as "TBC" rather than
  // asking anyone to deposit $0.00.
  const weekly = v.weeklyRate || 0
  const bond = weekly * 2
  // Rent-only by default. The bond is added only when the customer opts in.
  const totalFirst = includeBond ? weekly + bond : weekly

  // The specification grid, in reading order down two columns. Blanks render
  // as an em dash rather than an empty cell — a car the owner has not filled
  // in yet still lines up with the rest.
  const specs: [string, string][] = [
    ["VARIANT", v.variant],
    ["FUEL TYPE", v.fuelType],
    ["ENGINE", v.engine],
    ["TRANSMISSION", v.transmission],
    ["SEATS", v.seats > 0 ? `${v.seats} Seats` : ""],
    ["REGISTRATION", v.rego],
    ["YEAR", String(v.year)],
    ["TYPE", v.type],
  ]

  // Licence guidance follows the selected state, so the customer is told the
  // expected format before they get an error rather than after.
  const licenceRule =
    LICENCE_RULES.find((r) => r.code === form.licenceState) ?? LICENCE_RULES[0]
  const licenceHint = `${licenceRule.code} — ${licenceRule.hint}`
  const licencePlaceholder =
    { QLD: "123456789", NSW: "12AB3456", VIC: "0123456789", SA: "A123BC", WA: "1234567", TAS: "AB12345", ACT: "1234567", NT: "123456" }[
      form.licenceState
    ] ?? "Licence number"

  const inp =
    "w-full border border-[#e8e8f0] rounded-[10px] h-[48px] px-4 text-[14px] focus:border-[#7f85f7] outline-none transition-colors"
  const lbl =
    "block text-[11px] font-semibold text-[#666880] uppercase tracking-wider mb-1.5"
  const err = "text-red-500 text-[11px] mt-1"

  // Editing a field clears its error: keeping a red message under a box the
  // customer is actively fixing just nags them.
  const set = (k: keyof FormState, val: string | boolean) => {
    setForm((f) => ({ ...f, [k]: val }))
    setErrors((prev) => {
      if (!prev[k]) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  /** Re-check one field on blur, so mistakes surface before the Next click. */
  const checkField = (field: keyof FormState) => {
    const entry = APPLY_CHECKS.find((c) => c.field === field)
    if (!entry) return
    // An empty field the customer has not filled in yet should not be scolded.
    if (!String(form[field] ?? "").trim()) return
    const result = entry.check(form)
    setErrors((prev) => {
      const next = { ...prev }
      if (result.ok) {
        delete next[field]
      } else {
        next[field] = result.error
      }
      return next
    })
    if (result.ok && result.value !== form[field]) {
      setForm((f) => ({ ...f, [field]: result.value }))
    }
  }

  const validateApply = () => {
    const e: Record<string, string> = {}
    const tidied: Partial<FormState> = {}

    for (const { field, check } of APPLY_CHECKS) {
      const result: FieldResult = check(form)
      if (result.ok) tidied[field] = result.value as never
      else e[field] = result.error
    }

    // Licence photos are optional — the owner can chase them — but a file
    // rejected on selection must not be silently dropped by this rebuild of
    // the error map.
    if (errors.licenceFront) e.licenceFront = errors.licenceFront
    if (errors.licenceBack) e.licenceBack = errors.licenceBack

    if (Object.keys(tidied).length) setForm((f) => ({ ...f, ...tidied }))
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /**
   * Direct deposit only — no card details are collected anywhere in this flow.
   * The customer transfers first and this posts their claim, which the owner
   * verifies against the bank account before releasing the vehicle.
   */
  const handleSubmit = async () => {
    if (!payConfirmed) {
      setPayError("Please confirm you have made the transfer.")
      return
    }
    setPaySubmitting(true)
    setPayError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, val]) => fd.append(k, String(val)))
      fd.append("vehicleId", v.id)
      fd.append("vehicleName", v.name)
      fd.append("vehicleRego", v.rego)
      fd.append("paymentMethod", "direct-deposit")
      fd.append("weeklyRent", String(weekly))
      fd.append("bondAmount", includeBond ? String(bond) : "0")
      fd.append("bondPaidOnline", String(includeBond))
      fd.append("totalAmount", String(totalFirst))
      fd.append("paymentStatus", "transfer-claimed")
      if (licenceFront) fd.append("licenceFront", licenceFront)
      if (licenceBack) fd.append("licenceBack", licenceBack)

      const res = await fetch("/api/rental-application", {
        method: "POST",
        body: fd,
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setPayError(`Submission failed. Please call us on ${SITE_PHONE}`)
    } finally {
      setPaySubmitting(false)
    }
  }

  /** Creates the Stripe PaymentIntent for this vehicle/customer and switches
   *  the payment view over to the card form once a client secret comes back. */
  const handleSelectCard = async () => {
    setStripeLoading(true)
    setStripeError("")
    try {
      const res = await fetch("/api/rental-payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: v.id,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          includeBond,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setStripeError(data.error)
        setPayMethod(null)
        return
      }
      setClientSecret(data.clientSecret)
      setPayMethod("card")
    } catch {
      setStripeError(
        "Could not load card payment. Please try direct deposit instead."
      )
    } finally {
      setStripeLoading(false)
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
        className="modal-panel bg-white w-full lg:max-w-[860px] rounded-t-[20px] lg:rounded-[20px] max-h-[96vh] lg:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar — step indicator + close ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f8] flex-shrink-0 bg-white z-10">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const done = submitted || i < stepIndex
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      view === s && !submitted
                        ? "bg-[#7f85f7] text-white"
                        : done
                          ? "bg-[#0f6e56] text-white"
                          : "bg-[#f0f0f8] text-[#9496a8]"
                    }`}
                  >
                    {done ? <Check size={10} /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] hidden sm:block ${
                      view === s && !submitted
                        ? "text-[#7f85f7] font-semibold"
                        : "text-[#9496a8]"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-6 h-px ml-1 ${
                        done ? "bg-[#7f85f7]" : "bg-[#e8e8f0]"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#f0f0f8] flex items-center justify-center hover:bg-[#1a1a2e] hover:text-white transition-all flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ═══ VIEW 1 — DETAILS ═══ */}
          {view === "details" && !submitted && (
            <div className="view-in flex flex-col">
              {/* A — hero photo, full width */}
              <div
                className="relative w-full bg-[#0d0d1a] overflow-hidden"
                style={{ height: "clamp(220px, 40vw, 400px)" }}
              >
                <ImageWithFallback
                  key={imgs[activeImg]}
                  src={imgs[activeImg]}
                  alt={vehicleAlt(v)}
                  fill
                  className="object-cover object-center"
                  fallbackIcon="Car"
                  fallbackBg="#0d0d1a"
                  placeholderText="Photo coming soon"
                />

                {/* Keeps the name legible over a bright photo. */}
                <div className="absolute bottom-0 left-0 right-0 h-[110px] bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-5 right-16">
                  <p className="text-[#a9adfa] text-[11px] font-bold uppercase tracking-wider mb-1">
                    {v.sortOrder > 0 ? `#${v.sortOrder} · ` : ""}
                    {v.type}
                  </p>
                  <h2 className="text-white font-extrabold text-[18px] lg:text-[22px] leading-tight drop-shadow-lg">
                    {v.name}
                  </h2>
                  <p className="text-white/60 text-[12px] mt-0.5">
                    Rego: {v.rego}
                  </p>
                </div>

                {v.available && (
                  <div className="absolute top-4 left-4 bg-[#0f6e56] text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Available
                  </div>
                )}

                {/* The weekly rate still has to be on this screen — it is the
                    number the visitor came for and the one the owner sets. */}
                <div className="absolute top-4 right-4 bg-white/95 rounded-full px-3.5 py-1.5 shadow-lg">
                  {weeklyLabel ? (
                    <p className="text-[#1a1a2e] leading-none">
                      <span className="font-extrabold text-[16px] text-[#534ab7]">
                        {weeklyLabel}
                      </span>
                      <span className="text-[11px] text-[#666880] ml-1">
                        / week
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-bold text-[#534ab7] leading-none">
                      Ask us for the rate
                    </p>
                  )}
                </div>

                {imgs.length > 1 && (
                  <>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded-full">
                      {activeImg + 1} / {imgs.length} photos
                    </div>
                    {activeImg > 0 && (
                      <button
                        onClick={() => setActiveImg((i) => Math.max(i - 1, 0))}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    {activeImg < imgs.length - 1 && (
                      <button
                        onClick={() =>
                          setActiveImg((i) => Math.min(i + 1, imgs.length - 1))
                        }
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* B — thumbnail strip */}
              {imgs.length > 1 && (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-[#f8f8ff] border-b border-[#eeeeff]">
                  {imgs.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`View photo ${i + 1}`}
                      className={`relative flex-shrink-0 w-[80px] h-[56px] rounded-[8px] overflow-hidden border-2 transition-all ${
                        activeImg === i
                          ? "border-[#7f85f7] opacity-100 scale-105"
                          : "border-transparent opacity-50 hover:opacity-80"
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

              {/* C + D — colour note and swatches */}
              {v.colours.length > 0 && (
                <>
                  <p className="text-[11px] text-[#9496a8] italic px-5 pt-4 pb-1">
                    Vehicle colours may vary
                  </p>
                  <div className="px-5 pb-4">
                    <p className="text-[10px] font-bold text-[#9496a8] uppercase tracking-wider mb-2">
                      Available Colours
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {v.colours.map((colour) => (
                        <span
                          key={colour}
                          className="text-[12px] font-medium text-[#444] bg-[#f7f7f7] border border-[#e8e8f0] rounded-full px-3 py-1 flex items-center gap-1.5"
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-[#e0e0e0]"
                            style={{ background: getColourHex(colour) }}
                          />
                          {colour}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* E — specifications */}
              <div className="mx-4 mt-4 mb-4 border border-[#e8e8f0] rounded-[14px] overflow-hidden">
                <div className="bg-[#f8f8ff] px-5 py-3 border-b border-[#e8e8f0]">
                  <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider">
                    Vehicle Specifications
                  </p>
                </div>

                <div className="grid grid-cols-2">
                  {specs.map(([label, value], i) => (
                    <div
                      key={label}
                      className={`px-5 py-4 ${
                        i % 2 === 0 ? "border-r border-[#e8e8f0]" : ""
                      } ${i < specs.length - 2 ? "border-b border-[#e8e8f0]" : ""}`}
                    >
                      <p className="text-[10px] font-bold text-[#9496a8] uppercase tracking-wider mb-1.5">
                        {label}
                      </p>
                      <p className="font-bold text-[14px] text-[#1a1a2e] leading-tight">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* F — rental terms */}
              <div className="mx-4 mb-6 bg-[#f8f8ff] rounded-[14px] p-5">
                <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-4">
                  Rental Terms
                </p>
                <div className="grid grid-cols-2 gap-y-4">
                  {[
                    ["💰 Payment", "Weekly in advance"],
                    ["📅 Minimum", "4 weeks"],
                    // The real bond shows once the owner has set one.
                    [
                      "🔒 Bond",
                      bondLabel ? `${bondLabel}, refunded` : "Refundable at end",
                    ],
                    ["🛡️ Excess", "$1,300 AUD"],
                    ["🚗 Roadside", "Included"],
                    ["🔧 Service", "Included"],
                  ].map(([k, val]) => (
                    <div key={k}>
                      <p className="text-[11px] text-[#9496a8]">{k}</p>
                      <p className="text-[13px] font-semibold text-[#1a1a2e] mt-0.5">
                        {val}
                      </p>
                    </div>
                  ))}
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
                      onBlur={() => checkField("firstName")}
                      autoComplete="given-name"
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
                      onBlur={() => checkField("lastName")}
                      autoComplete="family-name"
                      className={inp}
                      placeholder="Smith"
                    />
                    {errors.lastName && <p className={err}>{errors.lastName}</p>}
                  </div>
                </div>

                {/* Licence state drives which number format is accepted —
                    Australia has no national format. */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="licenceState">
                      Licence Issued In *
                    </label>
                    <select
                      id="licenceState"
                      value={form.licenceState}
                      onChange={(e) => {
                        set("licenceState", e.target.value)
                        // The number is checked against the new state's rule.
                        setErrors((prev) => {
                          const next = { ...prev }
                          delete next.licenceNumber
                          return next
                        })
                      }}
                      className={`${inp} appearance-none`}
                    >
                      {LICENCE_RULES.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl} htmlFor="licenceNumber">
                      Driving Licence No. *
                    </label>
                    <input
                      id="licenceNumber"
                      value={form.licenceNumber}
                      onChange={(e) => set("licenceNumber", e.target.value)}
                      onBlur={() => checkField("licenceNumber")}
                      className={inp}
                      placeholder={licencePlaceholder}
                      inputMode={
                        form.licenceState === "QLD" ||
                        form.licenceState === "VIC" ||
                        form.licenceState === "WA" ||
                        form.licenceState === "ACT"
                          ? "numeric"
                          : "text"
                      }
                    />
                    {errors.licenceNumber ? (
                      <p className={err}>{errors.licenceNumber}</p>
                    ) : (
                      <p className="text-[10px] text-[#9496a8] mt-1">
                        {licenceHint}
                      </p>
                    )}
                  </div>
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
                    onBlur={() => checkField("dob")}
                    className={inp}
                  />
                  {errors.dob && <p className={err}>{errors.dob}</p>}
                </div>

                <div>
                  <label className={lbl} htmlFor="address">
                    Address *
                  </label>
                  <input
                    id="address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    onBlur={() => checkField("address")}
                    autoComplete="street-address"
                    className={inp}
                    placeholder="123 Main St, Brisbane QLD 4000"
                  />
                  {errors.address && <p className={err}>{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl} htmlFor="phone">
                      Mobile *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      onBlur={() => checkField("phone")}
                      className={inp}
                      placeholder="0412 345 678"
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
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      onBlur={() => checkField("email")}
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
                  <p className="text-[11px] text-[#9496a8] -mt-1 mb-2">
                    JPG, PNG, WEBP, HEIC or PDF · up to 3MB each
                  </p>
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
                          accept={UPLOAD_ACCEPT}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null
                            // Check the format and size here rather than
                            // letting a bad file fail silently at the server:
                            // serverless request bodies are capped, and a
                            // .docx "photo" would just never arrive.
                            const result = f ? validateUpload(f) : null
                            if (result && !result.ok) {
                              setErrors((prev) => ({
                                ...prev,
                                [id]: result.error,
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

          {/* ═══ VIEW 3a — PAYMENT METHOD SELECTOR ═══ */}
          {view === "payment" && !submitted && !payMethod && (
            <div className="view-in p-6 max-w-[600px] mx-auto">
              <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-1">
                Choose Payment Method
              </h3>
              <p className="text-[13px] text-[#9496a8] mb-5">
                Your first payment covers 1 week&apos;s rent. You can also add
                the security bond now, or pay it in person when you pick up
                the vehicle.
              </p>

              {/* Bond toggle card */}
              <div className="bg-[#f8f8ff] border border-[#e8e8f0] rounded-[14px] p-4 mb-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBond}
                    onChange={(e) => setIncludeBond(e.target.checked)}
                    className="mt-1 flex-shrink-0 accent-[#7f85f7] w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[14px] text-[#1a1a2e]">
                      Also pay security bond now
                      <span className="text-[#0f6e56] font-bold ml-2">
                        +${bond.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-[12px] text-[#9496a8] mt-1 leading-relaxed">
                      Optional. 2 weeks rent as a refundable bond. If you skip
                      this now, we will collect the bond in person when you
                      pick up the vehicle — no online payment required today.
                    </p>
                  </div>
                </label>
              </div>

              {/* Live total preview */}
              <div className="bg-[#eeedfe] rounded-[12px] p-4 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#534ab7] uppercase tracking-wider">
                    Paying today
                  </p>
                  <p className="text-[11px] text-[#7f85f7] mt-0.5">
                    {includeBond ? "1 week rent + bond" : "1 week rent only"}
                  </p>
                </div>
                <p className="font-extrabold text-[22px] text-[#534ab7]">
                  ${totalFirst.toFixed(2)}
                </p>
              </div>

              {stripeError && (
                <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
                  <p className="text-red-600 text-[13px]">{stripeError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={handleSelectCard}
                  disabled={stripeLoading}
                  className="border-2 border-[#e8e8f0] rounded-[16px] p-5 text-left hover:border-[#7f85f7] transition-all duration-200 disabled:opacity-50"
                >
                  <div className="text-[28px] mb-2">💳</div>
                  <p className="font-bold text-[15px] text-[#1a1a2e] mb-1">
                    Pay by Card
                  </p>
                  <p className="text-[12px] text-[#9496a8] mb-3">
                    Instant. Secure. Visa, Mastercard, Amex.
                  </p>
                  <div className="flex gap-1">
                    {["VISA", "MC", "AMEX"].map((c) => (
                      <span
                        key={c}
                        className="text-[9px] font-bold bg-[#f7f7f7] border border-[#e8e8f0] rounded-[3px] px-1.5 py-0.5 text-[#666]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {stripeLoading && (
                    <p className="text-[11px] text-[#7f85f7] mt-2">Loading...</p>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod("deposit")}
                  className="border-2 border-[#e8e8f0] rounded-[16px] p-5 text-left hover:border-[#7f85f7] transition-all duration-200"
                >
                  <div className="text-[28px] mb-2">🏦</div>
                  <p className="font-bold text-[15px] text-[#1a1a2e] mb-1">
                    Bank Transfer
                  </p>
                  <p className="text-[12px] text-[#9496a8] mb-3">
                    Direct deposit or PayID. We confirm receipt manually.
                  </p>
                  <span className="text-[11px] text-[#7f85f7] font-medium">
                    View bank details →
                  </span>
                </button>
              </div>

              {!includeBond && (
                <div className="bg-[#fff8e1] border border-[#f0c040] rounded-[10px] p-3 mb-4">
                  <p className="text-[12px] text-[#7d5a00]">
                    💡 Bond (${bond.toFixed(2)}) will be collected in person, in
                    cash or card, when you pick up the vehicle.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setView("apply")}
                className="text-[13px] text-[#9496a8] hover:text-[#7f85f7] transition-colors"
              >
                ← Back to details
              </button>
            </div>
          )}

          {/* ═══ VIEW 3b — PAYMENT (card, via Stripe) ═══ */}
          {view === "payment" && !submitted && payMethod === "card" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#7f85f7",
                    borderRadius: "10px",
                    fontFamily: "Poppins, sans-serif",
                  },
                },
              }}
            >
              <StripeCardForm
                vehicle={v}
                form={form}
                weekly={weekly}
                bond={bond}
                includeBond={includeBond}
                totalFirst={totalFirst}
                onSuccess={() => setSubmitted(true)}
                onBack={() => setPayMethod(null)}
              />
            </Elements>
          )}

          {/* ═══ VIEW 3c — PAYMENT (direct deposit) ═══ */}
          {view === "payment" && !submitted && payMethod === "deposit" && (
            <div className="view-in p-6 max-w-[600px] mx-auto">
              <button
                type="button"
                onClick={() => setPayMethod(null)}
                className="text-[13px] text-[#9496a8] hover:text-[#7f85f7] mb-4 flex items-center gap-1"
              >
                ← Choose different method
              </button>

              <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-1">
                Payment Details
              </h3>
              <p className="text-[13px] text-[#9496a8] mb-5">
                Transfer your first payment via bank transfer or PayID. We
                confirm receipt and arrange pickup within 2 hours.
              </p>

              {/* Payment breakdown */}
              <div className="bg-[#f8f8ff] border border-[#e8e8f0] rounded-[16px] p-5 mb-5">
                <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-3">
                  Payment Breakdown
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[14px] font-medium text-[#1a1a2e]">
                        First Week Rent
                      </p>
                      <p className="text-[11px] text-[#9496a8]">
                        Paid weekly in advance thereafter
                      </p>
                    </div>
                    <p className="font-bold text-[16px] text-[#1a1a2e]">
                      {weekly > 0 ? `$${weekly.toFixed(2)}` : "TBC"}
                    </p>
                  </div>

                  {includeBond ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[14px] font-medium text-[#1a1a2e]">
                          Security Bond
                          <span className="ml-2 bg-[#e1f5ee] text-[#0f6e56] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            REFUNDABLE
                          </span>
                        </p>
                        <p className="text-[11px] text-[#9496a8]">
                          2 weeks rent — included today
                        </p>
                      </div>
                      <p className="font-bold text-[16px] text-[#1a1a2e]">
                        {bond > 0 ? `$${bond.toFixed(2)}` : "TBC"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center opacity-60">
                      <div>
                        <p className="text-[13px] text-[#666] italic">
                          Security Bond
                        </p>
                        <p className="text-[11px] text-[#9496a8]">
                          To be collected at pickup
                        </p>
                      </div>
                      <p className="text-[13px] text-[#666] italic">
                        ${bond.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-[#e8e8f0] pt-3 mt-1 flex justify-between items-center">
                    <p className="font-extrabold text-[16px] text-[#1a1a2e]">
                      Total to Transfer Today
                    </p>
                    <p className="font-extrabold text-[22px] text-[#7f85f7]">
                      {totalFirst > 0
                        ? `$${totalFirst.toFixed(2)}`
                        : "Contact us"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank transfer details */}
              <div className="bg-[#1a1a2e] rounded-[16px] p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[18px]">🏦</span>
                  <p className="font-bold text-white text-[15px]">
                    Bank Transfer Details
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    ["Bank", BANK_NAME, "text-white"],
                    ["Account Name", BANK_ACCOUNT_NAME, "text-white"],
                    ["BSB", BANK_BSB, "text-[#7f85f7]"],
                    ["Account Number", BANK_ACCOUNT, "text-[#7f85f7]"],
                    ["Reference", v.rego, "text-[#5dcaa5]"],
                  ].map(([label, value, colour]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2 border-b border-white/10 last:border-none"
                    >
                      <span className="text-[12px] text-[#9496a8]">{label}</span>
                      <span className={`font-bold text-[14px] ${colour}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-white/5 rounded-[10px] p-3">
                  <p className="text-[11px] text-[#f5a623] font-semibold flex items-center gap-1.5">
                    ⚠️ Important — Use vehicle rego as reference
                  </p>
                  <p className="text-[11px] text-[#9496a8] mt-1">
                    Always use <strong className="text-white">{v.rego}</strong>{" "}
                    as your payment reference so we can match your transfer
                    instantly.
                  </p>
                </div>
              </div>

              {/* PayID option */}
              <div className="bg-[#eeedfe] rounded-[16px] p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">⚡</span>
                  <p className="font-bold text-[#534ab7] text-[15px]">
                    Pay Faster with PayID
                  </p>
                </div>
                <p className="text-[13px] text-[#534ab7] mb-3">
                  Use PayID for instant transfer — no BSB or account number
                  needed.
                </p>
                <div className="bg-white rounded-[10px] p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#9496a8]">PayID (ABN)</p>
                    <p className="font-extrabold text-[18px] text-[#7f85f7]">
                      {BANK_PAYID}
                    </p>
                    <p className="text-[11px] text-[#9496a8] mt-0.5">
                      Registered to: {BANK_ACCOUNT_NAME}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(BANK_PAYID)
                    }}
                    className="bg-[#7f85f7] text-white text-[11px] font-bold px-3 py-2 rounded-[8px] hover:bg-[#6b71f0] transition-all flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-[#9496a8] mt-2">
                  ⚠️ Still use <strong>{v.rego}</strong> as reference in your
                  PayID transfer description
                </p>
              </div>

              {/* Important notes */}
              <div className="bg-[#fff8e1] border border-[#f0c040] rounded-[14px] p-4 mb-5">
                <p className="font-bold text-[13px] text-[#7d5a00] mb-2">
                  📋 Before you transfer:
                </p>
                <ul className="space-y-1.5">
                  {[
                    `Transfer the full amount of ${
                      totalFirst > 0 ? `$${totalFirst.toFixed(2)}` : "as quoted"
                    }`,
                    `Use ${v.rego} as your reference`,
                    "Submit this form after transferring",
                    "We will confirm receipt by email",
                    "We call you within 2 hours of confirmation to arrange pickup",
                  ].map((note, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12px] text-[#7d5a00]"
                    >
                      <span className="flex-shrink-0 mt-0.5">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 cursor-pointer bg-[#f9f9ff] border border-[#e8e8f0] rounded-[12px] p-4 mb-4 hover:border-[#7f85f7] transition-colors">
                <input
                  type="checkbox"
                  checked={payConfirmed}
                  onChange={(e) => {
                    setPayConfirmed(e.target.checked)
                    if (e.target.checked) setPayError("")
                  }}
                  className="mt-0.5 flex-shrink-0 accent-[#7f85f7] w-4 h-4"
                />
                <span className="text-[13px] text-[#444] leading-relaxed">
                  I have transferred
                  {totalFirst > 0
                    ? ` $${totalFirst.toFixed(2)}`
                    : " the agreed amount"}{" "}
                  to the account above using <strong>{v.rego}</strong> as the
                  reference, and I agree to the rental terms and conditions
                  including weekly payments and bond conditions.
                </span>
              </label>

              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 mb-4">
                  <p className="text-red-600 text-[13px]">{payError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setView("apply")}
                  disabled={paySubmitting}
                  className="flex-1 border-2 border-[#e8e8f0] text-[#666] rounded-[10px] h-[52px] font-semibold text-[14px] hover:border-[#7f85f7] hover:text-[#7f85f7] disabled:opacity-40 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!payConfirmed || paySubmitting}
                  onClick={handleSubmit}
                  className="flex-[2] bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] disabled:bg-[#b0bec5] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {paySubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "✅ I've Transferred — Submit"
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-[#9496a8] mt-4">
                🔒 Your personal details are kept secure and never shared with
                third parties.
              </p>
            </div>
          )}

          {/* ═══ SUCCESS ═══ */}
          {submitted && (
            <div className="view-in p-8 text-center max-w-[480px] mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#e1f5ee] flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-[#0f6e56]" />
              </div>

              <h3 className="font-bold text-[22px] text-[#1a1a2e] mb-2">
                {payMethod === "card"
                  ? "Payment Successful! 🎉"
                  : "Application Submitted! 🎉"}
              </h3>

              <p className="text-[#555] text-[14px] leading-relaxed mb-5">
                Thank you <strong>{form.firstName}</strong>. We have received
                your {payMethod === "card" ? "payment" : "application and transfer confirmation"}{" "}
                for <strong>{v.name}</strong>.
              </p>

              {/* What happens next */}
              <div className="bg-[#f8f8ff] rounded-[14px] p-4 text-left mb-4">
                <p className="font-bold text-[13px] text-[#1a1a2e] mb-3">
                  What happens next:
                </p>
                <div className="space-y-2.5">
                  {[
                    [
                      "1",
                      payMethod === "card"
                        ? "Your card payment has been confirmed"
                        : "We verify your bank transfer",
                    ],
                    ["2", `Email confirmation sent to ${form.email}`],
                    ["3", `We call you on ${form.phone} within 2 hours`],
                    ["4", "Vehicle pickup arranged"],
                  ].map(([num, text]) => (
                    <div key={num} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white bg-[#7f85f7]">
                        {num}
                      </div>
                      <p className="text-[13px] text-[#444] leading-snug pt-0.5">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank details reminder — only relevant if they still owe a
                  transfer; a card payer has already paid in full. */}
              {payMethod !== "card" && (
                <div className="bg-[#fff8e1] border border-[#f0c040] rounded-[12px] p-4 text-left mb-5">
                  <p className="text-[12px] font-bold text-[#7d5a00] mb-2">
                    ⚠️ If you haven&apos;t transferred yet:
                  </p>
                  <div className="space-y-1">
                    {[
                      ["BSB", BANK_BSB],
                      ["Account", BANK_ACCOUNT],
                      ["PayID (ABN)", BANK_PAYID],
                      ["Reference", v.rego],
                      [
                        "Amount",
                        totalFirst > 0
                          ? `$${totalFirst.toFixed(2)}`
                          : "As quoted",
                      ],
                    ].map(([k, val]) => (
                      <div key={k} className="flex justify-between text-[12px]">
                        <span className="text-[#7d5a00]">{k}</span>
                        <span className="font-bold text-[#7d5a00]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-[#0f6e56] text-white rounded-[10px] h-[46px] font-semibold text-[14px] hover:bg-[#085041] transition-all"
              >
                Close
              </button>

              <p className="text-[11px] text-[#9496a8] mt-3">
                Questions? Call us:
                <a
                  href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
                  className="text-[#7f85f7] font-semibold ml-1"
                >
                  {SITE_PHONE}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky actions — details step only; the other steps carry their
            own Back / Next pair at the end of the form. ── */}
        {view === "details" && !submitted && (
          <div className="flex-shrink-0 p-4 border-t border-[#f0f0f8] bg-white flex flex-col gap-2.5">
            <button
              onClick={() => setView("apply")}
              className="w-full bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] transition-all duration-200"
            >
              🚗 Get on Rent
            </button>
            <a
              href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 border-2 border-[#e8e8f0] text-[#1a1a2e] rounded-[10px] h-[46px] font-semibold text-[14px] hover:border-[#7f85f7] hover:text-[#7f85f7] transition-all duration-200"
            >
              <Phone size={15} />
              Call {SITE_PHONE}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function StripeCardForm({
  vehicle,
  form,
  weekly,
  bond,
  includeBond,
  totalFirst,
  onSuccess,
  onBack,
}: {
  vehicle: RentalVehicle
  form: FormState
  weekly: number
  bond: number
  includeBond: boolean
  totalFirst: number
  onSuccess: () => void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const fmt = (n: number) => `$${n.toFixed(2)}`

  const handlePay = async () => {
    if (!stripe || !elements) return
    setProcessing(true)
    setError("")

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || "")
      setProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/services/car-rental?payment=success`,
        payment_method_data: {
          billing_details: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
          },
        },
      },
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.")
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="p-6 max-w-[600px] mx-auto">
      <h3 className="font-bold text-[20px] text-[#1a1a2e] mb-1">
        Secure Card Payment
      </h3>
      <p className="text-[13px] text-[#9496a8] mb-5">
        Powered by Stripe — bank-grade encryption. We never see your card
        details.
      </p>

      <div className="bg-[#f8f8ff] rounded-[14px] p-5 mb-5">
        <p className="font-bold text-[14px] text-[#1a1a2e] mb-3">
          {vehicle.name} ({vehicle.rego})
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">1 week rent</span>
            <span className="font-semibold text-[#1a1a2e]">{fmt(weekly)}</span>
          </div>
          {includeBond ? (
            <div className="flex justify-between text-[13px]">
              <span className="text-[#666]">
                Security bond (2 weeks)
                <span className="text-[#9496a8] text-[11px] ml-1">
                  refundable
                </span>
              </span>
              <span className="font-semibold text-[#1a1a2e]">{fmt(bond)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[12px] text-[#9496a8] italic">
              <span>Bond — pay at pickup</span>
              <span>{fmt(bond)}</span>
            </div>
          )}
          <div className="border-t border-[#e8e8f0] pt-2 mt-2 flex justify-between">
            <span className="font-bold text-[15px] text-[#1a1a2e]">
              Total today
            </span>
            <span className="font-extrabold text-[18px] text-[#7f85f7]">
              {fmt(totalFirst)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 mb-4">
          <p className="text-red-600 text-[13px] font-medium">❌ {error}</p>
        </div>
      )}

      <div className="flex items-start gap-2 mb-5 bg-[#f0faf5] rounded-[10px] p-3">
        <span className="text-[16px]">🔒</span>
        <p className="text-[11px] text-[#085041] leading-relaxed">
          Processed securely by Stripe, PCI DSS Level 1 certified — the
          highest payment security standard available.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 border-2 border-[#e8e8f0] text-[#666] rounded-[10px] h-[52px] font-semibold text-[14px] hover:border-[#7f85f7] disabled:opacity-40 transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={processing || !stripe}
          className="flex-[2] bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-bold text-[15px] hover:bg-[#6b71f0] disabled:bg-[#b0bec5] transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>🔒 Pay {fmt(totalFirst)} AUD</>
          )}
        </button>
      </div>
    </div>
  )
}
