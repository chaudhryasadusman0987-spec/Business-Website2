"use client"

// IT & AI SERVICES QUOTE WIZARD
// Ported from it_ai_quote_template.html
// Prices are driven by the admin dashboard via the data file.
// TODO(dashboard): prices loaded from itServiceItems packages in
//   src/data/it-services.ts — admin edits startingFromValue → tiles update here.
//
// NOTE: this wizard is PURPLE (#7f85f7), matching it_ai_quote_template.html and
// the IT & AI Services brand. (The security quote wizard stays green.)

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Check, ArrowLeft, ArrowRight } from "lucide-react"
import { itServiceItems } from "@/data/it-services"
import { SITE_NAME, SITE_SUFFIX, SITE_PHONE, SITE_EMAIL } from "@/data/site"
import { formatAUD } from "@/lib/formatters"

// ─── PRICES — loaded from data file (connects to admin dashboard) ───
const webService = itServiceItems.find((s) => s.id === "web-development")
const appService = itServiceItems.find((s) => s.id === "app-development")
const aiService = itServiceItems.find((s) => s.id === "ai-automation")

const pkgValue = (svc: typeof webService, id: string, fallback: number) =>
  svc?.packages.find((p) => p.id === id)?.startingFromValue ?? fallback

const PRICES = {
  web: {
    starter: pkgValue(webService, "web-starter", 2500),
    business: pkgValue(webService, "web-business", 5500),
    ecommerce: pkgValue(webService, "web-ecommerce", 8500),
  },
  app: {
    mvp: pkgValue(appService, "app-mvp", 8000),
    full: pkgValue(appService, "app-full", 18000),
  },
  ai: {
    chatbot: pkgValue(aiService, "ai-chatbot", 1500),
    workflow: pkgValue(aiService, "ai-workflow", 3500),
    custom: 0,
  },
  consulting: { hourly: 150 },
}

// ─── Static config ───
type ServiceKey = "web" | "app" | "ai" | "consulting"

const SERVICE_TILES: {
  key: ServiceKey
  icon: string
  name: string
  desc: string
  price: string
  badge?: string
}[] = [
  { key: "web", icon: "🌐", name: "Web Development", desc: "Website or web application", price: `${formatAUD(PRICES.web.starter)}+` },
  { key: "app", icon: "📱", name: "App Development", desc: "iOS and/or Android app", price: `${formatAUD(PRICES.app.mvp)}+` },
  { key: "ai", icon: "🤖", name: "AI Automation", desc: "Chatbot, workflows, custom AI", price: `${formatAUD(PRICES.ai.chatbot)}+`, badge: "Most Popular" },
  { key: "consulting", icon: "💡", name: "IT Consulting", desc: "Technology audit and roadmap", price: `${formatAUD(PRICES.consulting.hourly)}/hr` },
]

const SERVICE_LABELS: Record<ServiceKey, string> = {
  web: "🌐 Web Dev",
  app: "📱 App Dev",
  ai: "🤖 AI Auto",
  consulting: "💡 Consulting",
}

type Pkg = { id: string; name: string; price: number; desc: string; badge?: string; custom?: boolean }

const WEB_PACKAGES: Pkg[] = [
  { id: "starter", name: "Starter", price: PRICES.web.starter, desc: "5 pages · Contact form · SEO" },
  { id: "business", name: "Business", price: PRICES.web.business, desc: "15 pages · CMS · Analytics", badge: "Most Popular" },
  { id: "ecommerce", name: "E-Commerce", price: PRICES.web.ecommerce, desc: "Online store · Payments" },
]
const APP_PACKAGES: Pkg[] = [
  { id: "mvp", name: "MVP App", price: PRICES.app.mvp, desc: "1 platform · Core features" },
  { id: "full", name: "Full App", price: PRICES.app.full, desc: "iOS + Android · All features", badge: "Most Popular" },
]
const AI_PACKAGES: Pkg[] = [
  { id: "chatbot", name: "AI Chat Agent", price: PRICES.ai.chatbot, desc: "Website chatbot · Lead capture", badge: "Best Value" },
  { id: "workflow", name: "Workflow Automation", price: PRICES.ai.workflow, desc: "Automate manual processes" },
  { id: "custom", name: "Custom AI", price: 0, desc: "Bespoke AI solution", custom: true },
]

const PKG_NAMES: Record<string, Record<string, string>> = {
  web: { starter: "Starter", business: "Business", ecommerce: "E-Commerce" },
  app: { mvp: "MVP App", full: "Full App" },
  ai: { chatbot: "AI Chat Agent", workflow: "Workflow Automation", custom: "Custom AI" },
}

const APP_FEATURES = [
  { key: "app-login", label: "User login" },
  { key: "app-payments", label: "In-app payments" },
  { key: "app-push", label: "Push notifications" },
  { key: "app-maps", label: "Maps / location" },
  { key: "app-admin", label: "Admin dashboard" },
  { key: "app-camera", label: "Camera / media" },
]
const AI_INTEGRATIONS = [
  { key: "ai-crm", label: "CRM (HubSpot/Salesforce)" },
  { key: "ai-email", label: "Email (Gmail/Outlook)" },
  { key: "ai-website", label: "My website" },
  { key: "ai-calendar", label: "Calendar / bookings" },
  { key: "ai-docs", label: "Google Drive / Docs" },
  { key: "ai-none", label: "None yet" },
]

const BUDGET_TILES: { val: string; amt: React.ReactNode; lbl: string }[] = [
  { val: "under3k", amt: <>Under<br />$3,000</>, lbl: "Small project" },
  { val: "3k-10k", amt: <>$3k–<br />$10k</>, lbl: "Mid-range" },
  { val: "10k-30k", amt: <>$10k–<br />$30k</>, lbl: "Larger project" },
  { val: "30k+", amt: "$30k+", lbl: "Enterprise" },
]
const TIMELINE_TILES = [
  { val: "asap", icon: "⚡", name: "ASAP" },
  { val: "1month", icon: "📅", name: "Within 1 Month" },
  { val: "3months", icon: "🗓️", name: "1–3 Months" },
  { val: "flexible", icon: "🌿", name: "Flexible" },
]
const BUDGET_LABELS: Record<string, string> = {
  under3k: "Under $3,000",
  "3k-10k": "$3,000–$10,000",
  "10k-30k": "$10,000–$30,000",
  "30k+": "$30,000+",
}
const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1month": "Within 1 month",
  "3months": "1–3 months",
  flexible: "Flexible",
}

// Ranges shown in summary (1.35× the starting price, rounded to $500)
function calcRange(base: number): string {
  if (!base) return "Custom quote"
  const high = Math.round((base * 1.35) / 500) * 500
  return `${formatAUD(base)} – ${formatAUD(high)}`
}

interface ContactForm {
  fname: string
  lname: string
  email: string
  phone: string
  company: string
  suburb: string
  description: string
  source: string
}

const TOTAL = 5

// Shared input styles
const INPUT =
  "w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] h-[48px] px-4 text-[14px] " +
  "text-[#1a1a2e] outline-none transition-colors focus:border-[#7f85f7] bg-white"
const LABEL =
  "text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-1.5"

function QuoteWizard() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(0)
  const [selectedServices, setSelectedServices] = useState<ServiceKey[]>([])
  const [activeTab, setActiveTab] = useState<ServiceKey | null>(null)

  const [webPkg, setWebPkg] = useState<{ id: string; price: number } | null>(null)
  const [appPkg, setAppPkg] = useState<{ id: string; price: number } | null>(null)
  const [aiPkg, setAiPkg] = useState<{ id: string; price: number } | null>(null)

  const [appFeatures, setAppFeatures] = useState<string[]>([])
  const [aiIntegrations, setAiIntegrations] = useState<string[]>([])

  const [webPages, setWebPages] = useState("")
  const [webDeadline, setWebDeadline] = useState("")
  const [webDomain, setWebDomain] = useState("")
  const [webContent, setWebContent] = useState("")
  const [appPlatform, setAppPlatform] = useState("")
  const [appType, setAppType] = useState("")
  const [aiPurpose, setAiPurpose] = useState("")
  const [aiVolume, setAiVolume] = useState("")
  const [conTopic, setConTopic] = useState("")
  const [conHours, setConHours] = useState("")
  const [conFormat, setConFormat] = useState("")

  const [budget, setBudget] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<string | null>(null)

  const [errService, setErrService] = useState(false)
  const [errBudget, setErrBudget] = useState(false)
  const [errTimeline, setErrTimeline] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ContactForm>()

  // Pre-select a service from ?service= param
  useEffect(() => {
    const svc = searchParams.get("service")
    if (svc && ["web", "app", "ai", "consulting"].includes(svc)) {
      setSelectedServices([svc as ServiceKey])
    }
  }, [searchParams])

  // ─── Toggle helpers ───
  const toggleService = (key: ServiceKey) => {
    setErrService(false)
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }
  const toggleArr = (
    arr: string[],
    setArr: (v: string[]) => void,
    key: string
  ) => setArr(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key])

  // ─── Quote calculation ───
  const calcTotal = (): number => {
    let total = 0
    if (selectedServices.includes("web")) total += webPkg?.price ?? PRICES.web.starter
    if (selectedServices.includes("app")) total += appPkg?.price ?? PRICES.app.mvp
    if (selectedServices.includes("ai") && aiPkg?.id !== "custom")
      total += aiPkg?.price ?? PRICES.ai.chatbot
    if (selectedServices.includes("consulting"))
      total += PRICES.consulting.hourly * 2
    return total
  }

  // ─── Navigation ───
  const goNext = async () => {
    if (step === 0) {
      if (selectedServices.length === 0) {
        setErrService(true)
        return
      }
      setActiveTab(selectedServices[0])
    }
    if (step === 2) {
      const noBudget = !budget
      const noTimeline = !timeline
      setErrBudget(noBudget)
      setErrTimeline(noTimeline)
      if (noBudget || noTimeline) return
    }
    if (step === 3) {
      const ok = await trigger(["fname", "lname", "email", "phone", "description"])
      if (!ok) return
    }
    setStep((s) => Math.min(s + 1, TOTAL - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ─── Submit ───
  const onSubmit = async (contactData: ContactForm) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        services: selectedServices,
        packages: { web: webPkg, app: appPkg, ai: aiPkg },
        details: {
          web: { webPages, webDeadline, webDomain, webContent },
          app: { appPlatform, appType, appFeatures },
          ai: { aiPurpose, aiVolume, aiIntegrations },
          consulting: { conTopic, conHours, conFormat },
        },
        budget,
        timeline,
        contact: contactData,
        estimate: { total: calcTotal(), range: calcRange(calcTotal()) },
        timestamp: new Date().toISOString(),
        page: "/services/it-services/quote",
        source: "quote_form",
      }
      const res = await fetch("/api/quote/it-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setSubmitError(`Failed to send. Please call us directly at ${SITE_PHONE}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = calcTotal()
  const range = calcRange(total)

  // ─── Small render helpers ───
  const PkgCard = ({
    pkg,
    selected,
    onClick,
  }: {
    pkg: Pkg
    selected: boolean
    onClick: () => void
  }) => (
    <div
      onClick={onClick}
      className={`relative border-[1.5px] rounded-[12px] p-4 cursor-pointer transition-all duration-200 select-none ${
        selected ? "border-[#7f85f7] bg-[#eeedfe]" : "border-[#e0e0e8] hover:border-[#b0b4fb]"
      }`}
    >
      {pkg.badge && (
        <span className="absolute -top-[9px] left-1/2 -translate-x-1/2 bg-[#7f85f7] text-white text-[9px] font-bold px-[10px] py-[2px] rounded-full whitespace-nowrap">
          {pkg.badge}
        </span>
      )}
      <div className="text-[13px] font-semibold text-[#1a1a2e] mt-1">{pkg.name}</div>
      <div className="text-[15px] font-bold text-[#7f85f7] mt-1">
        {pkg.custom ? "Custom quote" : `${formatAUD(pkg.price)}+`}
      </div>
      <div className="text-[11px] text-[#666880] mt-[3px] leading-[1.4]">{pkg.desc}</div>
    </div>
  )

  const Select = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: string[]
  }) => (
    <div className="flex flex-col">
      <div className={LABEL}>{label}</div>
      <select
        className={`${INPUT} cursor-pointer`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )

  const FeatureItem = ({
    label,
    selected,
    onClick,
  }: {
    label: string
    selected: boolean
    onClick: () => void
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 text-[13px] cursor-pointer px-[10px] py-1.5 border-[1.5px] rounded-[8px] transition-all duration-200 select-none ${
        selected
          ? "border-[#7f85f7] bg-[#eeedfe] text-[#534ab7]"
          : "border-[#e0e0e8] text-[#1a1a2e] hover:border-[#b0b4fb]"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-[4px] border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? "bg-[#7f85f7] border-[#7f85f7]" : "border-[#e0e0e8]"
        }`}
      >
        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </div>
  )

  // ─── SUCCESS SCREEN ───
  if (submitted) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen py-12 px-4">
        <div className="max-w-[760px] mx-auto bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="py-12 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#eeedfe] flex items-center justify-center mx-auto mb-5">
              <Check size={40} className="text-[#7f85f7]" strokeWidth={2.5} />
            </div>
            <div className="text-[24px] font-bold text-[#1a1a2e] mb-2">
              Quote Request Sent!
            </div>
            <p className="text-[15px] text-[#666880] mt-3 leading-relaxed mb-6">
              Your estimate has been emailed to you. Our team will call you within{" "}
              <strong>1 business day</strong> to discuss your project and provide a
              fixed quote.
            </p>

            <div className="bg-[#f9f9ff] border-[1.5px] border-[#c5c8fd] rounded-[14px] p-5 text-left mb-5">
              <div className="text-[13px] font-bold text-[#534ab7] mb-2.5">
                📋 Your estimate summary
              </div>
              {selectedServices.map((svc) => (
                <div
                  key={svc}
                  className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]"
                >
                  <span>{SERVICE_LABELS[svc]}</span>
                </div>
              ))}
              <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                <span>Indicative range</span>
                <span className="font-bold text-[#7f85f7]">{range}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5">
                <span>GST additional</span>
                <span>+10%</span>
              </div>
            </div>

            <span className="bg-[#eeedfe] text-[#534ab7] rounded-full px-5 py-1.5 text-[13px] font-semibold inline-block">
              ⏱️ Estimate valid for 7 days
            </span>

            <p className="text-[13px] text-[#666880] mt-5">
              Questions? Call us at <strong>{SITE_PHONE}</strong>
              <br />
              or email <strong>{SITE_EMAIL}</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── WIZARD ───
  return (
    <div className="bg-[#f5f5f5] min-h-screen py-12 px-4">
      <div className="max-w-[760px] mx-auto bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#7f85f7] px-8 py-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-[10px] flex items-center justify-center text-[20px]">
            💻
          </div>
          <div>
            <div className="text-[18px] font-semibold text-white">
              {SITE_NAME} <span className="text-[#c5c8fd]">{SITE_SUFFIX}</span>
            </div>
            <div className="text-[11px] text-white/65 mt-0.5">IT & AI Services Quote</div>
          </div>
          <div className="ml-auto text-right leading-normal">
            <div className="text-[11px] text-white font-medium">Free Consultation</div>
            <div className="text-[11px] text-white/65">No obligation</div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="px-8 pt-5">
          <div className="flex gap-[6px] mb-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={`h-[4px] flex-1 rounded-full transition-colors duration-300 ${
                  i < step ? "bg-[#5dcaa5]" : i === step ? "bg-[#7f85f7]" : "bg-[#e0e0e8]"
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] text-[#666880] mb-5">
            Step {step + 1} of {TOTAL}
          </div>
        </div>

        {/* STEPS */}
        <div className="px-8 sm:px-8 max-sm:px-5 pb-6">
          {/* STEP 0 — SERVICE SELECTION */}
          {step === 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[#7f85f7] uppercase tracking-[0.07em] pt-6 mb-1">
                Step 1 of 5
              </div>
              <div className="text-[20px] font-semibold text-[#1a1a2e] mb-1.5 leading-[1.3]">
                What services do you need?
              </div>
              <div className="text-[13px] text-[#666880] mb-6 leading-[1.6]">
                Select one or more — you can combine services
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mb-5">
                {SERVICE_TILES.map((t) => {
                  const sel = selectedServices.includes(t.key)
                  return (
                    <div
                      key={t.key}
                      onClick={() => toggleService(t.key)}
                      className={`relative flex items-start gap-3 border-[1.5px] rounded-[14px] p-4 cursor-pointer transition-all duration-200 select-none ${
                        sel
                          ? "border-[#7f85f7] bg-[#eeedfe]"
                          : "border-[#e0e0e8] hover:border-[#b0b4fb] hover:bg-[#f9f9ff]"
                      }`}
                    >
                      {t.badge && (
                        <span className="absolute top-2 right-2 bg-[#7f85f7] text-white text-[9px] font-bold px-2 py-[2px] rounded-full">
                          {t.badge}
                        </span>
                      )}
                      <span
                        className={`w-[18px] h-[18px] rounded-[5px] border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          sel ? "bg-[#7f85f7] border-[#7f85f7]" : "border-[#e0e0e8]"
                        }`}
                      >
                        {sel && <Check size={11} className="text-white" strokeWidth={3} />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[22px] mb-1.5">{t.icon}</span>
                        <span
                          className={`block text-[14px] font-semibold ${
                            sel ? "text-[#534ab7]" : "text-[#1a1a2e]"
                          }`}
                        >
                          {t.name}
                        </span>
                        <span className="block text-[12px] text-[#666880] mt-0.5 leading-[1.4]">
                          {t.desc}
                        </span>
                        <span className="block text-[12px] font-semibold text-[#7f85f7] mt-1">
                          {t.price}
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="bg-[#eeedfe] border-l-[3px] border-[#7f85f7] rounded-r-[10px] px-[14px] py-2.5 text-[12px] text-[#534ab7] leading-[1.6] mb-4">
                💡 Not sure which service you need? Select <strong>IT Consulting</strong>{" "}
                and our team will help you choose the right path in a free 30-minute call.
              </div>

              {errService && (
                <p className="text-[#a32d2d] text-[12px] mt-1">
                  Please select at least one service.
                </p>
              )}
            </div>
          )}

          {/* STEP 1 — SERVICE DETAILS */}
          {step === 1 && (
            <div>
              <div className="text-[11px] font-semibold text-[#7f85f7] uppercase tracking-[0.07em] pt-6 mb-1">
                Step 2 of 5
              </div>
              <div className="text-[20px] font-semibold text-[#1a1a2e] mb-1.5 leading-[1.3]">
                Tell us about your project
              </div>
              <div className="text-[13px] text-[#666880] mb-6 leading-[1.6]">
                Fill in the details for each selected service
              </div>

              {/* tabs */}
              <div className="flex gap-[6px] mb-4 flex-wrap">
                {selectedServices.map((svc) => (
                  <div
                    key={svc}
                    onClick={() => setActiveTab(svc)}
                    className={`px-[14px] py-1.5 rounded-full text-[12px] font-medium border-[1.5px] cursor-pointer transition-all duration-200 ${
                      activeTab === svc
                        ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                        : "border-[#e0e0e8] text-[#666880] hover:border-[#b0b4fb]"
                    }`}
                  >
                    {SERVICE_LABELS[svc]}
                  </div>
                ))}
              </div>

              {/* WEB PANEL */}
              {activeTab === "web" && (
                <div>
                  <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2.5">
                    Which package suits you best?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] mb-4">
                    {WEB_PACKAGES.map((p) => (
                      <PkgCard
                        key={p.id}
                        pkg={p}
                        selected={webPkg?.id === p.id}
                        onClick={() => setWebPkg({ id: p.id, price: p.price })}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Select label="Number of pages" value={webPages} onChange={setWebPages} options={["1–5 pages", "6–15 pages", "15+ pages"]} />
                    <Select label="Deadline" value={webDeadline} onChange={setWebDeadline} options={["ASAP", "Within 1 month", "1–3 months", "Flexible"]} />
                    <Select label="Do you have a domain?" value={webDomain} onChange={setWebDomain} options={["Yes — I have one", "No — I need one", "Not sure"]} />
                    <Select label="Existing content ready?" value={webContent} onChange={setWebContent} options={["Yes — content is ready", "No — need help with content", "Partially ready"]} />
                  </div>
                </div>
              )}

              {/* APP PANEL */}
              {activeTab === "app" && (
                <div>
                  <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2.5">
                    Which package suits you best?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mb-4">
                    {APP_PACKAGES.map((p) => (
                      <PkgCard
                        key={p.id}
                        pkg={p}
                        selected={appPkg?.id === p.id}
                        onClick={() => setAppPkg({ id: p.id, price: p.price })}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Select label="Platform needed" value={appPlatform} onChange={setAppPlatform} options={["iOS only", "Android only", "Both iOS + Android"]} />
                    <Select label="App type" value={appType} onChange={setAppType} options={["Customer-facing app", "Internal business tool", "Marketplace or platform", "Other"]} />
                  </div>
                  <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2">
                    Key features needed (select all that apply)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {APP_FEATURES.map((f) => (
                      <FeatureItem
                        key={f.key}
                        label={f.label}
                        selected={appFeatures.includes(f.key)}
                        onClick={() => toggleArr(appFeatures, setAppFeatures, f.key)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* AI PANEL */}
              {activeTab === "ai" && (
                <div>
                  <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2.5">
                    Which package suits you best?
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] mb-4">
                    {AI_PACKAGES.map((p) => (
                      <PkgCard
                        key={p.id}
                        pkg={p}
                        selected={aiPkg?.id === p.id}
                        onClick={() => setAiPkg({ id: p.id, price: p.price })}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Select label="Primary purpose" value={aiPurpose} onChange={setAiPurpose} options={["Customer support / FAQ answering", "Lead collection", "Document processing", "Email automation", "Data analysis", "Custom / not sure"]} />
                    <Select label="Expected volume" value={aiVolume} onChange={setAiVolume} options={["Under 100 interactions/day", "100–1,000 per day", "1,000+ per day", "Not sure"]} />
                  </div>
                  <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2">
                    Integrate with (select all that apply)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {AI_INTEGRATIONS.map((f) => (
                      <FeatureItem
                        key={f.key}
                        label={f.label}
                        selected={aiIntegrations.includes(f.key)}
                        onClick={() => toggleArr(aiIntegrations, setAiIntegrations, f.key)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CONSULTING PANEL */}
              {activeTab === "consulting" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select label="Topic" value={conTopic} onChange={setConTopic} options={["Technology audit and review", "Software selection advice", "Cybersecurity assessment", "Digital transformation roadmap", "IT infrastructure review", "Staff technology training", "Other"]} />
                  <Select label="Hours needed" value={conHours} onChange={setConHours} options={["1–2 hours", "Half day (4 hours)", "Full day (8 hours)", "Ongoing / retainer"]} />
                  <Select label="Format" value={conFormat} onChange={setConFormat} options={["Phone / video call", "On-site (Brisbane)", "Remote"]} />
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — BUDGET & TIMELINE */}
          {step === 2 && (
            <div>
              <div className="text-[11px] font-semibold text-[#7f85f7] uppercase tracking-[0.07em] pt-6 mb-1">
                Step 3 of 5
              </div>
              <div className="text-[20px] font-semibold text-[#1a1a2e] mb-1.5 leading-[1.3]">
                Budget &amp; timeline
              </div>
              <div className="text-[13px] text-[#666880] mb-6 leading-[1.6]">
                Helps us send you the most relevant proposal
              </div>

              <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mb-2.5">
                What is your approximate budget?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {BUDGET_TILES.map((b) => {
                  const sel = budget === b.val
                  return (
                    <div
                      key={b.val}
                      onClick={() => {
                        setBudget(b.val)
                        setErrBudget(false)
                      }}
                      className={`border-[1.5px] rounded-[12px] py-3.5 px-2 text-center cursor-pointer transition-all duration-200 select-none ${
                        sel ? "border-[#7f85f7] bg-[#eeedfe]" : "border-[#e0e0e8] hover:border-[#b0b4fb]"
                      }`}
                    >
                      <div className={`text-[13px] font-bold leading-[1.3] ${sel ? "text-[#534ab7]" : "text-[#1a1a2e]"}`}>
                        {b.amt}
                      </div>
                      <div className="text-[10px] text-[#666880] mt-0.5">{b.lbl}</div>
                    </div>
                  )
                })}
              </div>

              <div className="text-[12px] font-semibold text-[#666880] uppercase tracking-[0.04em] mt-5 mb-2.5">
                When do you need this delivered?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {TIMELINE_TILES.map((t) => {
                  const sel = timeline === t.val
                  return (
                    <div
                      key={t.val}
                      onClick={() => {
                        setTimeline(t.val)
                        setErrTimeline(false)
                      }}
                      className={`border-[1.5px] rounded-[12px] py-3.5 px-2 text-center cursor-pointer transition-all duration-200 select-none ${
                        sel ? "border-[#7f85f7] bg-[#eeedfe]" : "border-[#e0e0e8] hover:border-[#b0b4fb]"
                      }`}
                    >
                      <div className="text-[20px] mb-1">{t.icon}</div>
                      <div className={`text-[12px] font-semibold leading-[1.3] ${sel ? "text-[#534ab7]" : "text-[#1a1a2e]"}`}>
                        {t.name}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-[#eeedfe] border-l-[3px] border-[#7f85f7] rounded-r-[10px] px-[14px] py-2.5 text-[12px] text-[#534ab7] leading-[1.6] mb-4">
                💡 Your budget range helps us tailor the proposal — it does{" "}
                <strong>not</strong> affect whether we contact you. We work with all
                budgets.
              </div>

              {errBudget && (
                <p className="text-[#a32d2d] text-[12px] mt-1">Please select a budget range.</p>
              )}
              {errTimeline && (
                <p className="text-[#a32d2d] text-[12px] mt-1">Please select a timeline.</p>
              )}
            </div>
          )}

          {/* STEP 3 — CONTACT DETAILS */}
          {step === 3 && (
            <div>
              <div className="text-[11px] font-semibold text-[#7f85f7] uppercase tracking-[0.07em] pt-6 mb-1">
                Step 4 of 5
              </div>
              <div className="text-[20px] font-semibold text-[#1a1a2e] mb-1.5 leading-[1.3]">
                Your contact details
              </div>
              <div className="text-[13px] text-[#666880] mb-6 leading-[1.6]">
                We will call you within 1 business day
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col">
                  <div className={LABEL}>First name *</div>
                  <input className={INPUT} placeholder="John" {...register("fname", { required: true })} />
                  {errors.fname && <p className="text-[#a32d2d] text-[12px] mt-1">First name required</p>}
                </div>
                <div className="flex flex-col">
                  <div className={LABEL}>Last name *</div>
                  <input className={INPUT} placeholder="Smith" {...register("lname", { required: true })} />
                  {errors.lname && <p className="text-[#a32d2d] text-[12px] mt-1">Last name required</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col">
                  <div className={LABEL}>Email address *</div>
                  <input className={INPUT} placeholder="john@company.com" {...register("email", { required: true, validate: (v) => v.includes("@") })} />
                  {errors.email && <p className="text-[#a32d2d] text-[12px] mt-1">Valid email required</p>}
                </div>
                <div className="flex flex-col">
                  <div className={LABEL}>Phone number *</div>
                  <input className={INPUT} placeholder="04XX XXX XXX" {...register("phone", { required: true })} />
                  {errors.phone && <p className="text-[#a32d2d] text-[12px] mt-1">Phone number required</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col">
                  <div className={LABEL}>Company name</div>
                  <input className={INPUT} placeholder="Optional" {...register("company")} />
                </div>
                <div className="flex flex-col">
                  <div className={LABEL}>Suburb / City</div>
                  <input className={INPUT} placeholder="Brisbane, 4000" {...register("suburb")} />
                </div>
              </div>

              <div className="flex flex-col mb-3">
                <div className={LABEL}>Describe your project *</div>
                <textarea
                  rows={4}
                  className="w-full border-[1.5px] border-[#e0e0e8] rounded-[10px] px-4 py-3 text-[14px] text-[#1a1a2e] outline-none transition-colors focus:border-[#7f85f7] bg-white resize-y"
                  placeholder="Tell us what you are trying to build or solve. The more detail, the better our proposal."
                  {...register("description", { required: true })}
                />
                {errors.description && <p className="text-[#a32d2d] text-[12px] mt-1">Please describe your project</p>}
              </div>

              <div className="flex flex-col">
                <div className={LABEL}>How did you hear about us?</div>
                <select className={`${INPUT} cursor-pointer`} {...register("source")}>
                  <option value="">Select...</option>
                  <option>Google Search</option>
                  <option>Social Media</option>
                  <option>Friend or Colleague</option>
                  <option>Saw your ad</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4 — REVIEW & SUBMIT */}
          {step === 4 && (
            <div>
              <div className="text-[11px] font-semibold text-[#7f85f7] uppercase tracking-[0.07em] pt-6 mb-1">
                Step 5 of 5
              </div>
              <div className="text-[20px] font-semibold text-[#1a1a2e] mb-1.5 leading-[1.3]">
                Review your quote estimate
              </div>
              <div className="text-[13px] text-[#666880] mb-6 leading-[1.6]">
                This is an estimate — a fixed quote is provided after your free
                consultation
              </div>

              <div className="bg-[#f9f9ff] border-[1.5px] border-[#c5c8fd] rounded-[16px] p-5 mb-6">
                <div className="text-[14px] font-bold text-[#534ab7] mb-3 pb-2 border-b border-[#c5c8fd]">
                  📋 Quote Estimate
                </div>

                <div className="text-[10px] font-bold text-[#666880] uppercase tracking-[0.06em] pt-2.5 pb-1 border-b border-[#ddd] mt-1">
                  Selected Services
                </div>
                {selectedServices.map((svc) => {
                  let name: string = SERVICE_LABELS[svc]
                  let price = ""
                  if (svc === "web" && webPkg) {
                    name += ` — ${PKG_NAMES.web[webPkg.id] ?? ""}`
                    price = webPkg.price ? `From ${formatAUD(webPkg.price)}` : "—"
                  } else if (svc === "app" && appPkg) {
                    name += ` — ${PKG_NAMES.app[appPkg.id] ?? ""}`
                    price = appPkg.price ? `From ${formatAUD(appPkg.price)}` : "—"
                  } else if (svc === "ai" && aiPkg) {
                    name += ` — ${PKG_NAMES.ai[aiPkg.id] ?? ""}`
                    price = aiPkg.id === "custom" ? "Custom quote" : aiPkg.price ? `From ${formatAUD(aiPkg.price)}` : "—"
                  } else if (svc === "consulting") {
                    price = `${formatAUD(PRICES.consulting.hourly)}/hr`
                  }
                  return (
                    <div key={svc} className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                      <span>{name}</span>
                      <span>{price}</span>
                    </div>
                  )
                })}

                <div className="text-[10px] font-bold text-[#666880] uppercase tracking-[0.06em] pt-2.5 pb-1 border-b border-[#ddd] mt-1">
                  Project Details
                </div>
                <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                  <span>Budget range</span>
                  <span>{budget ? BUDGET_LABELS[budget] : "—"}</span>
                </div>
                <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                  <span>Timeline</span>
                  <span>{timeline ? TIMELINE_LABELS[timeline] : "—"}</span>
                </div>
                <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                  <span>Contact</span>
                  <span>{`${getValues("fname") ?? ""} ${getValues("lname") ?? ""}`.trim() || "—"}</span>
                </div>

                <div className="text-[10px] font-bold text-[#666880] uppercase tracking-[0.06em] pt-2.5 pb-1 border-b border-[#ddd] mt-1">
                  Estimate
                </div>
                <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5 border-b border-[#eeeeff]">
                  <span>Combined starting from</span>
                  <span>{total ? formatAUD(total) : "Custom"}</span>
                </div>
                <div className="flex justify-between text-[13px] text-[#534ab7] py-1.5">
                  <span>GST (10%) additional</span>
                  <span>+10%</span>
                </div>

                <div className="flex justify-between text-[16px] font-bold text-[#534ab7] pt-2.5 pb-1.5 border-t-2 border-[#c5c8fd] mt-1.5">
                  <span>Indicative range</span>
                  <span className="text-[#7f85f7]">{range}</span>
                </div>

                {/* TODO(dashboard): prices loaded from itServiceItems in
                    src/data/it-services.ts — admin updates packages → reflects here */}
                <div className="text-[11px] text-[#666880] mt-2.5 pt-2.5 border-t border-[#eeeeff] leading-[1.6]">
                  ⚠️ This is an <strong>estimate only</strong>, not a fixed price. Final
                  pricing is confirmed after a free 30-minute consultation. All prices
                  ex-GST.
                </div>

                <span className="bg-[#eeedfe] text-[#534ab7] rounded-full px-[14px] py-1 text-[11px] font-semibold inline-block mt-2.5 w-full text-center">
                  ✓ Estimate valid for 7 days
                </span>
              </div>

              <div className="bg-[#e1f5ee] border-l-[3px] border-[#0f6e56] rounded-r-[10px] px-[14px] py-2.5 text-[12px] text-[#0f6e56] leading-[1.6] mb-4">
                ✅ Once you submit, our team will call you within{" "}
                <strong>1 business day</strong> to discuss your project and provide a
                fixed quote. No payment required at this stage.
              </div>

              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-[#7f85f7] text-white rounded-[10px] w-full h-[52px] font-bold text-[15px] mt-2 hover:bg-[#6b71f0] disabled:bg-[#b0bec5] disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? "⏳ Sending..." : "📧 Send My Quote Request"}
              </button>

              {submitError && (
                <p className="text-[#a32d2d] text-[12px] mt-2 text-center">{submitError}</p>
              )}
            </div>
          )}
        </div>

        {/* NAV ROW */}
        <div className="flex justify-between items-center px-8 py-5 border-t border-[#e0e0e8] bg-[#fafaff]">
          <button
            type="button"
            onClick={goBack}
            className={`text-[#666880] text-[14px] font-medium cursor-pointer flex items-center gap-1.5 hover:text-[#1a1a2e] transition-colors ${
              step === 0 ? "invisible" : ""
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {step < TOTAL - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="bg-[#7f85f7] text-white rounded-[10px] h-[48px] px-7 font-semibold text-[15px] hover:bg-[#6b71f0] transition-all flex items-center gap-2"
            >
              Next Step <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ITQuoteForm() {
  return (
    <Suspense fallback={null}>
      <QuoteWizard />
    </Suspense>
  )
}
