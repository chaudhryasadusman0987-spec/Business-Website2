"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Phone, Mail, MapPin, ArrowRight, ChevronRight, Check } from "lucide-react"
import BrandLogo from "@/components/ui/BrandLogo"
import {
  SITE_PHONE,
  SITE_EMAIL,
  SITE_HOURS,
  SITE_FULL,
  COMPANY_LEGAL_NAME,
  COMPANY_ABN,
  COMPANY_ACN,
  COMPANY_OFFICE_LOCALITY,
} from "@/data/site"

// Shared field styles live in globals.css (.field / .field-label).
const INPUT = "field"
const LABEL = "field-label"

const SERVICES = [
  "Security Solutions",
  "Car Rental",
  "Web Development",
  "App Development",
  "AI Automation",
  "IT Consulting",
  "Other",
]

const quickLinks = [
  { label: "Security Solutions Quote", href: "/services/security-solutions/quote" },
  // Car rental has no online quote — link to the fleet, enquiries come by phone.
  { label: "Car Rental Vehicles", href: "/services/car-rental/vehicles" },
  { label: "IT & AI Quote", href: "/services/it-services/quote" },
]

interface ContactFormData {
  fname: string
  lname: string
  email: string
  phone: string
  service: string
  message: string
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.fname} ${data.lname}`.trim(),
          email: data.email,
          phone: data.phone,
          service: data.service,
          message: data.message,
        }),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSubmitted(true)
    } catch {
      setSubmitError(`Something went wrong. Please call us at ${SITE_PHONE}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-2 text-[12px] text-muted mb-6">
            <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">Contact</span>
          </nav>
          <div className="flex justify-center mb-8">
            <BrandLogo />
          </div>
          <h1 className="text-white">
            Get In Touch
          </h1>
          <p className="text-muted text-[15px] mt-3">
            Free quotes · Fast response · Brisbane & Southeast QLD
          </p>
        </div>
      </section>

      {/* ── 2. CONTACT SECTION ── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
          {/* LEFT — form */}
          <div className="flex-1 bg-white rounded-card p-6 sm:p-10 border border-line shadow-card on-light">
            <h2 className="font-bold text-[22px] text-[#1a1a2e] mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="bg-[#e1f5ee] border border-[#5dcaa5] rounded-card p-6 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0f6e56] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </span>
                <p className="text-[#0f6e56] text-[15px] leading-relaxed">
                  Thanks! We will be in touch within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label htmlFor="contact-fname" className={LABEL}>First name *</label>
                    <input id="contact-fname" className={INPUT} placeholder="John" {...register("fname", { required: true })} />
                    {errors.fname && <p className="text-[#a32d2d] text-[12px] mt-1">First name required</p>}
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="contact-lname" className={LABEL}>Last name *</label>
                    <input id="contact-lname" className={INPUT} placeholder="Smith" {...register("lname", { required: true })} />
                    {errors.lname && <p className="text-[#a32d2d] text-[12px] mt-1">Last name required</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label htmlFor="contact-email" className={LABEL}>Email *</label>
                    <input id="contact-email" className={INPUT} placeholder="john@company.com" {...register("email", { required: true, validate: (v) => v.includes("@") })} />
                    {errors.email && <p className="text-[#a32d2d] text-[12px] mt-1">Valid email required</p>}
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="contact-phone" className={LABEL}>Phone *</label>
                    <input id="contact-phone" className={INPUT} placeholder="04XX XXX XXX" {...register("phone", { required: true })} />
                    {errors.phone && <p className="text-[#a32d2d] text-[12px] mt-1">Phone number required</p>}
                  </div>
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="contact-service" className={LABEL}>Service</label>
                  <select id="contact-service" className={`${INPUT} cursor-pointer`} defaultValue="" {...register("service")}>
                    <option value="">Select a service...</option>
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col mb-2">
                  <label htmlFor="contact-message" className={LABEL}>Message *</label>
                  <textarea id="contact-message"
                    rows={5}
                    className="field resize-y"
                    placeholder="How can we help you?"
                    {...register("message", { required: true })}
                  />
                  {errors.message && <p className="text-[#a32d2d] text-[12px] mt-1">Please enter a message</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary text-white h-12 rounded-btn font-semibold mt-2 hover:bg-brand-hover disabled:bg-[#b0bec5] disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {submitError && (
                  <p className="text-[#a32d2d] text-[13px] mt-3 text-center">{submitError}</p>
                )}
              </form>
            )}
          </div>

          {/* RIGHT — contact info */}
          <div className="lg:w-[380px] flex flex-col gap-4">
            <div className="bg-white border border-line rounded-card p-6 on-light">
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-3">
                <Phone size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Call Us</h3>
              <p className="font-semibold text-accent text-[18px]">{SITE_PHONE}</p>
              <p className="text-muted text-[13px] mt-1">{SITE_HOURS}</p>
            </div>

            <div className="bg-white border border-line rounded-card p-6 on-light">
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-3">
                <Mail size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Email Us</h3>
              <p className="font-semibold text-accent">{SITE_EMAIL}</p>
            </div>

            <div className="bg-white border border-line rounded-card p-6 on-light">
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center mb-3">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Service Area</h3>
              <p className="text-muted text-[13px] mt-1">
                Brisbane, Gold Coast, Sunshine Coast, Queensland-wide and
                Australia
              </p>
            </div>

            <div className="bg-brand-tint rounded-card p-6 mt-4 on-light">
              <p className="font-bold text-[14px] text-accent mb-4">
                Get a specific quote:
              </p>
              {quickLinks.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="w-full bg-white rounded-[10px] px-4 h-[44px] flex items-center gap-3 text-[13px] font-medium text-[#1a1a2e] border border-line hover:border-brand-primary transition-colors mb-2 on-light"
                >
                  {q.label}
                  <ArrowRight size={14} className="text-[#7f85f7] ml-auto" />
                </Link>
              ))}
            </div>
            <p className="text-[13px] text-muted mt-4 leading-relaxed">
              New to us? Meet{" "}
              <Link href="/about" className="text-accent font-medium hover:underline">
                the team behind {SITE_FULL}
              </Link>{" "}
              or{" "}
              <Link href="/testimonials" className="text-accent font-medium hover:underline">
                read customer reviews
              </Link>
              .
            </p>
            <p className="text-[13px] text-muted mt-4 leading-relaxed border-t border-line pt-4">
              <span className="font-semibold text-ink">{COMPANY_LEGAL_NAME}</span>
              <br />
              ABN {COMPANY_ABN} · ACN {COMPANY_ACN}
              <br />
              Registered office: {COMPANY_OFFICE_LOCALITY}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. MAP PLACEHOLDER ── */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 pb-[80px]">
        <div className="bg-surface rounded-card h-[200px] flex items-center justify-center text-muted text-[14px] text-center px-4 on-light">
          🗺️ Service Area: Brisbane &amp; Southeast QLD
        </div>
      </div>
    </>
  )
}
