"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Car,
  LayoutDashboard,
  DollarSign,
  MessageSquare,
  Users,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { SITE_FULL } from "@/data/site"
import VehiclesDbTab from "@/components/dashboard/VehiclesDbTab"
import OffersDbTab from "@/components/dashboard/OffersDbTab"
import ActiveRentalsDbTab from "@/components/dashboard/ActiveRentalsDbTab"

// Standalone rental admin dashboard — a separate URL and password from the
// main /dashboard so Ehtsham gets one link covering only car rental, with no
// access to security products, IT services or the other dashboard sections.
// The heavy lifting (fleet editing, offer approval, "Mark Returned") is not
// rebuilt here — it reuses the same tab components the main dashboard already
// has, which already talk to the real API routes.

interface Lead {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  service?: string
  message?: string
  notes?: string
  date?: string
  createdAt?: string
  source?: string
  [key: string]: unknown
}

interface Agreement {
  agreedWeeklyRate: number
}

interface Negotiation {
  status: string
}

interface VehicleRow {
  available: boolean
}

function leadName(l: Lead): string {
  if (l.name) return l.name
  return [l.firstName, l.lastName].filter(Boolean).join(" ") || "—"
}

function leadMessage(l: Lead): string {
  return (l.message ?? l.notes ?? "") as string
}

function formatDate(l: Lead): string {
  const v = l.date ?? l.createdAt
  if (!v) return "—"
  const d = new Date(v)
  if (isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString("en-AU") + " · " + d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
}

export default function RentalAdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")
  const [pwError, setPwError] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [tab, setTab] = useState("overview")

  useEffect(() => {
    if (localStorage.getItem("rental_admin_auth") === "true") setAuthed(true)
  }, [])

  const login = () => {
    if (pw === process.env.NEXT_PUBLIC_RENTAL_DASHBOARD_PASSWORD) {
      localStorage.setItem("rental_admin_auth", "true")
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
      setPw("")
    }
  }

  const logout = () => {
    localStorage.removeItem("rental_admin_auth")
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
        <div className="bg-white rounded-[24px] p-10 max-w-[400px] w-full text-center shadow-xl">
          <div className="bg-[#7f85f7] w-14 h-14 rounded-[16px] mx-auto mb-5 flex items-center justify-center">
            <Car className="text-white" size={28} />
          </div>
          <h1 className="font-bold text-[20px] text-[#1a1a2e]">{SITE_FULL}</h1>
          <p className="text-[#666] text-[14px] mt-1">Rental Management</p>

          <div className="relative mt-8">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter password"
              className="w-full border border-[#e8e8f0] rounded-[10px] h-[52px] px-4 pr-12 text-[15px] outline-none focus:border-[#7f85f7] transition-colors"
            />
            <button
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9496a8] hover:text-[#1a1a2e]"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            Log In
          </button>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "vehicles", label: "Vehicles", Icon: Car },
    { id: "active", label: "Active Rentals", Icon: Users },
    { id: "offers", label: "Price Offers", Icon: DollarSign },
    { id: "leads", label: "Leads", Icon: MessageSquare },
  ]

  return (
    <div className="bg-[#f5f5f8] min-h-screen flex">
      <aside className="w-[220px] flex-shrink-0 bg-[#1a1a2e] min-h-screen flex flex-col fixed left-0 top-0 h-full z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-white font-bold text-[16px]">{SITE_FULL}</p>
          <p className="text-[#666880] text-[11px] mt-0.5">Rental Management</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3.5 text-[14px] font-medium transition-colors ${
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
          className="flex items-center gap-3 px-6 py-4 border-t border-white/10 text-[#666880] hover:text-white text-[14px]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <main className="ml-[220px] flex-1 min-w-0 min-h-screen p-4 lg:p-8">
        {tab === "overview" && <OverviewTab />}
        {tab === "vehicles" && <VehiclesDbTab />}
        {tab === "active" && <ActiveRentalsDbTab />}
        {tab === "offers" && <OffersDbTab />}
        {tab === "leads" && <RentalLeadsTab />}
      </main>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#e8e8f0] shadow-sm">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eeedfe]">
        {icon}
      </div>
      <div className="font-bold text-[28px] text-[#1a1a2e] mt-4 leading-none">{value}</div>
      <div className="text-[#666] text-[13px] mt-2">{label}</div>
    </div>
  )
}

function OverviewTab() {
  const [loading, setLoading] = useState(true)
  const [activeCount, setActiveCount] = useState(0)
  const [weeklyRevenue, setWeeklyRevenue] = useState(0)
  const [pendingOffers, setPendingOffers] = useState(0)
  const [availableVehicles, setAvailableVehicles] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/rental-payment/agreements?status=active", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ agreements: [] })),
      fetch("/api/rental-payment/negotiate-price", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ negotiations: [] })),
      fetch("/api/vehicles?all=1", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ vehicles: [] })),
    ]).then(([agreementsData, negotiationsData, vehiclesData]) => {
      const agreements: Agreement[] = Array.isArray(agreementsData.agreements)
        ? agreementsData.agreements
        : []
      const negotiations: Negotiation[] = Array.isArray(negotiationsData.negotiations)
        ? negotiationsData.negotiations
        : []
      const vehicles: VehicleRow[] = Array.isArray(vehiclesData.vehicles)
        ? vehiclesData.vehicles
        : []

      setActiveCount(agreements.length)
      setWeeklyRevenue(agreements.reduce((sum, a) => sum + (Number(a.agreedWeeklyRate) || 0), 0))
      setPendingOffers(negotiations.filter((n) => n.status === "pending").length)
      setAvailableVehicles(vehicles.filter((v) => v.available).length)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">Rental Overview</h1>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-[#9496a8] text-[14px] py-8 text-center">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} className="text-[#7f85f7]" />}
            value={activeCount}
            label="Active Rentals"
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-[#7f85f7]" />}
            value={`$${weeklyRevenue.toLocaleString("en-AU")}`}
            label="Weekly Revenue"
          />
          <StatCard
            icon={<DollarSign size={20} className="text-[#7f85f7]" />}
            value={pendingOffers}
            label="Pending Offers"
          />
          <StatCard
            icon={<Car size={20} className="text-[#7f85f7]" />}
            value={availableVehicles}
            label="Available Vehicles"
          />
        </div>
      )}
    </div>
  )
}

function RentalLeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/dashboard/leads", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const arr: Lead[] = Array.isArray(data.leads) ? data.leads : []
        setLeads(arr.filter((l) => (l.service ?? "").toLowerCase().includes("car")))
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h1 className="font-bold text-[28px] text-[#1a1a2e]">Car Rental Leads</h1>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <p className="text-[#666] text-[14px] mb-6">
        Car rental enquiries from the quote form and AI chat.
      </p>

      <div className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-[#f8f8ff] text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                leads.map((l, i) => {
                  const msg = leadMessage(l)
                  return (
                    <tr key={l.id ?? i} className="border-b border-[#f0f0f8] last:border-0 align-top">
                      <td className="px-4 py-4 font-semibold text-[14px] text-[#1a1a2e]">
                        {leadName(l)}
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
                      <td className="px-4 py-4 text-[13px] text-[#444] max-w-[280px]" title={msg}>
                        {msg.length > 80 ? msg.slice(0, 80) + "…" : msg || "—"}
                      </td>
                      <td className="px-4 py-4 text-[12px] text-[#9496a8] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(l)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        {loading && <p className="py-16 text-center text-[#9496a8] text-[14px]">Loading…</p>}
        {!loading && leads.length === 0 && (
          <p className="py-16 text-center text-[#9496a8] text-[14px]">
            No car rental leads yet.
          </p>
        )}
      </div>
    </div>
  )
}
