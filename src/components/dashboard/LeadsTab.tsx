"use client"

import { useEffect, useState } from "react"
import type { Lead } from "@/types"

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(Array.isArray(d) ? d : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <p className="text-[13px] text-gray-500">Loading leads…</p>

  if (leads.length === 0)
    return (
      <p className="text-[13px] text-gray-500">
        No leads yet. They appear here when customers contact you.
      </p>
    )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[12px] text-gray-400 uppercase tracking-wide border-b border-gray-200">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Phone</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-gray-100 text-[13px] text-[#1a1a2e]">
              <td className="px-4 py-3">{l.name}</td>
              <td className="px-4 py-3">{l.phone}</td>
              <td className="px-4 py-3">{l.email}</td>
              <td className="px-4 py-3">{l.service}</td>
              <td className="px-4 py-3">
                {new Date(l.date).toLocaleDateString("en-AU")}
              </td>
              <td className="px-4 py-3">{l.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
