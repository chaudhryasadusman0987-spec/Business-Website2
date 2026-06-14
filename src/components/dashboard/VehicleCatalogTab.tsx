"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { vehicles as baseVehicles } from "@/data/car-rental"
import type { Vehicle } from "@/data/car-rental"
import {
  EMPTY_OVERRIDES,
  makeCustomId,
  normaliseOverrides,
  type CatalogOverrides,
} from "@/lib/catalog"
import ImageInput from "./ImageInput"
import { Labeled, Text, Num, Toggle, IconBtn, SaveButton } from "./catalog-ui"

type Row = Vehicle & { _custom: boolean; _hidden: boolean }

const blankVehicle = (): Omit<Vehicle, "id"> => ({
  name: "",
  example: "",
  icon: "🚗",
  dailyRate: 0,
  weeklyRate: 0,
  bond: 0,
  passengers: 5,
  features: [],
  image: "",
  imageAlt: "",
  inStock: true,
})

export default function VehicleCatalogTab() {
  const [overrides, setOverrides] = useState<CatalogOverrides>(EMPTY_OVERRIDES)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState(blankVehicle())

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setOverrides(normaliseOverrides(data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = (fn: (prev: CatalogOverrides) => CatalogOverrides) => {
    setOverrides(fn)
    setDirty(true)
  }

  const o = overrides.vehicles

  const rows: Row[] = useMemo(() => {
    const builtin = baseVehicles.map((v) => ({
      ...v,
      ...o.edits[v.id],
      _custom: false,
      _hidden: o.removed.includes(v.id),
    }))
    const custom = o.added.map((v) => ({ ...v, _custom: true, _hidden: false }))
    return [...builtin, ...custom]
  }, [o])

  /* ── mutations ── */
  const patchBuiltin = (id: string, patch: Partial<Vehicle>) =>
    update((prev) => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        edits: {
          ...prev.vehicles.edits,
          [id]: { ...prev.vehicles.edits[id], ...patch },
        },
      },
    }))

  const patchCustom = (id: string, patch: Partial<Vehicle>) =>
    update((prev) => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        added: prev.vehicles.added.map((v) =>
          v.id === id ? { ...v, ...patch } : v,
        ),
      },
    }))

  const onField = (row: Row, patch: Partial<Vehicle>) =>
    row._custom ? patchCustom(row.id, patch) : patchBuiltin(row.id, patch)

  const toggleHide = (id: string) =>
    update((prev) => {
      const removed = prev.vehicles.removed.includes(id)
        ? prev.vehicles.removed.filter((x) => x !== id)
        : [...prev.vehicles.removed, id]
      return { ...prev, vehicles: { ...prev.vehicles, removed } }
    })

  const deleteCustom = (id: string) =>
    update((prev) => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        added: prev.vehicles.added.filter((v) => v.id !== id),
      },
    }))

  const addVehicle = () => {
    if (!draft.name.trim()) return
    const vehicle: Vehicle = {
      ...draft,
      id: makeCustomId("veh"),
      imageAlt: draft.imageAlt || draft.name,
    }
    update((prev) => ({
      ...prev,
      vehicles: { ...prev.vehicles, added: [...prev.vehicles.added, vehicle] },
    }))
    setDraft(blankVehicle())
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrides),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.overrides) setOverrides(normaliseOverrides(data.overrides))
        setDirty(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      /* keep dirty for retry */
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-[#9496a8] text-[14px]">
        Loading vehicles…
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-[28px] text-[#1a1a2e]">
            Car Rental — Vehicles &amp; Rates
          </h1>
          <p className="text-[#666] text-[14px] mt-1">
            Add, edit or remove vehicles. Changes go live on the fleet pages
            after you Save.
          </p>
        </div>
        <SaveButton dirty={dirty} saving={saving} saved={saved} onClick={save} />
      </div>

      {/* ── ADD NEW VEHICLE ── */}
      <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-6">
        <h2 className="font-bold text-[15px] text-[#1a1a2e] mb-4 flex items-center gap-2">
          <Plus size={16} className="text-[#7f85f7]" /> Add a vehicle
        </h2>
        <div className="flex flex-wrap gap-5 items-start">
          <Labeled label="Image">
            <ImageInput
              value={draft.image}
              onChange={(v) => setDraft((d) => ({ ...d, image: v }))}
            />
          </Labeled>
          <Labeled label="Icon">
            <Text
              value={draft.icon}
              placeholder="🚗"
              onChange={(v) => setDraft((d) => ({ ...d, icon: v }))}
              w="w-[60px]"
            />
          </Labeled>
          <Labeled label="Name">
            <Text
              value={draft.name}
              placeholder="e.g. Premium SUV"
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              w="w-[160px]"
            />
          </Labeled>
          <Labeled label="Example / short desc">
            <Text
              value={draft.example}
              placeholder="e.g. Toyota Kluger or similar"
              onChange={(v) => setDraft((d) => ({ ...d, example: v }))}
              w="w-[210px]"
            />
          </Labeled>
          <Labeled label="Daily ($)">
            <Num
              value={draft.dailyRate}
              onChange={(n) => setDraft((d) => ({ ...d, dailyRate: n }))}
            />
          </Labeled>
          <Labeled label="Weekly ($)">
            <Num
              value={draft.weeklyRate}
              onChange={(n) => setDraft((d) => ({ ...d, weeklyRate: n }))}
            />
          </Labeled>
          <Labeled label="Bond ($)">
            <Num
              value={draft.bond}
              onChange={(n) => setDraft((d) => ({ ...d, bond: n }))}
            />
          </Labeled>
          <Labeled label="Seats">
            <Num
              value={draft.passengers}
              onChange={(n) => setDraft((d) => ({ ...d, passengers: n }))}
              w="w-[70px]"
            />
          </Labeled>
          <Labeled label="Features (comma separated)">
            <Text
              value={draft.features.join(", ")}
              placeholder="Auto, Bluetooth, 7 seats"
              onChange={(v) =>
                setDraft((d) => ({ ...d, features: splitFeatures(v) }))
              }
              w="w-[230px]"
            />
          </Labeled>
          <Labeled label="Badge (optional)">
            <Text
              value={draft.badge ?? ""}
              placeholder="e.g. Most Popular"
              onChange={(v) => setDraft((d) => ({ ...d, badge: v }))}
              w="w-[130px]"
            />
          </Labeled>
          <button
            onClick={addVehicle}
            disabled={!draft.name.trim()}
            className="self-end inline-flex items-center gap-1.5 bg-[#7f85f7] text-white rounded-[8px] h-[38px] px-4 text-[13px] font-medium hover:bg-[#6b71f0] transition-colors disabled:opacity-50"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* ── EXISTING VEHICLES ── */}
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`bg-white rounded-[16px] border p-5 transition-opacity ${
              row._hidden ? "border-[#f0d0d0] opacity-60" : "border-[#e8e8f0]"
            }`}
          >
            <div className="flex flex-wrap gap-5 items-start">
              <Labeled label="Image">
                <ImageInput
                  value={row.image}
                  onChange={(v) => onField(row, { image: v })}
                />
              </Labeled>
              <Labeled label="Icon">
                <Text
                  value={row.icon}
                  onChange={(v) => onField(row, { icon: v })}
                  w="w-[60px]"
                />
              </Labeled>
              <Labeled label="Name">
                <Text
                  value={row.name}
                  onChange={(v) => onField(row, { name: v })}
                  w="w-[160px]"
                />
              </Labeled>
              <Labeled label="Example / short desc">
                <Text
                  value={row.example}
                  onChange={(v) => onField(row, { example: v })}
                  w="w-[210px]"
                />
              </Labeled>
              <Labeled label="Daily ($)">
                <Num
                  value={row.dailyRate}
                  onChange={(n) => onField(row, { dailyRate: n })}
                />
              </Labeled>
              <Labeled label="Weekly ($)">
                <Num
                  value={row.weeklyRate}
                  onChange={(n) => onField(row, { weeklyRate: n })}
                />
              </Labeled>
              <Labeled label="Bond ($)">
                <Num
                  value={row.bond}
                  onChange={(n) => onField(row, { bond: n })}
                />
              </Labeled>
              <Labeled label="Seats">
                <Num
                  value={row.passengers}
                  onChange={(n) => onField(row, { passengers: n })}
                  w="w-[70px]"
                />
              </Labeled>
              <Labeled label="Features (comma separated)">
                <Text
                  value={row.features.join(", ")}
                  onChange={(v) => onField(row, { features: splitFeatures(v) })}
                  w="w-[230px]"
                />
              </Labeled>
              <Labeled label="Badge">
                <Text
                  value={row.badge ?? ""}
                  placeholder="—"
                  onChange={(v) => onField(row, { badge: v })}
                  w="w-[130px]"
                />
              </Labeled>
              <Labeled label="Available">
                <Toggle
                  on={row.inStock}
                  onClick={() => onField(row, { inStock: !row.inStock })}
                />
              </Labeled>

              <div className="self-end flex items-center gap-2 ml-auto">
                {row._custom ? (
                  <span className="text-[10px] font-semibold text-[#534ab7] bg-[#eeedfe] rounded-full px-2 py-1">
                    Custom
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[#9496a8] bg-[#f0f0f4] rounded-full px-2 py-1">
                    Built-in
                  </span>
                )}
                {row._custom ? (
                  <IconBtn
                    title="Delete vehicle"
                    onClick={() => deleteCustom(row.id)}
                    danger
                  >
                    <Trash2 size={15} />
                  </IconBtn>
                ) : (
                  <IconBtn
                    title={row._hidden ? "Show on site" : "Hide from site"}
                    onClick={() => toggleHide(row.id)}
                  >
                    {row._hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                  </IconBtn>
                )}
              </div>
            </div>
            {row._hidden && (
              <p className="text-[11px] text-[#c0392b] mt-3 flex items-center gap-1">
                <AlertCircle size={12} /> Hidden — not shown on the website.
                Click the eye to restore.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SaveButton dirty={dirty} saving={saving} saved={saved} onClick={save} />
      </div>
    </div>
  )
}

function splitFeatures(v: string): string[] {
  return v
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
}
