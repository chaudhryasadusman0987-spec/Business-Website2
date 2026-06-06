"use client"

import { useState, useEffect } from "react"
import { securitySolutions } from "@/data/security-solutions"
import { vehicles } from "@/data/car-rental"
import { itServiceItems } from "@/data/it-services"
import { SITE_FULL } from "@/data/site"
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  Monitor,
  Users,
  LogOut,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

/* ───────────────────────── Types ───────────────────────── */

interface Lead {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  fname?: string
  lname?: string
  email?: string
  phone?: string
  company?: string
  service?: string
  message?: string
  notes?: string
  description?: string
  date?: string
  createdAt?: string
  timestamp?: string
  source?: string
  status?: string
  [key: string]: unknown
}

type SecEdit = { price: number; image: string; badge: string; inStock: boolean }
type VehEdit = {
  dailyRate: number
  weeklyRate: number
  bond: number
  image: string
  badge: string
  inStock: boolean
}
type PkgEdit = {
  startingFromValue: number
  startingFrom: string
  image: string
  badge: string
}

/* ──────────────────── Initial edit state ──────────────────── */

function initSecEdits(): Record<string, SecEdit> {
  const out: Record<string, SecEdit> = {}
  securitySolutions.forEach((sol) =>
    sol.products.forEach((p) => {
      out[`${sol.id}:${p.id}`] = {
        price: p.price,
        image: p.image ?? "",
        badge: p.badge ?? "",
        inStock: p.inStock,
      }
    })
  )
  return out
}

function initVehEdits(): Record<string, VehEdit> {
  const out: Record<string, VehEdit> = {}
  vehicles.forEach((v) => {
    out[v.id] = {
      dailyRate: v.dailyRate,
      weeklyRate: v.weeklyRate,
      bond: v.bond,
      image: v.image ?? "",
      badge: v.badge ?? "",
      inStock: v.inStock,
    }
  })
  return out
}

function initPkgEdits(): Record<string, PkgEdit> {
  const out: Record<string, PkgEdit> = {}
  itServiceItems.forEach((svc) =>
    svc.packages.forEach((p) => {
      out[`${svc.id}:${p.id}`] = {
        startingFromValue: p.startingFromValue,
        startingFrom: p.startingFrom,
        image: (p as { image?: string }).image ?? "",
        badge: p.badge ?? "",
      }
    })
  )
  return out
}

/* ───────────────────────── Helpers ───────────────────────── */

function leadName(l: Lead): string {
  if (l.name) return l.name
  const joined = [l.firstName ?? l.fname, l.lastName ?? l.lname]
    .filter(Boolean)
    .join(" ")
  return joined || "—"
}

function leadMessage(l: Lead): string {
  return (l.message ?? l.notes ?? l.description ?? "") as string
}

function leadTime(l: Lead): number {
  const v = l.date ?? l.createdAt ?? l.timestamp
  const t = v ? new Date(v).getTime() : 0
  return isNaN(t) ? 0 : t
}

function formatDate(l: Lead): string {
  const v = l.date ?? l.createdAt ?? l.timestamp
  if (!v) return "—"
  const d = new Date(v)
  if (isNaN(d.getTime())) return String(v)
  const day = d.getDate()
  const month = d.toLocaleString("en-AU", { month: "short" })
  const year = d.getFullYear()
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  const mm = m.toString().padStart(2, "0")
  return `${day} ${month} ${year} · ${h}:${mm}${ampm}`
}

function serviceBadge(service?: string): { bg: string; text: string; emoji: string } {
  const s = (service ?? "").toLowerCase()
  if (s.includes("security"))
    return { bg: "bg-[rgba(245,124,0,0.12)]", text: "text-[#b45a00]", emoji: "🛡️" }
  if (s.includes("car"))
    return { bg: "bg-[rgba(76,175,80,0.12)]", text: "text-[#2e7d32]", emoji: "🚗" }
  if (s.includes("web") || s.includes("app") || s.includes("ai") || s.includes("it"))
    return { bg: "bg-[#eeedfe]", text: "text-[#534ab7]", emoji: "💻" }
  if (s.includes("chat"))
    return { bg: "bg-[rgba(15,110,86,0.12)]", text: "text-[#0f6e56]", emoji: "💬" }
  return { bg: "bg-[#f0f0f4]", text: "text-[#666880]", emoji: "✉️" }
}

function sourcePill(source?: string): { label: string; cls: string } {
  const s = (source ?? "").toLowerCase()
  if (s.includes("quote"))
    return { label: "Quote Form", cls: "bg-[#eeedfe] text-[#534ab7]" }
  if (s.includes("ai_chat") || s.includes("chat"))
    return { label: "AI Chat", cls: "bg-[rgba(15,110,86,0.12)] text-[#0f6e56]" }
  if (s.includes("contact"))
    return { label: "Contact Form", cls: "bg-[#f0f0f4] text-[#666880]" }
  return { label: source || "—", cls: "bg-[#f0f0f4] text-[#666880]" }
}

const STATUSES = ["New", "Contacted", "Quoted", "Won", "Lost"]
function statusColor(status?: string): string {
  switch ((status ?? "New").toLowerCase()) {
    case "contacted":
      return "text-[#b45a00] border-[#f0a868] bg-[rgba(245,124,0,0.08)]"
    case "quoted":
      return "text-[#534ab7] border-[#b0b4fb] bg-[#eeedfe]"
    case "won":
      return "text-[#2e7d32] border-[#8cc98f] bg-[rgba(76,175,80,0.08)]"
    case "lost":
      return "text-[#c62828] border-[#e58a8a] bg-[rgba(198,40,40,0.06)]"
    default:
      return "text-[#1565c0] border-[#90caf9] bg-[#e6f1fb]"
  }
}

/* ───────────────────────── Component ───────────────────────── */

export default function DashboardPage() {
  // password gate
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")
  const [pwError, setPwError] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // navigation
  const [tab, setTab] = useState("overview")
  const [secTab, setSecTab] = useState(securitySolutions[0].id)
  const [itTab, setItTab] = useState("web-development")

  // editable data
  const [secEdits, setSecEdits] = useState<Record<string, SecEdit>>(initSecEdits)
  const [vehEdits, setVehEdits] = useState<Record<string, VehEdit>>(initVehEdits)
  const [pkgEdits, setPkgEdits] = useState<Record<string, PkgEdit>>(initPkgEdits)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  // leads
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [leadsFilter, setLeadsFilter] = useState("All")

  useEffect(() => {
    if (localStorage.getItem("dash_auth") === "true") setAuthed(true)
  }, [])

  const loadLeads = () => {
    setLeadsLoading(true)
    fetch("/api/dashboard/leads")
      .then((r) => r.json())
      .then((data) => {
        const arr: Lead[] = (data.leads ?? []) as Lead[]
        arr.sort((a, b) => leadTime(b) - leadTime(a))
        setLeads(arr)
        setLeadsLoading(false)
      })
      .catch(() => setLeadsLoading(false))
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const login = () => {
    console.log("Env var:", process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD)
    console.log("Entered:", pw)
    if (pw === process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD) {
      localStorage.setItem("dash_auth", "true")
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
      setPw("")
    }
  }

  const logout = () => {
    localStorage.removeItem("dash_auth")
    setAuthed(false)
  }

  const save = async (payload: Record<string, unknown>, key: string) => {
    try {
      const res = await fetch("/api/dashboard/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSavedKey(key)
        setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000)
      }
    } catch {
      /* prototype — silently ignore */
    }
  }

  const updateStatus = async (leadId: string | undefined, status: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    )
    if (!leadId) return
    try {
      await fetch("/api/dashboard/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      })
    } catch {
      /* ignore */
    }
  }

  /* ─────────── counts & filters ─────────── */
  const countWhere = (fn: (s: string) => boolean) =>
    leads.filter((l) => fn((l.service ?? "").toLowerCase())).length
  const securityCount = countWhere((s) => s.includes("security"))
  const carCount = countWhere((s) => s.includes("car"))
  const itCount = countWhere(
    (s) => s.includes("it") || s.includes("web") || s.includes("app") || s.includes("ai")
  )

  const matchesFilter = (l: Lead, f: string): boolean => {
    const svc = (l.service ?? "").toLowerCase()
    const src = (l.source ?? "").toLowerCase()
    switch (f) {
      case "Security":
        return svc.includes("security")
      case "Car Rental":
        return svc.includes("car")
      case "IT & AI":
        return (
          svc.includes("it") || svc.includes("web") || svc.includes("app") || svc.includes("ai")
        )
      case "Contact":
        return src.includes("contact")
      case "AI Chat":
        return src.includes("ai_chat") || src.includes("chat")
      default:
        return true
    }
  }

  const filteredLeads = leads.filter((l) => matchesFilter(l, leadsFilter))
  const enquiries = leads.filter((l) => (l.source ?? "").toLowerCase().includes("contact"))

  /* ─────────────────────── PASSWORD GATE ─────────────────────── */
  if (!authed) {
    return (
      <div className="bg-[#0d0d1a] min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(rgba(127,133,247,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative bg-white rounded-[24px] p-10 shadow-xl max-w-[400px] w-full text-center">
          <div className="bg-[#7f85f7] w-14 h-14 rounded-[16px] mx-auto mb-5 flex items-center justify-center">
            <LayoutDashboard size={28} className="text-white" />
          </div>
          <div className="font-bold text-[20px] text-[#1a1a2e]">{SITE_FULL}</div>
          <div className="text-[#666] text-[14px] mt-1">Admin Dashboard</div>

          <div className="relative mt-8">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter password"
              className="w-full border border-[#e8e8f0] rounded-[10px] h-[52px] px-4 pr-12 text-[15px] outline-none focus:border-[#7f85f7] transition-colors"
            />
            <span
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#9496a8] hover:text-[#1a1a2e]"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {pwError && (
            <p className="text-red-500 text-[13px] mt-2 flex items-center justify-center gap-1">
              <AlertCircle size={13} /> Incorrect password
            </p>
          )}

          <button
            onClick={login}
            className="mt-4 w-full bg-[#7f85f7] text-white rounded-[10px] h-[52px] font-semibold text-[15px] hover:bg-[#6b71f0] transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  /* ─────────────────────── DASHBOARD ─────────────────────── */
  const navItems = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "security", label: "Security", Icon: ShieldCheck },
    { id: "car-rental", label: "Car Rental", Icon: Car },
    { id: "it-services", label: "IT Services", Icon: Monitor },
    { id: "leads", label: "Leads", Icon: Users },
    { id: "enquiries", label: "Enquiries", Icon: MessageSquare },
  ]

  const activeSolution =
    securitySolutions.find((s) => s.id === secTab) ?? securitySolutions[0]
  const activeService =
    itServiceItems.find((s) => s.id === itTab) ?? itServiceItems[0]

  return (
    <div className="bg-[#f5f5f8] min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-[240px] flex-shrink-0 bg-[#1a1a2e] min-h-screen flex flex-col fixed left-0 top-0 h-full z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-white font-bold text-[16px]">{SITE_FULL}</div>
          <div className="text-[#666880] text-[11px] mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors duration-200 font-medium text-[14px] ${
                  active
                    ? "bg-[#7f85f7]/20 text-[#7f85f7] border-r-2 border-[#7f85f7]"
                    : "text-[#9496a8] hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-auto px-6 py-4 border-t border-white/10 flex items-center gap-3 text-[#666880] hover:text-white cursor-pointer text-[14px] transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="ml-[240px] flex-1 p-8 min-w-0">
        {/* ───────── OVERVIEW ───────── */}
        {tab === "overview" && (
          <div>
            <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                iconBg="bg-[#eeedfe]"
                icon={<Users size={20} className="text-[#7f85f7]" />}
                value={leads.length}
                label="Total Leads"
                sub="All time"
              />
              <StatCard
                iconBg="bg-[rgba(245,124,0,0.12)]"
                icon={<ShieldCheck size={20} className="text-[#f57c00]" />}
                value={securityCount}
                label="Security Quotes"
                sub="All time"
              />
              <StatCard
                iconBg="bg-[rgba(76,175,80,0.12)]"
                icon={<Car size={20} className="text-[#4caf50]" />}
                value={carCount}
                label="Car Rental Quotes"
                sub="All time"
              />
              <StatCard
                iconBg="bg-[#eeedfe]"
                icon={<Monitor size={20} className="text-[#7f85f7]" />}
                value={itCount}
                label="IT & AI Quotes"
                sub="All time"
              />
            </div>

            {/* Recent leads */}
            <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[18px] text-[#1a1a2e]">Recent Leads</h2>
                <button
                  onClick={() => setTab("leads")}
                  className="text-[#7f85f7] text-[13px] font-medium flex items-center gap-1 hover:underline"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              {leadsLoading ? (
                <p className="text-[#9496a8] text-[14px] py-8 text-center">Loading…</p>
              ) : leads.length === 0 ? (
                <p className="text-[#9496a8] text-[14px] py-8 text-center">No leads yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Service</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Source</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map((l, i) => {
                        const b = serviceBadge(l.service)
                        const sp = sourcePill(l.source)
                        return (
                          <tr key={l.id ?? i} className="border-b border-[#f0f0f8] last:border-0">
                            <td className="py-3 pr-4 font-medium text-[14px] text-[#1a1a2e]">
                              {leadName(l)}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${b.bg} ${b.text}`}>
                                {b.emoji} {l.service ?? "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-[#9496a8] text-[13px]">{formatDate(l)}</td>
                            <td className="py-3 pr-4">
                              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${sp.cls}`}>
                                {sp.label}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <button
                                onClick={() => setTab("leads")}
                                className="text-[#7f85f7] text-[13px] font-medium hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────── SECURITY ───────── */}
        {tab === "security" && (
          <div>
            <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-2">
              Security Solutions — Products
            </h1>
            <p className="text-[#666] text-[14px] mb-8">
              Changes save to data file and update live site immediately
            </p>

            <InfoBox text="Add product images to public/images/products/ then enter the filename below." />

            {/* solution tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {securitySolutions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSecTab(s.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
                    secTab === s.id
                      ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                      : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* products table */}
            <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                      <Th>Image</Th>
                      <Th>Product</Th>
                      <Th>Price</Th>
                      <Th>Unit</Th>
                      <Th>Badge</Th>
                      <Th>In Stock</Th>
                      <Th>Save</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSolution.products.map((p) => {
                      const key = `${activeSolution.id}:${p.id}`
                      const e = secEdits[key]
                      if (!e) return null
                      return (
                        <tr key={key} className="border-b border-[#f0f0f8] last:border-0 align-top">
                          <td className="px-4 py-4">
                            <Thumb
                              src={e.image}
                              value={e.image}
                              placeholder="/images/products/name.jpg"
                              onChange={(v) =>
                                setSecEdits((s) => ({ ...s, [key]: { ...s[key], image: v } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-[14px] text-[#1a1a2e]">{p.name}</div>
                            <div className="text-[11px] text-[#9496a8] mt-0.5">
                              {p.description.length > 40
                                ? p.description.slice(0, 40) + "…"
                                : p.description}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <DollarSign size={13} className="text-[#9496a8]" />
                              <input
                                type="number"
                                value={e.price}
                                onChange={(ev) =>
                                  setSecEdits((s) => ({
                                    ...s,
                                    [key]: { ...s[key], price: Number(ev.target.value) },
                                  }))
                                }
                                className="w-[80px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[14px] font-bold text-[#7f85f7] focus:border-[#7f85f7] outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px] text-[#9496a8]">{p.unit}</td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={e.badge}
                              placeholder="e.g. Best Seller"
                              onChange={(ev) =>
                                setSecEdits((s) => ({
                                  ...s,
                                  [key]: { ...s[key], badge: ev.target.value },
                                }))
                              }
                              className="w-[110px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[12px] focus:border-[#7f85f7] outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Toggle
                              on={e.inStock}
                              onClick={() =>
                                setSecEdits((s) => ({
                                  ...s,
                                  [key]: { ...s[key], inStock: !s[key].inStock },
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <SaveBtn
                              saved={savedKey === key}
                              onClick={() =>
                                save(
                                  {
                                    type: "security-product",
                                    solutionId: activeSolution.id,
                                    productId: p.id,
                                    price: e.price,
                                    image: e.image,
                                    badge: e.badge,
                                    inStock: e.inStock,
                                  },
                                  key
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────── CAR RENTAL ───────── */}
        {tab === "car-rental" && (
          <div>
            <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-8">
              Car Rental — Vehicles &amp; Rates
            </h1>

            <InfoBox text="Add vehicle images to public/images/vehicles/ then enter the filename below." />

            <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden mb-8">
              <h2 className="font-bold text-[18px] text-[#1a1a2e] p-5 border-b border-[#f0f0f8]">
                Vehicles
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                      <Th>Image</Th>
                      <Th>Vehicle</Th>
                      <Th>Daily Rate</Th>
                      <Th>Weekly Rate</Th>
                      <Th>Bond</Th>
                      <Th>Badge</Th>
                      <Th>In Stock</Th>
                      <Th>Save</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => {
                      const e = vehEdits[v.id]
                      if (!e) return null
                      return (
                        <tr key={v.id} className="border-b border-[#f0f0f8] last:border-0 align-top">
                          <td className="px-4 py-4">
                            <Thumb
                              src={e.image}
                              value={e.image}
                              placeholder="/images/vehicles/name.jpg"
                              onChange={(val) =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], image: val } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-[14px] text-[#1a1a2e]">{v.name}</div>
                            <div className="text-[11px] text-[#9496a8]">{v.example}</div>
                            <div className="text-[10px] text-[#b0b0b8]">{v.passengers} seats</div>
                          </td>
                          <td className="px-4 py-4">
                            <NumField
                              prefix="$"
                              suffix="/day"
                              value={e.dailyRate}
                              onChange={(n) =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], dailyRate: n } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <NumField
                              prefix="$"
                              suffix="/wk"
                              value={e.weeklyRate}
                              onChange={(n) =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], weeklyRate: n } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <NumField
                              prefix="$"
                              value={e.bond}
                              onChange={(n) =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], bond: n } }))
                              }
                            />
                            <div className="text-[10px] text-[#1565c0] mt-0.5">held</div>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={e.badge}
                              placeholder="e.g. Most Popular"
                              onChange={(ev) =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], badge: ev.target.value } }))
                              }
                              className="w-[110px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[12px] focus:border-[#7f85f7] outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Toggle
                              on={e.inStock}
                              onClick={() =>
                                setVehEdits((s) => ({ ...s, [v.id]: { ...s[v.id], inStock: !s[v.id].inStock } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <SaveBtn
                              saved={savedKey === v.id}
                              onClick={() =>
                                save(
                                  {
                                    type: "vehicle",
                                    vehicleId: v.id,
                                    dailyRate: e.dailyRate,
                                    weeklyRate: e.weeklyRate,
                                    bond: e.bond,
                                    image: e.image,
                                    badge: e.badge,
                                    inStock: e.inStock,
                                  },
                                  v.id
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────── IT SERVICES ───────── */}
        {tab === "it-services" && (
          <div>
            <h1 className="font-bold text-[28px] text-[#1a1a2e] mb-8">
              IT &amp; AI Services — Packages
            </h1>

            <div className="flex gap-2 flex-wrap mb-6">
              {itServiceItems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setItTab(s.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
                    itTab === s.id
                      ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                      : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                      <Th>Image</Th>
                      <Th>Package</Th>
                      <Th>Starting From</Th>
                      <Th>Display Price</Th>
                      <Th>Badge</Th>
                      <Th>Save</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeService.packages.map((p) => {
                      const key = `${activeService.id}:${p.id}`
                      const e = pkgEdits[key]
                      if (!e) return null
                      return (
                        <tr key={key} className="border-b border-[#f0f0f8] last:border-0 align-top">
                          <td className="px-4 py-4">
                            <Thumb
                              src={e.image}
                              value={e.image}
                              placeholder="/images/it-services/name.jpg"
                              onChange={(v) =>
                                setPkgEdits((s) => ({ ...s, [key]: { ...s[key], image: v } }))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-[14px] text-[#1a1a2e]">{p.name}</div>
                            <div className="text-[11px] text-[#9496a8] mt-0.5">{p.description}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-[10px] text-[#9496a8] mb-1">Number (for calculations)</div>
                            <input
                              type="number"
                              value={e.startingFromValue}
                              onChange={(ev) =>
                                setPkgEdits((s) => ({
                                  ...s,
                                  [key]: { ...s[key], startingFromValue: Number(ev.target.value) },
                                }))
                              }
                              className="w-[100px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[14px] font-bold text-[#7f85f7] focus:border-[#7f85f7] outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-[10px] text-[#9496a8] mb-1">Text shown to customers</div>
                            <input
                              type="text"
                              value={e.startingFrom}
                              placeholder="From $2,500"
                              onChange={(ev) =>
                                setPkgEdits((s) => ({
                                  ...s,
                                  [key]: { ...s[key], startingFrom: ev.target.value },
                                }))
                              }
                              className="w-[130px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[13px] focus:border-[#7f85f7] outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={e.badge}
                              placeholder="e.g. Most Popular"
                              onChange={(ev) =>
                                setPkgEdits((s) => ({ ...s, [key]: { ...s[key], badge: ev.target.value } }))
                              }
                              className="w-[110px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[12px] focus:border-[#7f85f7] outline-none"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <SaveBtn
                              saved={savedKey === key}
                              onClick={() =>
                                save(
                                  {
                                    type: "it-package",
                                    serviceId: activeService.id,
                                    packageId: p.id,
                                    startingFromValue: e.startingFromValue,
                                    startingFrom: e.startingFrom,
                                    image: e.image,
                                    badge: e.badge,
                                  },
                                  key
                                )
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────── LEADS ───────── */}
        {tab === "leads" && (
          <LeadsView
            title="Leads & Quote Requests"
            rows={filteredLeads}
            loading={leadsLoading}
            total={leads.length}
            securityCount={securityCount}
            carCount={carCount}
            itCount={itCount}
            filter={leadsFilter}
            setFilter={setLeadsFilter}
            onRefresh={loadLeads}
            onStatus={updateStatus}
            showFilters
          />
        )}

        {/* ───────── ENQUIRIES ───────── */}
        {tab === "enquiries" && (
          <LeadsView
            title="Contact Enquiries"
            rows={enquiries}
            loading={leadsLoading}
            total={enquiries.length}
            securityCount={securityCount}
            carCount={carCount}
            itCount={itCount}
            filter="All"
            setFilter={() => {}}
            onRefresh={loadLeads}
            onStatus={updateStatus}
            showFilters={false}
          />
        )}
      </main>
    </div>
  )
}

/* ───────────────────── Sub-components ───────────────────── */

function StatCard({
  iconBg,
  icon,
  value,
  label,
  sub,
}: {
  iconBg: string
  icon: React.ReactNode
  value: number
  label: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#e8e8f0] shadow-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div className="font-bold text-[32px] text-[#1a1a2e] mt-4 leading-none">{value}</div>
      <div className="text-[#666] text-[13px] mt-2">{label}</div>
      <div className="text-[#9496a8] text-[11px] flex items-center gap-1">
        <TrendingUp size={11} /> {sub}
      </div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 whitespace-nowrap">{children}</th>
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="bg-[#eeedfe] rounded-[12px] p-4 mb-6 flex items-start gap-3">
      <ImageIcon size={18} className="text-[#7f85f7] flex-shrink-0 mt-0.5" />
      <p className="text-[13px] text-[#534ab7]">{text}</p>
    </div>
  )
}

function Thumb({
  src,
  value,
  placeholder,
  onChange,
}: {
  src: string
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-[60px] h-[44px] rounded-[8px] overflow-hidden bg-[#f0f0ff] relative flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={16} className="text-[#b0b4fb]" />
        )}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-[140px] text-[11px] border border-[#e8e8f0] rounded-[6px] px-2 py-1 focus:border-[#7f85f7] outline-none text-[#666]"
      />
    </div>
  )
}

function NumField({
  prefix,
  suffix,
  value,
  onChange,
}: {
  prefix?: string
  suffix?: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-[#9496a8] text-[13px]">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[80px] border border-[#e8e8f0] rounded-[8px] px-2 h-[38px] text-[14px] font-bold text-[#7f85f7] focus:border-[#7f85f7] outline-none"
      />
      {suffix && <span className="text-[#9496a8] text-[11px]">{suffix}</span>}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
        on ? "bg-[#7f85f7]" : "bg-[#e0e0e8]"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform duration-200 ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  )
}

function SaveBtn({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[8px] px-4 h-[36px] text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
        saved ? "bg-[#2e7d32] text-white" : "bg-[#7f85f7] text-white hover:bg-[#6b71f0]"
      }`}
    >
      {saved ? (
        <>
          <Check size={13} /> Saved
        </>
      ) : (
        <>
          <Save size={13} /> Save
        </>
      )}
    </button>
  )
}

function LeadsView({
  title,
  rows,
  loading,
  total,
  securityCount,
  carCount,
  itCount,
  filter,
  setFilter,
  onRefresh,
  onStatus,
  showFilters,
}: {
  title: string
  rows: Lead[]
  loading: boolean
  total: number
  securityCount: number
  carCount: number
  itCount: number
  filter: string
  setFilter: (f: string) => void
  onRefresh: () => void
  onStatus: (id: string | undefined, status: string) => void
  showFilters: boolean
}) {
  const FILTERS = ["All", "Security", "Car Rental", "IT & AI", "Contact", "AI Chat"]
  const pills = [
    { label: "Total", value: total },
    { label: "Security", value: securityCount },
    { label: "Car Rental", value: carCount },
    { label: "IT & AI", value: itCount },
  ]

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">{title}</h1>
        <button
          onClick={onRefresh}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* stat pills */}
      <div className="flex gap-3 flex-wrap mb-6 mt-4">
        {pills.map((p) => (
          <div
            key={p.label}
            className="bg-white border border-[#e8e8f0] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#1a1a2e]"
          >
            {p.label}: {p.value}
          </div>
        ))}
      </div>

      {/* filter tabs */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
                filter === f
                  ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                  : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                <Th>Name</Th>
                <Th>Service</Th>
                <Th>Contact</Th>
                <Th>Message</Th>
                <Th>Date</Th>
                <Th>Source</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((l, i) => {
                  const b = serviceBadge(l.service)
                  const sp = sourcePill(l.source)
                  const msg = leadMessage(l)
                  return (
                    <tr key={l.id ?? i} className="border-b border-[#f0f0f8] last:border-0 hover:bg-[#f9f9ff] align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[14px] text-[#1a1a2e]">{leadName(l)}</div>
                        {l.company && (
                          <div className="text-[11px] text-[#9496a8]">{l.company}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${b.bg} ${b.text}`}>
                          {b.emoji} {l.service ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {l.phone && (
                            <span className="flex items-center gap-1 text-[#666] text-[12px]">
                              <Phone size={12} /> {l.phone}
                            </span>
                          )}
                          {l.email && (
                            <span className="flex items-center gap-1 text-[#666] text-[12px]">
                              <Mail size={12} /> {l.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="text-[13px] text-[#444] max-w-[200px]"
                          title={msg}
                        >
                          {msg.length > 60 ? msg.slice(0, 60) + "…" : msg || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[12px] text-[#9496a8] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(l)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${sp.cls}`}>
                          {sp.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={l.status ?? "New"}
                          onChange={(e) => onStatus(l.id, e.target.value)}
                          className={`text-[12px] font-medium border rounded-[8px] px-2 h-[32px] outline-none cursor-pointer ${statusColor(l.status)}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="py-16 text-center text-[#9496a8] text-[14px]">Loading leads…</p>
        )}
        {!loading && rows.length === 0 && (
          <div className="py-16 text-center text-[#9496a8]">
            No leads yet. They appear here when customers submit quote forms.
          </div>
        )}
      </div>
    </div>
  )
}
