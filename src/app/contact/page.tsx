"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Phone, Mail, MapPin, ArrowRight, ChevronRight, Check } from "lucide-react"
import { SITE_PHONE, SITE_EMAIL, SITE_HOURS } from "@/data/site"

const dotGrid = {
  backgroundImage:
    "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
}
const purpleGlow = {
  background:
    "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)",
}

const INPUT =
  "w-full border border-[#e8e8f0] rounded-[10px] h-[48px] px-4 text-[14px] " +
  "text-[#1a1a2e] outline-none transition-colors focus:border-[#7f85f7] bg-white"
const LABEL = "text-[12px] font-semibold text-[#666666] mb-1.5"

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
  { label: "Car Rental Quote", href: "/services/car-rental/quote" },
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
      <section className="relative overflow-hidden bg-[#0d0d1a] py-20 text-center">
        <div className="absolute inset-0 z-0 pointer-events-none" style={dotGrid} />
        <div
          className="absolute z-0 w-[500px] h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
          style={purpleGlow}
        />
        <div className="relative z-10 max-w-[1170px] mx-auto px-4">
          <nav className="flex items-center justify-center gap-2 text-[12px] text-[#666880] mb-6">
            <Link href="/" className="hover:text-[#7f85f7] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#9496a8]">Contact</span>
          </nav>
          <h1 className="text-white font-extrabold text-[40px] lg:text-[52px] leading-[1.1]">
            Get In Touch
          </h1>
          <p className="text-[#9496a8] text-[15px] mt-3">
            Free quotes · Fast response · Australia-wide
          </p>
        </div>
      </section>

      {/* ── 2. CONTACT SECTION ── */}
      <section className="bg-[#fefefd] pt-[80px] pb-[120px]">
        <div className="max-w-[1170px] mx-auto px-4 flex flex-col lg:flex-row gap-12">
          {/* LEFT — form */}
          <div className="flex-1 bg-white rounded-[24px] p-6 sm:p-10 border border-[#e8e8f0] shadow-sm">
            <h2 className="font-bold text-[22px] text-[#1a1a2e] mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="bg-[#e1f5ee] border border-[#5dcaa5] rounded-[14px] p-6 flex items-start gap-3">
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
                    <span className={LABEL}>First name *</span>
                    <input className={INPUT} placeholder="John" {...register("fname", { required: true })} />
                    {errors.fname && <p className="text-[#a32d2d] text-[12px] mt-1">First name required</p>}
                  </div>
                  <div className="flex flex-col">
                    <span className={LABEL}>Last name *</span>
                    <input className={INPUT} placeholder="Smith" {...register("lname", { required: true })} />
                    {errors.lname && <p className="text-[#a32d2d] text-[12px] mt-1">Last name required</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className={LABEL}>Email *</span>
                    <input className={INPUT} placeholder="john@company.com" {...register("email", { required: true, validate: (v) => v.includes("@") })} />
                    {errors.email && <p className="text-[#a32d2d] text-[12px] mt-1">Valid email required</p>}
                  </div>
                  <div className="flex flex-col">
                    <span className={LABEL}>Phone *</span>
                    <input className={INPUT} placeholder="04XX XXX XXX" {...register("phone", { required: true })} />
                    {errors.phone && <p className="text-[#a32d2d] text-[12px] mt-1">Phone number required</p>}
                  </div>
                </div>

                <div className="flex flex-col mb-4">
                  <span className={LABEL}>Service</span>
                  <select className={`${INPUT} cursor-pointer`} defaultValue="" {...register("service")}>
                    <option value="">Select a service...</option>
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col mb-2">
                  <span className={LABEL}>Message *</span>
                  <textarea
                    rows={5}
                    className="w-full border border-[#e8e8f0] rounded-[10px] px-4 py-3 text-[14px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7f85f7] bg-white resize-y"
                    placeholder="How can we help you?"
                    {...register("message", { required: true })}
                  />
                  {errors.message && <p className="text-[#a32d2d] text-[12px] mt-1">Please enter a message</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7f85f7] text-white h-[52px] rounded-[10px] font-semibold mt-2 hover:bg-[#6b71f0] disabled:bg-[#b0bec5] disabled:cursor-not-allowed transition-all"
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
            <div className="bg-white border border-[#e8e8f0] rounded-[20px] p-6">
              <div className="w-12 h-12 rounded-full bg-[#7f85f7] flex items-center justify-center mb-3">
                <Phone size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Call Us</h3>
              <p className="font-semibold text-[#7f85f7] text-[18px]">{SITE_PHONE}</p>
              <p className="text-[#666666] text-[13px] mt-1">{SITE_HOURS}</p>
            </div>

            <div className="bg-white border border-[#e8e8f0] rounded-[20px] p-6">
              <div className="w-12 h-12 rounded-full bg-[#7f85f7] flex items-center justify-center mb-3">
                <Mail size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Email Us</h3>
              <p className="font-semibold text-[#7f85f7]">{SITE_EMAIL}</p>
            </div>

            <div className="bg-white border border-[#e8e8f0] rounded-[20px] p-6">
              <div className="w-12 h-12 rounded-full bg-[#7f85f7] flex items-center justify-center mb-3">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#1a1a2e]">Service Area</h3>
              <p className="text-[#666666] text-[13px] mt-1">
                Brisbane, Gold Coast, Sunshine Coast, Queensland-wide and
                Australia
              </p>
            </div>

            <div className="bg-[#eeedfe] rounded-[20px] p-6 mt-4">
              <p className="font-bold text-[14px] text-[#534ab7] mb-4">
                Get a specific quote:
              </p>
              {quickLinks.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="w-full bg-white rounded-[10px] px-4 h-[44px] flex items-center gap-3 text-[13px] font-medium text-[#1a1a2e] border border-[#e8e8f0] hover:border-[#7f85f7] transition-colors mb-2"
                >
                  {q.label}
                  <ArrowRight size={14} className="text-[#7f85f7] ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAP PLACEHOLDER ── */}
      <div className="max-w-[1170px] mx-auto px-4 pb-[80px]">
        <div className="bg-[#f0f0ff] rounded-[24px] h-[200px] flex items-center justify-center text-[#9496a8] text-[14px] text-center px-4">
          🗺️ Service Area: Brisbane &amp; Queensland — Australia-wide delivery
        </div>
      </div>
    </>
  )
}
