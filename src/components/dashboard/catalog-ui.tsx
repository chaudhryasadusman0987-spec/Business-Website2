"use client"

import { Save, Check, Loader2 } from "lucide-react"

// Shared editing controls for the Security / Vehicle catalog tabs.

export function Labeled({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9496a8]">
        {label}
      </span>
      {children}
    </div>
  )
}

export function Text({
  value,
  onChange,
  placeholder,
  w = "w-[160px]",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  w?: string
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${w} border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px] text-[#1a1a2e] focus:border-[#7f85f7] outline-none`}
    />
  )
}

export function Num({
  value,
  onChange,
  w = "w-[90px]",
}: {
  value: number
  onChange: (n: number) => void
  w?: string
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${w} border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[14px] font-bold text-[#7f85f7] focus:border-[#7f85f7] outline-none`}
    />
  )
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
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

export function IconBtn({
  children,
  onClick,
  title,
  danger = false,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-[8px] flex items-center justify-center border transition-colors ${
        danger
          ? "border-[#f0d0d0] text-[#c0392b] hover:bg-[#fdecea]"
          : "border-[#e8e8f0] text-[#666] hover:border-[#7f85f7] hover:text-[#7f85f7]"
      }`}
    >
      {children}
    </button>
  )
}

export function SaveButton({
  dirty,
  saving,
  saved,
  onClick,
}: {
  dirty: boolean
  saving: boolean
  saved: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      {dirty && !saving && (
        <span className="text-[12px] text-[#c0392b] font-medium">
          Unsaved changes
        </span>
      )}
      <button
        onClick={onClick}
        disabled={saving || (!dirty && !saved)}
        className={`rounded-[8px] px-5 h-[40px] text-[13px] font-semibold flex items-center gap-2 transition-colors ${
          saved
            ? "bg-[#2e7d32] text-white"
            : "bg-[#7f85f7] text-white hover:bg-[#6b71f0] disabled:opacity-50"
        }`}
      >
        {saving ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Saving…
          </>
        ) : saved ? (
          <>
            <Check size={15} /> Saved
          </>
        ) : (
          <>
            <Save size={15} /> Save changes
          </>
        )}
      </button>
    </div>
  )
}
