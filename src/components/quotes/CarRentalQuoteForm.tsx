"use client"

// CAR RENTAL QUOTE WIZARD — Brisbane focused
// Ported from car_rental_quote_template.html (6-step flow + security bond
// pre-authorisation workflow). Theme: BLUE (#1565c0) — car rental uses blue,
// not the security form's green. Business name/phone/email come from site.ts.

import { Suspense, forwardRef, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowRight, ArrowLeft, Check, Send, Info } from "lucide-react"
import {
  vehicles,
  carExtras,
  locationSurcharges,
  youngDriverSurcharge,
  oneWayFee,
  gstRate,
  minRentalAge,
  type Vehicle,
  type LocationSurcharge,
} from "@/data/car-rental"
import { SITE_NAME, SITE_SUFFIX, SITE_PHONE, SITE_EMAIL } from "@/data/site"
import { formatAUD } from "@/lib/formatters"
import { mergeVehicles, normaliseOverrides } from "@/lib/catalog"
import ImageWithFallback from "@/components/ui/ImageWithFallback"

const STEP_TITLES = [
  "Where and when do you need the car?",
  "Choose your vehicle",
  "Add extras to your rental",
  "Security bond & payment method",
  "Your details",
  "Review your quote",
]

const TIMES = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM",
]

// Bond timeline shown inside the step-3 bond box (after-return explainer).
const returnTimeline = [
  { dot: "bg-[#1565c0]", mark: "R", label: "Return day", text: "Vehicle inspected. Final rental charge processed. Bond hold begins releasing." },
  { dot: "bg-[#7f85f7]", mark: "1-3", label: "Days 1–3", text: "Final charge appears on your statement. Bond may still show as pending — this is normal." },
  { dot: "bg-[#5dcaa5]", mark: "10", label: "Up to 10 days", text: "Bond fully released. Your available balance increases. No action needed from you." },
  { dot: "bg-[#185fa5]", mark: "?", label: "Still showing?", text: "Contact your bank — we have already released the hold on our end." },
]

// Bond timeline shown on the success screen (start-to-finish explainer).
const successTimeline = [
  { dot: "bg-[#1565c0]", text: "At pick-up: Rental amount charged + security bond held on your card." },
  { dot: "bg-[#7f85f7]", text: "During rental: Bond shows as pending — funds are not debited, just held." },
  { dot: "bg-[#5dcaa5]", text: "On return: Vehicle inspected. If no damage, bond release begins immediately." },
  { dot: "bg-[#185fa5]", text: "3–10 business days: Bond fully released by your bank. Available balance increases." },
]

interface DriverForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  suburb: string
  licence: string
  purpose: string
  notes: string
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0
  const diff = Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
  )
  return diff > 0 ? diff : 0
}

function QuoteWizard() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(0)
  const [location, setLocation] = useState<LocationSurcharge | null>(null)
  const [pickupDate, setPickupDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [pickupTime, setPickupTime] = useState("10:00 AM")
  const [returnTime, setReturnTime] = useState("10:00 AM")
  const [sameLoc, setSameLoc] = useState(true)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [fleet, setFleet] = useState<Vehicle[]>(vehicles)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})
  const [payment, setPayment] = useState<"credit" | "debit" | null>(null)
  const [bondConfirmed, setBondConfirmed] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { register, watch, getValues } = useForm<DriverForm>({
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      age: "", suburb: "", licence: "", purpose: "Personal / Holiday", notes: "",
    },
  })

  const age = Number(watch("age")) || 0
  const youngDriver = age >= minRentalAge && age < 25
  const rentalDays = daysBetween(pickupDate, returnDate)

  // Merge admin catalog overrides so dashboard vehicle edits / additions /
  // hides appear in the wizard live (mirrors the fleet grid on the site).
  useEffect(() => {
    let cancelled = false
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFleet(mergeVehicles(vehicles, normaliseOverrides(data)))
      })
      .catch(() => {
        /* keep static vehicles on error */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Pre-select a vehicle from ?vehicle=id. Depends on the merged fleet so
  // dashboard-added custom vehicles also resolve; never clobbers a manual pick.
  useEffect(() => {
    const v = searchParams.get("vehicle")
    if (!v) return
    const match = fleet.find((x) => x.id === v)
    if (match) setVehicle((cur) => cur ?? match)
  }, [searchParams, fleet])

  const today = new Date().toISOString().split("T")[0]

  function calcQuote() {
    const days = rentalDays || 1
    const fullWeeks = Math.floor(days / 7)
    const remDays = days % 7
    const base = vehicle
      ? fullWeeks * vehicle.weeklyRate + remDays * vehicle.dailyRate
      : 0

    const extraLines = carExtras
      .filter((e) => selectedExtras[e.id])
      .map((e) => {
        const raw = e.ratePerDay * days
        const amount = e.capAmount ? Math.min(raw, e.capAmount) : raw
        return { id: e.id, name: e.name, amount }
      })
    const extrasTotal = extraLines.reduce((s, e) => s + e.amount, 0)

    const locationSurcharge = location?.surcharge ?? 0
    const oneway = sameLoc ? 0 : oneWayFee
    const young = youngDriver ? days * youngDriverSurcharge : 0

    const subtotal = base + extrasTotal + locationSurcharge + oneway + young
    const gst = subtotal * gstRate
    const total = subtotal + gst
    const bond = vehicle?.bond ?? 0
    const totalCard = total + bond

    return {
      days, fullWeeks, remDays, base, extraLines, extrasTotal,
      locationSurcharge, oneway, young, subtotal, gst, total, bond, totalCard,
    }
  }

  const q = calcQuote()
  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }))

  const next = () => {
    if (step === 0) {
      if (!location) return setError("Please select a pick-up location.")
      if (!pickupDate || !returnDate || rentalDays < 1)
        return setError("Please select valid pick-up and return dates.")
    }
    if (step === 1 && !vehicle) return setError("Please select a vehicle.")
    if (step === 3) {
      if (!payment) return setError("Please select a payment method.")
      if (!bondConfirmed)
        return setError("Please confirm you understand the security bond to continue.")
    }
    if (step === 4) {
      const { firstName, lastName, email, phone, licence } = getValues()
      if (!firstName || !lastName) return setError("Please enter your name.")
      if (!email || !email.includes("@"))
        return setError("Please enter a valid email address.")
      if (!phone) return setError("Please enter your phone number.")
      if (age < minRentalAge)
        return setError(`Must be ${minRentalAge} or older to rent.`)
      if (!licence) return setError("Please select your licence type.")
    }
    setError("")
    setStep((s) => s + 1)
  }

  const back = () => {
    setError("")
    setStep((s) => s - 1)
  }

  const submit = async () => {
    setSubmitError("")
    setIsSubmitting(true)
    try {
      const d = getValues()
      const res = await fetch("/api/quote/car-rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          phone: d.phone,
          age,
          suburb: d.suburb,
          licence: d.licence,
          purpose: d.purpose,
          notes: d.notes,
          location: location?.name ?? "",
          locationSurcharge: q.locationSurcharge,
          pickupDate,
          returnDate,
          pickupTime,
          returnTime,
          rentalDays: q.days,
          sameLoc,
          oneway: q.oneway,
          vehicle: vehicle
            ? {
                name: vehicle.name,
                example: vehicle.example,
                dailyRate: vehicle.dailyRate,
                weeklyRate: vehicle.weeklyRate,
                bond: vehicle.bond,
              }
            : null,
          extras: q.extraLines.map((e) => ({ name: e.name, amount: Math.round(e.amount) })),
          payment,
          youngDriver,
          young: q.young,
          base: q.base,
          extrasTotal: Math.round(q.extrasTotal),
          subtotal: Math.round(q.subtotal),
          gst: Math.round(q.gst),
          total: Math.round(q.total),
          bond: q.bond,
          totalCard: Math.round(q.totalCard),
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setSubmitted(true)
    } catch {
      setSubmitError("Failed to send. Please call us.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (submitted) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#e6f1fb] flex items-center justify-center mx-auto mb-5 text-[40px]">
          ✅
        </div>
        <h2 className="text-[24px] font-bold text-[#1a1a2e] mb-2">
          Quote Sent Successfully!
        </h2>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          Your personalised car rental quote has been emailed to you.
          <br />
          Our team will confirm availability within <strong>2 hours</strong>.
        </p>

        <div className="text-left bg-[#f9fcff] border border-[#90caf9] rounded-[14px] p-6 my-6">
          <h3 className="font-bold text-[13px] text-[#0c447c] mb-3">
            📅 What happens next — security bond timeline:
          </h3>
          {successTimeline.map((t, i) => (
            <div key={i} className="flex gap-2.5 mb-2 items-start">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${t.dot}`}
              >
                {i + 1}
              </span>
              <p className="text-[12px] text-[#185fa5] leading-relaxed pt-0.5">
                {t.text}
              </p>
            </div>
          ))}
        </div>

        <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-5 py-1.5 rounded-full bg-[#e6f1fb] text-[#185fa5]">
          ⏱️ Quote valid for 48 hours
        </span>

        <p className="text-[13px] text-gray-500 mt-6">
          Questions? Call us at{" "}
          <strong className="text-[#1a1a2e]">{SITE_PHONE}</strong>
          <br />
          or email <strong className="text-[#1a1a2e]">{SITE_EMAIL}</strong>
        </p>
      </div>
    )
  }

  /* ---------------- WIZARD ---------------- */
  return (
    <div className="max-w-[680px] mx-auto px-4 pb-16">
      {/* Header — blue */}
      <div className="bg-[#1565c0] rounded-b-[20px] px-6 py-5 flex items-center gap-3 mb-6">
        <div className="w-[42px] h-[42px] rounded-[10px] bg-white/20 flex items-center justify-center text-[22px]">
          🚗
        </div>
        <div>
          <div className="text-[18px] font-semibold text-white leading-tight">
            {SITE_NAME}
            <span className="text-[#90caf9]"> {SITE_SUFFIX}</span>
          </div>
          <div className="text-[11px] text-[#bcd9f5]">
            Car Rental Quote — Brisbane
          </div>
        </div>
        <div className="ml-auto text-[12px] text-white/70 text-right leading-tight">
          Free Quote
          <br />
          No obligation
        </div>
      </div>

      {/* Progress bar — 6 segments */}
      <div className="flex gap-1.5 mb-1.5">
        {STEP_TITLES.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? "bg-[#5dcaa5]" : i === step ? "bg-[#1565c0]" : "bg-[#e0e0e8]"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold text-[#1565c0] uppercase tracking-[0.07em] mb-1 mt-4">
        Step {step + 1} of {STEP_TITLES.length}
      </p>
      <h2 className="text-[20px] font-semibold text-[#1a1a2e] mb-6 leading-snug">
        {STEP_TITLES[step]}
      </h2>

      {/* STEP 0 — pick-up & return */}
      {step === 0 && (
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 mb-2">
            Pick-up location
          </p>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {locationSurcharges.map((l) => (
              <Tile
                key={l.id}
                selected={location?.id === l.id}
                onClick={() => setLocation(l)}
                icon={l.icon}
                name={l.name}
                sub={l.description}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <DateField label="Pick-up date" value={pickupDate} min={today} onChange={setPickupDate} />
            <TimeSelect label="Pick-up time" value={pickupTime} onChange={setPickupTime} />
            <DateField label="Return date" value={returnDate} min={pickupDate || today} onChange={setReturnDate} />
            <TimeSelect label="Return time" value={returnTime} onChange={setReturnTime} />
          </div>

          {rentalDays > 0 && (
            <div className="bg-[#e6f1fb] border border-[#90caf9] rounded-[10px] py-2.5 px-4 text-[14px] text-[#185fa5] font-semibold text-center mb-4">
              🗓️ {rentalDays} day{rentalDays > 1 ? "s" : ""} rental
            </div>
          )}

          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 mb-2">
            Return to same location?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Tile selected={sameLoc} onClick={() => setSameLoc(true)} icon="✅" name="Yes, same location" sub="No extra fee" />
            <Tile selected={!sameLoc} onClick={() => setSameLoc(false)} icon="🔄" name="No, different location" sub={`+${formatAUD(oneWayFee)} one-way fee`} />
          </div>

          <div className="bg-[#e6f1fb] border-l-[3px] border-[#185fa5] rounded-r-[10px] p-3.5 mt-4 text-[12px] text-[#0c447c] leading-relaxed">
            🚧 <strong>Brisbane toll roads:</strong> Gateway Motorway, Logan
            Motorway, Airport Link, Clem7 Tunnel and Go Between Bridge all
            require a Linkt pass. We strongly recommend adding the toll pass in
            the next steps.
          </div>
        </div>
      )}

      {/* STEP 1 — choose vehicle */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fleet.map((v) => (
            <button
              key={v.id}
              onClick={() => setVehicle(v)}
              className={`relative text-left rounded-[14px] p-5 transition-colors ${
                vehicle?.id === v.id
                  ? "border-[1.5px] border-[#1565c0] bg-[#e6f1fb]"
                  : "border-[1.5px] border-[#e0e0e8] bg-white hover:border-[#90caf9]"
              }`}
            >
              {v.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1565c0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {v.badge}
                </span>
              )}
              <div className="relative w-full h-[100px] overflow-hidden rounded-t-[14px] mb-3 flex-shrink-0">
                <ImageWithFallback
                  src={v.image}
                  alt={v.imageAlt}
                  fill
                  className="object-cover object-center"
                  fallbackBg="#f0f4ff"
                  fallbackIcon="Car"
                  placeholderText="Photo coming soon"
                />
              </div>
              <div className="text-[13px] font-semibold text-[#1a1a2e]">{v.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{v.example}</div>
              <div className="text-[17px] font-bold text-[#1565c0] mt-2">
                {formatAUD(v.dailyRate)} / day
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {formatAUD(v.weeklyRate)} / week
              </div>
              <span
                className={`inline-block mt-2 text-[11px] rounded-[6px] px-2 py-0.5 ${
                  vehicle?.id === v.id ? "bg-white text-[#1565c0]" : "bg-[#e6f1fb] text-[#185fa5]"
                }`}
              >
                Bond: {formatAUD(v.bond)} · Seats {v.passengers}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 — extras */}
      {step === 2 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {carExtras.map((e) => {
              const on = !!selectedExtras[e.id]
              return (
                <button
                  key={e.id}
                  onClick={() => toggleExtra(e.id)}
                  className={`flex items-start gap-2.5 text-left rounded-[12px] p-4 transition-colors ${
                    on
                      ? "border-[1.5px] border-[#1565c0] bg-[#e6f1fb]"
                      : "border-[1.5px] border-[#e0e0e8] bg-white hover:border-[#90caf9]"
                  }`}
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      on ? "bg-[#1565c0]" : "border-2 border-[#e0e0e8]"
                    }`}
                  >
                    {on && <Check size={12} className="text-white" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-[#1a1a2e]">
                      {e.icon} {e.name}
                    </span>
                    <span className="block text-[12px] font-semibold text-[#1565c0] mt-0.5">
                      {formatAUD(e.ratePerDay)} / day
                      {e.capAmount ? ` · max ${formatAUD(e.capAmount)}` : ""}
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5 leading-snug">
                      {e.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="bg-[#faeeda] border-l-[3px] border-[#854f0b] rounded-r-[10px] p-3.5 text-[12px] text-[#854f0b] leading-relaxed">
            ⚠️ <strong>Brisbane tip:</strong> The Linkt Toll Pass is highly
            recommended. Without it, toll charges plus a $3.50 processing fee per
            toll will be automatically charged to your card after return.
          </div>
        </div>
      )}

      {/* STEP 3 — security bond & payment */}
      {step === 3 && (
        <div>
          <div className="border-[1.5px] border-[#90caf9] bg-[#e6f1fb] rounded-[14px] p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-[#1565c0]" />
              <h3 className="font-bold text-[14px] text-[#0c447c]">
                How the security bond works
              </h3>
            </div>

            {[
              ["Rental cost (quote total)", "Charged at pick-up ✓"],
              ["Security bond / pre-auth hold", `${formatAUD(q.bond)} held — NOT charged`],
              ["No damage on return", "Bond released in 3–10 days ✓"],
              ["If damage occurs", "Deducted from bond only"],
            ].map(([l, r]) => (
              <div
                key={l}
                className="flex justify-between items-center text-[13px] text-[#185fa5] py-1.5 border-b border-[#b5d4f4] last:border-0"
              >
                <span>{l}</span>
                <span className="font-semibold">{r}</span>
              </div>
            ))}

            <p className="text-[12px] font-bold text-[#0c447c] mt-3.5 mb-2">
              What happens after you return the car:
            </p>
            {returnTimeline.map((t) => (
              <div key={t.label} className="flex gap-2.5 items-start py-0.5">
                <span
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${t.dot}`}
                >
                  {t.mark}
                </span>
                <p className="text-[12px] text-[#185fa5] leading-relaxed">
                  <span className="font-semibold">{t.label}:</span> {t.text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 mb-2">
            Payment method
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Tile
              selected={payment === "credit"}
              onClick={() => setPayment("credit")}
              icon="💳"
              name="Credit Card"
              sub="Pre-auth hold — funds not debited. Recommended."
            />
            <Tile
              selected={payment === "debit"}
              onClick={() => setPayment("debit")}
              icon="🏦"
              name="Debit Card"
              sub="Bond debited then refunded. May take 5–10 days."
            />
          </div>

          {payment === "debit" && (
            <div className="bg-[#faeeda] border-l-[3px] border-[#854f0b] rounded-r-[10px] p-3.5 mt-3 text-[12px] text-[#854f0b] leading-relaxed">
              ⚠️ <strong>Debit card note:</strong> The {formatAUD(q.bond)} bond
              will be <strong>debited</strong> from your account at pick-up and{" "}
              <strong>refunded</strong> within 5–10 business days after return
              (not held — actual debit/refund).
            </div>
          )}

          <label
            className={`flex items-start gap-3 rounded-[12px] p-4 mt-4 cursor-pointer transition-colors ${
              bondConfirmed
                ? "border-[1.5px] border-[#1565c0] bg-[#e6f1fb]"
                : "border-[1.5px] border-[#e0e0e8] bg-white hover:border-[#1565c0]"
            }`}
          >
            <input
              type="checkbox"
              checked={bondConfirmed}
              onChange={(e) => setBondConfirmed(e.target.checked)}
              className="w-[18px] h-[18px] mt-0.5 accent-[#1565c0] flex-shrink-0"
            />
            <span className="text-[13px] text-[#1a1a2e] leading-relaxed">
              I understand a security bond of{" "}
              <b className="text-[#1565c0] font-semibold">{formatAUD(q.bond)}</b>{" "}
              will be held on my card for the rental period. The hold will be
              released within 3–10 business days of vehicle return, provided no
              damage or additional charges apply.
            </span>
          </label>
        </div>
      )}

      {/* STEP 4 — driver details */}
      {step === 4 && (
        <div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name *" placeholder="John" {...register("firstName")} />
            <TextField label="Last name *" placeholder="Smith" {...register("lastName")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Email address *" type="email" placeholder="john@email.com" {...register("email")} />
            <TextField label="Phone number *" type="tel" placeholder="04XX XXX XXX" {...register("phone")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Age *" type="number" placeholder="e.g. 28" {...register("age")} />
            <TextField label="Suburb / Postcode" placeholder="Brisbane, 4000" {...register("suburb")} />
          </div>

          {age > 0 && age < minRentalAge && (
            <p className="text-[12px] text-[#a32d2d] mb-3">
              Must be {minRentalAge} or older to rent.
            </p>
          )}
          {youngDriver && (
            <div className="bg-[#faeeda] border border-[#f0997b] rounded-[8px] p-2.5 mb-4 text-[12px] text-[#633806] font-medium">
              ⚠️ Young driver surcharge applies: +{formatAUD(youngDriverSurcharge)}/day
              {rentalDays > 0 ? ` (${formatAUD(q.young)} total)` : ""} has been
              added to your quote.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Licence type *" {...register("licence")}>
              <option value="">Select licence type</option>
              <option>Australian Licence</option>
              <option>International Licence + Passport</option>
            </SelectField>
            <SelectField label="Purpose of rental" {...register("purpose")}>
              <option>Personal / Holiday</option>
              <option>Business</option>
              <option>Airport Transfer</option>
              <option>Queensland Road Trip</option>
              <option>Moving / Relocation</option>
            </SelectField>
          </div>

          <div className="mb-4">
            <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 block mb-1.5">
              Special requests
            </label>
            <textarea
              rows={3}
              placeholder="Any special requirements, preferred car colour, baby capsule details, etc."
              {...register("notes")}
              className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:border-[#1565c0] outline-none"
            />
          </div>

          <div className="bg-[#e6f1fb] border-l-[3px] border-[#185fa5] rounded-r-[10px] p-3.5 text-[12px] text-[#0c447c] leading-relaxed">
            📋 Minimum rental age is <strong>{minRentalAge} years</strong>. Under
            25 incurs a {formatAUD(youngDriverSurcharge)}/day young driver
            surcharge. International licence holders must present passport at
            pick-up.
          </div>
        </div>
      )}

      {/* STEP 5 — review & submit */}
      {step === 5 && (
        <div>
          <div className="bg-[#f9fcff] border-[1.5px] border-[#90caf9] rounded-[16px] p-5">
            <h3 className="text-[14px] font-bold text-[#0c447c] pb-2 mb-2 border-b border-[#b5d4f4]">
              📋 Quote Summary
            </h3>

            <SummarySection>Rental Details</SummarySection>
            <SummaryRow left={location?.name ?? "—"} right={pickupDate ? `${pickupDate} → ${returnDate}` : "—"} />
            <SummaryRow left={vehicle ? `${vehicle.icon} ${vehicle.name}` : "—"} right={`${q.days} day${q.days !== 1 ? "s" : ""}`} />

            <SummarySection>Charges</SummarySection>
            <SummaryRow
              left={
                q.fullWeeks > 0
                  ? `${vehicle?.name} (${q.fullWeeks}wk${q.fullWeeks > 1 ? "s" : ""}${q.remDays > 0 ? ` + ${q.remDays}d` : ""})`
                  : `${vehicle?.name ?? "Vehicle"} × ${q.days} day${q.days !== 1 ? "s" : ""}`
              }
              right={formatAUD(Math.round(q.base))}
            />
            {q.extraLines.map((e) => (
              <SummaryRow key={e.id} left={e.name} right={formatAUD(Math.round(e.amount))} />
            ))}
            {q.locationSurcharge > 0 && (
              <SummaryRow left={`${location?.name} surcharge`} right={formatAUD(q.locationSurcharge)} />
            )}
            {q.oneway > 0 && <SummaryRow left="One-way fee" right={formatAUD(q.oneway)} />}
            {q.young > 0 && (
              <SummaryRow left={`Young driver surcharge × ${q.days} days`} right={formatAUD(q.young)} />
            )}

            <SummarySection>Tax</SummarySection>
            <SummaryRow left="GST (10%)" right={formatAUD(Math.round(q.gst))} />

            <div className="flex justify-between text-[16px] font-bold text-[#0c447c] border-t-2 border-[#90caf9] mt-1.5 pt-2.5">
              <span>Total to pay at pick-up</span>
              <span>{formatAUD(Math.round(q.total))}</span>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#185fa5] border-b border-[#90caf9] mt-2 pt-2.5 pb-1">
              Security Bond (held — not charged)
            </div>
            <div className="flex justify-between text-[12px] text-[#185fa5] font-semibold py-1.5">
              <span>Pre-auth hold on your card</span>
              <span>{formatAUD(q.bond)} (held)</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-[#0c447c] pt-1">
              <span>Total card reservation needed</span>
              <span>{formatAUD(Math.round(q.totalCard))}</span>
            </div>

            <div className="bg-[#e6f1fb] text-[#185fa5] rounded-full py-1 text-[11px] font-semibold text-center mt-3">
              ⏱️ Quote valid for 48 hours — vehicle availability may change
            </div>
          </div>

          <div className="bg-[#e1f5ee] border-l-[3px] border-[#0f6e56] rounded-r-[10px] p-3.5 mt-4 text-[12px] text-[#0f6e56] leading-relaxed">
            ✅ Once you submit, our team will confirm vehicle availability and
            send your booking confirmation within <strong>2 hours</strong>. No
            payment is taken online — payment is at pick-up only.
          </div>

          {submitError && (
            <p className="text-[12px] text-[#a32d2d] mt-3 text-center">{submitError}</p>
          )}
        </div>
      )}

      {error && <p className="text-[12px] text-[#a32d2d] mt-3">{error}</p>}

      {/* Nav buttons */}
      <div className="flex gap-2.5 mt-6">
        {step > 0 && (
          <button
            onClick={back}
            className="px-4 py-2.5 border border-gray-300 rounded-[8px] text-gray-500 text-[14px] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {step < STEP_TITLES.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1565c0] hover:bg-[#185fa5] text-white text-[15px] font-semibold rounded-[10px] transition-colors"
          >
            Next Step <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1565c0] hover:bg-[#185fa5] disabled:bg-[#b0bec5] text-white text-[15px] font-bold rounded-[10px] transition-colors"
          >
            <Send size={16} /> {isSubmitting ? "Sending…" : "Send My Quote"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- presentational helpers ---------------- */

function Tile({
  selected, onClick, icon, name, sub,
}: {
  selected: boolean
  onClick: () => void
  icon: string
  name: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-center rounded-[14px] p-4 transition-colors ${
        selected
          ? "border-[1.5px] border-[#1565c0] bg-[#e6f1fb]"
          : "border-[1.5px] border-[#e0e0e8] bg-white hover:border-[#90caf9] hover:bg-[#f5f9ff]"
      }`}
    >
      <div className="text-[26px] mb-2">{icon}</div>
      <div className={`text-[13px] font-semibold ${selected ? "text-[#1565c0]" : "text-[#1a1a2e]"}`}>
        {name}
      </div>
      <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>
    </button>
  )
}

function DateField({
  label, value, min, onChange,
}: {
  label: string
  value: string
  min?: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 block mb-1.5">
        {label}
      </label>
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:border-[#1565c0] outline-none"
      />
    </div>
  )
}

function TimeSelect({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 block mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:border-[#1565c0] outline-none cursor-pointer"
      >
        {TIMES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}

// forwardRef so react-hook-form's register() (name/onChange/onBlur/ref) spreads on.
const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string
    type?: string
    placeholder?: string
    name?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
  }
>(function TextField({ label, type = "text", placeholder, name, onChange, onBlur }, ref) {
  return (
    <div className="mb-4">
      <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 block mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:border-[#1565c0] outline-none"
      />
    </div>
  )
})

const SelectField = forwardRef<
  HTMLSelectElement,
  {
    label: string
    name?: string
    children: React.ReactNode
    onChange?: React.ChangeEventHandler<HTMLSelectElement>
    onBlur?: React.FocusEventHandler<HTMLSelectElement>
  }
>(function SelectField({ label, name, children, onChange, onBlur }, ref) {
  return (
    <div className="mb-4">
      <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-gray-500 block mb-1.5">
        {label}
      </label>
      <select
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1a1a2e] bg-white focus:border-[#1565c0] outline-none cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
})

function SummarySection({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500 border-b border-[#90caf9] mt-1 pt-2.5 pb-1">
      {children}
    </div>
  )
}

function SummaryRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between text-[13px] text-[#185fa5] py-1.5 border-b border-[#dceefb] last:border-0">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  )
}

export default function CarRentalQuoteForm() {
  return (
    <main className="bg-[#f5f5f5] min-h-screen py-6">
      <Suspense fallback={null}>
        <QuoteWizard />
      </Suspense>
    </main>
  )
}
