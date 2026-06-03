"use client"

import { useEffect, useState } from "react"
import ProductsTab from "@/components/dashboard/ProductsTab"
import LeadsTab from "@/components/dashboard/LeadsTab"
import { SITE_NAME, SITE_DOMAIN, SITE_EMAIL } from "@/data/site"

const TABS = ["Products", "Leads", "Settings"] as const
type Tab = (typeof TABS)[number]

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState<Tab>("Products")

  useEffect(() => {
    if (localStorage.getItem("dash_auth") === "true") setAuthed(true)
  }, [])

  const check = () => {
    if (pw === process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD) {
      localStorage.setItem("dash_auth", "true")
      setAuthed(true)
      setErr(false)
    } else {
      setErr(true)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
        <div className="bg-white rounded-[16px] shadow-sm p-8 w-full max-w-[360px]">
          <h1 className="text-[20px] font-bold text-[#1a1a2e]">Dashboard</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Enter the password to continue.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Password"
            className="w-full border border-gray-200 rounded-[8px] px-3 h-[42px] text-[14px] mt-4 focus:outline-none focus:border-brand-primary"
          />
          {err && (
            <p className="text-[12px] text-[#A32D2D] mt-2">Incorrect password</p>
          )}
          <button
            onClick={check}
            className="w-full bg-brand-primary text-white rounded-[8px] h-[42px] text-[14px] font-medium mt-4 hover:bg-[#6b71f0] transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f7f7f7]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-brand-dark text-white flex-shrink-0 hidden md:flex flex-col py-6">
        <p className="px-6 text-[16px] font-bold mb-6">{SITE_NAME} Admin</p>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-left px-6 py-3 text-[14px] transition-colors ${
              tab === t ? "bg-white/10 text-white font-semibold" : "text-white/70 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-x-hidden">
        {/* Mobile tab switcher */}
        <div className="flex md:hidden gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 h-[32px] rounded-full text-[12px] font-medium ${
                tab === t ? "bg-brand-primary text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="text-[22px] font-bold text-[#1a1a2e] mb-5">{tab}</h2>

        {tab === "Products" && <ProductsTab />}
        {tab === "Leads" && <LeadsTab />}
        {tab === "Settings" && (
          <div className="bg-white rounded-[12px] p-6 max-w-[480px] space-y-3">
            <Setting label="Business name" value={SITE_NAME} />
            <Setting label="Domain" value={SITE_DOMAIN} />
            <Setting label="Email" value={SITE_EMAIL} />
            <p className="text-[12px] text-gray-400 pt-2">
              To change these, edit{" "}
              <code className="bg-gray-100 px-1 rounded">src/data/site.ts</code>{" "}
              or run the rename script.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-[13px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#1a1a2e]">{value}</span>
    </div>
  )
}
