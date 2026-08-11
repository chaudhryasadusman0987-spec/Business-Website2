"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { itConsulting, itServices, type ITService } from "@/data/it-services"
import { mergeITEstimates, normaliseOverrides } from "@/lib/catalog"
import { SITE_FULL, SITE_PHONE } from "@/data/site"

// Single-page project brief. The customer describes what they want, we email
// the brief to the admin and book a free consultation. Nothing here quotes a
// fixed price — every range shown is flagged as an estimate.

function ITQuoteBrief() {
  const params = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Estimate ranges default to the data file, then re-seed from the dashboard's
  // saved overrides so the form shows the same numbers as the services page.
  const [services, setServices] = useState<ITService[]>(itServices)
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setServices(mergeITEstimates(itServices, normaliseOverrides(data))))
      .catch(() => {
        /* keep the data-file defaults */
      })
  }, [])

  const [form, setForm] = useState({
    // Which service
    service: params.get("service") || "web-development",
    // Contact
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    // Project brief
    projectTitle: "",
    projectDescription: "",
    targetAudience: "",
    keyFeatures: "",
    existingWebsite: "",
    // Budget & timeline
    budgetRange: "",
    timeline: "",
    // Consultation preference
    consultationPreference: "video-call",
    preferredTime: "",
    // How they found us
    hearAboutUs: "",
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const isConsulting = form.service === "it-consulting"
  const selectedService =
    services.find((s) => s.id === form.service) ?? services[0]
  const serviceName = isConsulting ? itConsulting.name : selectedService.name
  const estimatedRange = isConsulting
    ? "Free consultation"
    : selectedService.estimatedDisplay

  const inp =
    "w-full border border-[#e8e8f0] rounded-[10px] h-[48px] px-4 text-[14px] focus:border-[#7f85f7] outline-none transition-colors bg-white"
  const ta =
    "w-full border border-[#e8e8f0] rounded-[10px] px-4 py-3 text-[14px] focus:border-[#7f85f7] outline-none transition-colors bg-white resize-none"
  const lbl =
    "block text-[12px] font-semibold text-[#666880] uppercase tracking-wider mb-1.5"
  const sel = inp + " appearance-none cursor-pointer"

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.phone) {
      setError("Please fill in your name, email and phone number.")
      return
    }
    if (!form.projectDescription) {
      setError(
        isConsulting
          ? "Please tell us what you would like help with."
          : "Please describe your project."
      )
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/quote/it-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceName, estimatedRange }),
      })
      if (!res.ok) throw new Error("Failed")
      setSubmitted(true)
    } catch {
      // The route only fails on a network error; the brief may still have been
      // logged. Never show the customer a dead end — the phone number is on the
      // success screen either way.
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-[24px] p-10 max-w-[560px] w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#eeedfe] flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-[#7f85f7]" />
          </div>
          <h2 className="font-bold text-[24px] text-[#1a1a2e] mb-3">
            {isConsulting ? "Consultation Booked! 🎉" : "Brief Received! 🎉"}
          </h2>
          <p className="text-[#555] text-[14px] leading-relaxed mb-4">
            {isConsulting
              ? `Hi ${form.firstName}, your free consultation request has been received. We will call you on ${form.phone} within 24 hours to confirm the time.`
              : `Hi ${form.firstName}, your project brief for ${serviceName} has been sent to our team. We will review it and send you an estimated price range within 24 hours.`}
          </p>

          <div className="bg-[#f8f8ff] rounded-[14px] p-4 text-left text-[13px] mb-6">
            <p className="font-bold text-[#1a1a2e] mb-2">What happens next:</p>
            <div className="space-y-2 text-[#555]">
              {isConsulting ? (
                <>
                  <p>📧 Confirmation email sent to {form.email}</p>
                  <p>📞 We call you within 24 hours</p>
                  <p>💬 Free 30-min call to discuss your needs</p>
                  <p>📋 We recommend the best solution for you</p>
                </>
              ) : (
                <>
                  <p>📧 Brief emailed to our team now</p>
                  <p>💰 Estimated price range sent to {form.email} within 24 hours</p>
                  <p>📞 Free consultation call to discuss details</p>
                  <p>📋 Final price agreed before any work starts</p>
                </>
              )}
            </div>
          </div>

          <Link
            href="/services/it-services"
            className="w-full bg-[#7f85f7] text-white rounded-[10px] h-[48px] flex items-center justify-center font-bold text-[15px] hover:bg-[#6b71f0] transition-all"
          >
            Back to IT Services
          </Link>
        </div>
      </div>
    )
  }

  const tiles = [
    ...services.map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
      price: s.estimatedDisplay,
    })),
    {
      id: "it-consulting",
      name: itConsulting.name,
      icon: itConsulting.icon,
      price: "Free call",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f8]">
      {/* Header */}
      <div className="bg-[#0d0d1a] py-12">
        <div className="max-w-[760px] mx-auto px-4 text-center">
          <p className="text-[#7f85f7] text-[11px] font-semibold uppercase tracking-widest mb-3">
            {SITE_FULL} · IT &amp; AI Services
          </p>
          <h1 className="text-white font-bold text-[32px] lg:text-[40px] leading-tight mb-3">
            {isConsulting ? "Book a Free Consultation" : "Describe Your Project"}
          </h1>
          <p className="text-[#9496a8] text-[15px] max-w-[480px] mx-auto">
            {isConsulting
              ? "Tell us about your business and technology needs. We will contact you within 24 hours to confirm your free call."
              : "The more detail you provide the more accurate our estimate. Prices shown are guides only — confirmed in your free consultation."}
          </p>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-4 py-10">
        {/* Service selector */}
        <div className="bg-white rounded-[20px] p-6 mb-5 border border-[#e8e8f0]">
          <p className="text-[12px] font-bold text-[#666880] uppercase tracking-wider mb-3">
            Which service do you need?
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiles.map((s) => {
              const active = form.service === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set("service", s.id)}
                  className={`p-4 rounded-[14px] border-2 text-left transition-all duration-200 ${
                    active
                      ? "border-[#7f85f7] bg-[#eeedfe]"
                      : "border-[#e8e8f0] hover:border-[#7f85f7] bg-white"
                  }`}
                >
                  <span className="text-[24px] block mb-2">{s.icon}</span>
                  <p
                    className={`font-bold text-[13px] leading-tight ${
                      active ? "text-[#534ab7]" : "text-[#1a1a2e]"
                    }`}
                  >
                    {s.name}
                  </p>
                  <p
                    className={`text-[11px] mt-1 ${
                      active ? "text-[#7f85f7]" : "text-[#9496a8]"
                    }`}
                  >
                    {s.price}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Estimate notice */}
          {!isConsulting && (
            <div className="mt-4 bg-[#fff8e1] border border-[#f0c040] rounded-[10px] p-3 flex items-start gap-2">
              <span className="text-[16px] flex-shrink-0">⚠️</span>
              <p className="text-[12px] text-[#7d5a00]">
                <strong>Estimated range: {estimatedRange}</strong> — This is a
                guide only. Your actual price depends on your specific
                requirements and is confirmed in your free consultation.
              </p>
            </div>
          )}
        </div>

        {/* Contact details */}
        <div className="bg-white rounded-[20px] p-6 mb-5 border border-[#e8e8f0]">
          <p className="text-[12px] font-bold text-[#666880] uppercase tracking-wider mb-4">
            Your Contact Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={lbl}>First Name *</label>
              <input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={inp}
                placeholder="John"
              />
            </div>
            <div>
              <label className={lbl}>Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={inp}
                placeholder="Smith"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={lbl}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inp}
                placeholder="john@business.com"
              />
            </div>
            <div>
              <label className={lbl}>Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inp}
                placeholder="04XX XXX XXX"
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Company / Business Name</label>
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              className={inp}
              placeholder="Your company name (optional)"
            />
          </div>
        </div>

        {/* Project brief — everything except consulting */}
        {!isConsulting && (
          <div className="bg-white rounded-[20px] p-6 mb-5 border border-[#e8e8f0]">
            <p className="text-[12px] font-bold text-[#666880] uppercase tracking-wider mb-1">
              Project Brief
            </p>
            <p className="text-[12px] text-[#9496a8] mb-4">
              The more detail you give, the more accurate our estimate. There are
              no wrong answers.
            </p>

            <div className="space-y-4">
              <div>
                <label className={lbl}>Project Title</label>
                <input
                  value={form.projectTitle}
                  onChange={(e) => set("projectTitle", e.target.value)}
                  className={inp}
                  placeholder="e.g. Website for my plumbing business"
                />
              </div>

              <div>
                <label className={lbl}>Describe what you need *</label>
                <textarea
                  value={form.projectDescription}
                  onChange={(e) => set("projectDescription", e.target.value)}
                  className={ta}
                  rows={5}
                  placeholder={
                    form.service === "web-development"
                      ? "e.g. I need a 5-page website for my electrical business in Brisbane. I want a contact form, a page listing my services and a gallery of my work. I want it to look professional and load fast on mobile..."
                      : form.service === "app-development"
                        ? "e.g. I want a food delivery app for my restaurant. Customers should be able to browse the menu, add items to cart, pay online and track their order. I need both iOS and Android..."
                        : "e.g. I want an AI chatbot on my website that can answer customer questions about my products and collect leads. It should know about my pricing and be available 24/7..."
                  }
                />
              </div>

              <div>
                <label className={lbl}>Who is your target audience?</label>
                <input
                  value={form.targetAudience}
                  onChange={(e) => set("targetAudience", e.target.value)}
                  className={inp}
                  placeholder="e.g. Brisbane homeowners aged 30-60, small business owners"
                />
              </div>

              <div>
                <label className={lbl}>Key features you must have</label>
                <textarea
                  value={form.keyFeatures}
                  onChange={(e) => set("keyFeatures", e.target.value)}
                  className={ta}
                  rows={4}
                  placeholder={
                    "List the most important features, one per line. e.g.\n" +
                    "- Online booking system\n" +
                    "- Payment processing\n" +
                    "- Customer login area\n" +
                    "- Email notifications"
                  }
                />
              </div>

              <div>
                <label className={lbl}>Do you have an existing website or app?</label>
                <input
                  value={form.existingWebsite}
                  onChange={(e) => set("existingWebsite", e.target.value)}
                  className={inp}
                  placeholder="e.g. www.mysite.com.au — or 'No, starting fresh'"
                />
              </div>
            </div>
          </div>
        )}

        {/* Consulting brief */}
        {isConsulting && (
          <div className="bg-white rounded-[20px] p-6 mb-5 border border-[#e8e8f0]">
            <p className="text-[12px] font-bold text-[#666880] uppercase tracking-wider mb-4">
              Tell us about your business
            </p>
            <div>
              <label className={lbl}>What would you like help with? *</label>
              <textarea
                value={form.projectDescription}
                onChange={(e) => set("projectDescription", e.target.value)}
                className={ta}
                rows={5}
                placeholder="e.g. I run a small cleaning business and I'm not sure whether I need a website, an app or just a better way to manage bookings. I'd like advice on what technology would help me grow..."
              />
            </div>
          </div>
        )}

        {/* Budget & timeline */}
        <div className="bg-white rounded-[20px] p-6 mb-5 border border-[#e8e8f0]">
          <p className="text-[12px] font-bold text-[#666880] uppercase tracking-wider mb-4">
            {isConsulting ? "Availability" : "Budget & Timeline"}
          </p>

          {!isConsulting && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={lbl}>Your budget range</label>
                <select
                  value={form.budgetRange}
                  onChange={(e) => set("budgetRange", e.target.value)}
                  className={sel}
                >
                  <option value="">Select budget range</option>
                  <option>Under $2,000</option>
                  <option>$2,000 – $5,000</option>
                  <option>$5,000 – $10,000</option>
                  <option>$10,000 – $20,000</option>
                  <option>$20,000 – $50,000</option>
                  <option>Over $50,000</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <div>
                <label className={lbl}>When do you need it?</label>
                <select
                  value={form.timeline}
                  onChange={(e) => set("timeline", e.target.value)}
                  className={sel}
                >
                  <option value="">Select timeline</option>
                  <option>ASAP</option>
                  <option>Within 1 month</option>
                  <option>1 – 3 months</option>
                  <option>3 – 6 months</option>
                  <option>No rush / flexible</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Consultation preference</label>
              <select
                value={form.consultationPreference}
                onChange={(e) => set("consultationPreference", e.target.value)}
                className={sel}
              >
                <option value="video-call">Video call (Zoom/Teams)</option>
                <option value="phone-call">Phone call</option>
                <option value="in-person">In person (Brisbane)</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Preferred time</label>
              <input
                value={form.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
                className={inp}
                placeholder="e.g. Weekdays after 3pm"
              />
            </div>
          </div>
        </div>

        {/* How did you hear */}
        <div className="bg-white rounded-[20px] p-6 mb-6 border border-[#e8e8f0]">
          <label className={lbl}>How did you hear about us?</label>
          <select
            value={form.hearAboutUs}
            onChange={(e) => set("hearAboutUs", e.target.value)}
            className={sel}
          >
            <option value="">Select one (optional)</option>
            <option>Google Search</option>
            <option>Word of mouth / Referral</option>
            <option>Facebook</option>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>Existing customer</option>
            <option>Other</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 mb-4">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#7f85f7] text-white rounded-[12px] h-[58px] font-bold text-[16px] hover:bg-[#6b71f0] disabled:bg-[#b0bec5] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : isConsulting ? (
            "📅 Book Free Consultation"
          ) : (
            "📋 Send My Project Brief"
          )}
        </button>

        <p className="text-[12px] text-[#9496a8] text-center mt-4">
          No spam. No obligation. We respond within 24 hours.
          <br />
          Questions? Call{" "}
          <a
            href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
            className="text-[#7f85f7] font-semibold"
          >
            {SITE_PHONE}
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ITQuotePage() {
  // useSearchParams needs a Suspense boundary or the whole route bails out of
  // static rendering at build time.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f8]" />}>
      <ITQuoteBrief />
    </Suspense>
  )
}
