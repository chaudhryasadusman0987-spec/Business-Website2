"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  Save,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Car,
} from "lucide-react"
import {
  blankVehicleInput,
  formatColours,
  parseColours,
  FUEL_TYPES,
  TRANSMISSIONS,
  SEAT_OPTIONS,
  type RentalVehicle,
  type VehicleInput,
} from "@/lib/vehicles"
import { getColourHex } from "@/lib/colourHex"
import ImageInput from "./ImageInput"
import GalleryInput from "./GalleryInput"
import { Labeled, Text, Num, Select, Toggle, IconBtn } from "./catalog-ui"

// Postgres-backed car rental fleet manager. Reads from /api/vehicles?all=1 ;
// all writes go through /api/dashboard/update (type: "vehicle"). The public car
// rental pages render this same list live, so adding a car — with its photos
// and weekly rate — takes effect without a redeploy.

// The vehicle is sent nested, not spread: a vehicle has its own `type` field
// (the body style) that would otherwise clobber the `type` discriminator the
// route uses to dispatch.
async function postUpdate(body: {
  action: "create" | "update" | "delete"
  id?: string
  vehicle?: VehicleInput
}) {
  const res = await fetch("/api/dashboard/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "vehicle", ...body }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok && data?.success !== false, data }
}

function toInput(v: RentalVehicle): VehicleInput {
  return {
    name: v.name,
    year: v.year,
    make: v.make,
    model: v.model,
    type: v.type,
    rego: v.rego,
    image: v.image,
    images: v.images,
    imageAlt: v.imageAlt,
    weeklyRate: v.weeklyRate,
    bond: v.bond,
    available: v.available,
    sortOrder: v.sortOrder,
    variant: v.variant,
    fuelType: v.fuelType,
    engine: v.engine,
    transmission: v.transmission,
    seats: v.seats,
    colours: v.colours,
  }
}

export default function VehiclesDbTab() {
  const [rows, setRows] = useState<RentalVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const [draft, setDraft] = useState<VehicleInput>(blankVehicleInput)
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    // ?all=1 so vehicles taken off the site still show here and can be edited
    // back on — hiding one from customers must not hide it from the admin.
    fetch("/api/vehicles?all=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data.vehicles) ? data.vehicles : [])
        if (data.error) setError(data.error)
        setDirty({})
      })
      .catch(() => setError("Could not load the fleet."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const patch = (id: string, p: Partial<RentalVehicle>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)))
    setDirty((d) => ({ ...d, [id]: true }))
  }

  const saveRow = async (row: RentalVehicle) => {
    setSavingId(row.id)
    setError(null)
    const { ok, data } = await postUpdate({
      action: "update",
      id: row.id,
      vehicle: toInput(row),
    })
    setSavingId(null)
    if (!ok) {
      setError(data?.error ?? "Save failed — check the database connection.")
      return
    }
    setDirty((d) => ({ ...d, [row.id]: false }))
    setSavedId(row.id)
    setTimeout(() => setSavedId((s) => (s === row.id ? null : s)), 2000)
  }

  const deleteRow = async (row: RentalVehicle) => {
    const { ok, data } = await postUpdate({ action: "delete", id: row.id })
    if (!ok) {
      setError(data?.error ?? "Delete failed.")
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const addVehicle = async () => {
    if (!draft.name.trim()) return
    setAdding(true)
    setError(null)
    // New cars go to the end of the fleet unless the admin set an order.
    const sortOrder =
      draft.sortOrder || Math.max(0, ...rows.map((r) => r.sortOrder)) + 1
    const { ok, data } = await postUpdate({
      action: "create",
      vehicle: {
        ...draft,
        sortOrder,
        imageAlt: draft.imageAlt.trim() || draft.name.trim(),
      },
    })
    setAdding(false)
    if (!ok) {
      setError(data?.error ?? "Could not add the vehicle.")
      return
    }
    setDraft(blankVehicleInput())
    setShowAdd(false)
    load()
  }

  const missingRate = rows.filter((r) => r.weeklyRate <= 0).length

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="font-bold text-[28px] text-[#1a1a2e]">
            Car Rental — Fleet
          </h1>
          <p className="text-[#666] text-[14px] mt-1">
            Stored in the database. Photos and weekly rates go live on the car
            rental pages as soon as you save — no redeploy needed.
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors flex-shrink-0"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* summary strip */}
      <div className="flex gap-3 flex-wrap my-6">
        <span className="bg-white border border-[#e8e8f0] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#1a1a2e]">
          {rows.length} vehicles
        </span>
        <span className="bg-white border border-[#e8e8f0] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#1a1a2e]">
          {rows.filter((r) => r.available).length} shown on site
        </span>
        {missingRate > 0 && (
          <span className="bg-[rgba(245,124,0,0.12)] border border-[#f0a868] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#b45a00]">
            {missingRate} without a weekly rate
          </span>
        )}
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-[#c0392b] flex items-center gap-1.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {/* ── ADD A VEHICLE ── */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="mb-6 inline-flex items-center gap-2 bg-[#7f85f7] text-white rounded-[10px] h-[44px] px-5 text-[14px] font-semibold hover:bg-[#6b71f0] transition-colors"
        >
          <Plus size={16} /> Add a vehicle
        </button>
      ) : (
        <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-6">
          <h2 className="font-bold text-[15px] text-[#1a1a2e] mb-5 flex items-center gap-2">
            <Car size={16} className="text-[#7f85f7]" /> New vehicle
          </h2>
          <VehicleFields
            v={draft}
            onChange={(p) => setDraft((d) => ({ ...d, ...p }))}
          />
          <div className="flex gap-3 mt-6 pt-5 border-t border-[#f0f0f8]">
            <button
              onClick={addVehicle}
              disabled={!draft.name.trim() || adding}
              className="inline-flex items-center gap-1.5 bg-[#7f85f7] text-white rounded-[8px] h-[40px] px-5 text-[13px] font-semibold hover:bg-[#6b71f0] transition-colors disabled:opacity-50"
            >
              {adding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Add to the fleet
            </button>
            <button
              onClick={() => {
                setShowAdd(false)
                setDraft(blankVehicleInput())
              }}
              className="rounded-[8px] h-[40px] px-5 text-[13px] font-medium border border-[#e8e8f0] text-[#666] hover:border-[#7f85f7] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── THE FLEET ── */}
      {loading ? (
        <p className="py-16 text-center text-[#9496a8] text-[14px]">
          Loading the fleet…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-[#9496a8] text-[14px]">
          No vehicles yet. Add one above, or run{" "}
          <code className="text-[#534ab7]">/api/db/setup</code> once to seed the
          original fleet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`bg-white rounded-[16px] border p-5 ${
                row.available ? "border-[#e8e8f0]" : "border-[#f0d0d0]"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-[#f0f0f8]">
                <div className="min-w-0">
                  <p className="font-bold text-[15px] text-[#1a1a2e] truncate">
                    {row.name || "Untitled vehicle"}
                  </p>
                  <p className="text-[12px] text-[#9496a8]">
                    {row.rego || "no rego"} ·{" "}
                    {row.weeklyRate > 0
                      ? `$${row.weeklyRate.toLocaleString("en-AU")}/week`
                      : "no weekly rate set"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => saveRow(row)}
                    disabled={!dirty[row.id] && savedId !== row.id}
                    className={`rounded-[8px] px-4 h-[38px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                      savedId === row.id
                        ? "bg-[#2e7d32] text-white"
                        : "bg-[#7f85f7] text-white hover:bg-[#6b71f0] disabled:opacity-40"
                    }`}
                  >
                    {savingId === row.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving…
                      </>
                    ) : savedId === row.id ? (
                      <>
                        <Check size={13} /> Saved
                      </>
                    ) : (
                      <>
                        <Save size={13} /> Save
                      </>
                    )}
                  </button>
                  <IconBtn
                    title="Delete this vehicle"
                    onClick={() => deleteRow(row)}
                    danger
                  >
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </div>

              <VehicleFields v={row} onChange={(p) => patch(row.id, p)} />

              {dirty[row.id] && (
                <p className="text-[11px] text-[#c0392b] mt-4">
                  Unsaved changes — click Save to publish them to the site.
                </p>
              )}
              {!row.available && (
                <p className="text-[11px] text-[#c0392b] mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Hidden — this car is not shown to
                  customers. Switch &ldquo;Show on site&rdquo; back on to
                  restore it.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The editable fields for one vehicle. Shared by the add form and every fleet
 * row so a new field only has to be added in one place.
 */
function VehicleFields({
  v,
  onChange,
}: {
  v: VehicleInput
  onChange: (patch: Partial<VehicleInput>) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* photos */}
      <div className="flex flex-wrap gap-8 items-start">
        <Labeled label="Main photo (card)">
          <ImageInput
            value={v.image}
            onChange={(img) => onChange({ image: img })}
          />
        </Labeled>
        <Labeled label="Gallery photos (detail modal)">
          <GalleryInput
            value={v.images}
            onChange={(images) => onChange({ images })}
          />
        </Labeled>
      </div>

      {/* identity */}
      <div className="flex flex-wrap gap-5 items-start">
        <Labeled label="Name (shown on the card)">
          <Text
            value={v.name}
            placeholder="e.g. 2016 Toyota Camry Hybrid"
            onChange={(name) => onChange({ name })}
            w="w-[240px]"
          />
        </Labeled>
        <Labeled label="Year">
          <Num value={v.year} onChange={(year) => onChange({ year })} w="w-[80px]" />
        </Labeled>
        <Labeled label="Make">
          <Text
            value={v.make}
            placeholder="Toyota"
            onChange={(make) => onChange({ make })}
            w="w-[130px]"
          />
        </Labeled>
        <Labeled label="Model">
          <Text
            value={v.model}
            placeholder="Camry"
            onChange={(model) => onChange({ model })}
            w="w-[130px]"
          />
        </Labeled>
        <Labeled label="Body type">
          <Text
            value={v.type}
            placeholder="Hybrid Sedan"
            onChange={(type) => onChange({ type })}
            w="w-[140px]"
          />
        </Labeled>
        <Labeled label="Rego">
          <Text
            value={v.rego}
            placeholder="046QH5"
            onChange={(rego) => onChange({ rego })}
            w="w-[110px]"
          />
        </Labeled>
      </div>

      {/* money + visibility */}
      <div className="flex flex-wrap gap-5 items-start">
        <Labeled label="Weekly rent ($)">
          <Num
            value={v.weeklyRate}
            onChange={(weeklyRate) => onChange({ weeklyRate })}
            w="w-[110px]"
          />
        </Labeled>
        <Labeled label="Bond ($)">
          <Num value={v.bond} onChange={(bond) => onChange({ bond })} w="w-[110px]" />
        </Labeled>
        <Labeled label="Order">
          <Num
            value={v.sortOrder}
            onChange={(sortOrder) => onChange({ sortOrder })}
            w="w-[80px]"
          />
        </Labeled>
        <Labeled label="Photo alt text (SEO)">
          <Text
            value={v.imageAlt}
            placeholder="Defaults to the name"
            onChange={(imageAlt) => onChange({ imageAlt })}
            w="w-[260px]"
          />
        </Labeled>
        <Labeled label="Show on site">
          <Toggle
            on={v.available}
            onClick={() => onChange({ available: !v.available })}
          />
        </Labeled>
      </div>

      <p className="text-[11px] text-[#9496a8] -mt-2">
        Leave the weekly rent at 0 and the site shows &ldquo;Ask us&rdquo;
        instead of a price. Lower &ldquo;Order&rdquo; numbers appear first in
        the fleet.
      </p>

      {/* specifications — the grid shown in the customer's detail modal */}
      <div className="border-t border-[#f0f0f8] pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1a1a2e] mb-4">
          Specifications
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Labeled label="Variant">
            <Text
              value={v.variant}
              placeholder="e.g. AVV50R Atara SL Sedan"
              onChange={(variant) => onChange({ variant })}
              w="w-full"
            />
          </Labeled>
          <Labeled label="Fuel type">
            <Select
              value={v.fuelType}
              options={FUEL_TYPES}
              onChange={(fuelType) => onChange({ fuelType })}
              w="w-full"
            />
          </Labeled>
          <Labeled label="Engine">
            <Text
              value={v.engine}
              placeholder="e.g. 2.5L 4 Cylinder"
              onChange={(engine) => onChange({ engine })}
              w="w-full"
            />
          </Labeled>
          <Labeled label="Transmission">
            <Select
              value={v.transmission}
              options={TRANSMISSIONS}
              onChange={(transmission) => onChange({ transmission })}
              w="w-full"
            />
          </Labeled>
          <Labeled label="Seats">
            <Select
              value={String(v.seats)}
              options={SEAT_OPTIONS.map(String)}
              onChange={(s) => onChange({ seats: Number(s) || 5 })}
              w="w-full"
            />
          </Labeled>
          <Labeled label="Available colours">
            <ColoursInput
              value={v.colours}
              onChange={(colours) => onChange({ colours })}
            />
          </Labeled>
        </div>
      </div>
    </div>
  )
}

/**
 * Colours as one comma-separated box. The raw text is held locally while the
 * admin types — parsing on every keystroke would delete the comma they just
 * typed — and the parsed list is pushed up as they go.
 */
function ColoursInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (colours: string[]) => void
}) {
  const [raw, setRaw] = useState(() => formatColours(value))

  // Re-sync when the row is replaced from outside (a refresh, or the add form
  // clearing after a save) but not while the admin is mid-word.
  useEffect(() => {
    if (formatColours(parseColours(raw)) !== formatColours(value)) {
      setRaw(formatColours(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div>
      <input
        type="text"
        value={raw}
        placeholder="White, Silver, Black"
        onChange={(e) => {
          setRaw(e.target.value)
          onChange(parseColours(e.target.value))
        }}
        className="w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[38px] text-[13px] text-[#1a1a2e] focus:border-[#7f85f7] outline-none"
      />
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-[10px] text-[#9496a8]">Comma separated</span>
        {value.map((c) => (
          <span
            key={c}
            title={c}
            className="w-3.5 h-3.5 rounded-full border border-[#e0e0e0] flex-shrink-0"
            style={{ background: getColourHex(c) }}
          />
        ))}
      </div>
    </div>
  )
}
