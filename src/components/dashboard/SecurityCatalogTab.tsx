"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { securitySolutions } from "@/data/security-solutions"
import {
  EMPTY_OVERRIDES,
  EMPTY_SOLUTION_OVERRIDE,
  makeCustomId,
  normaliseOverrides,
  type CatalogOverrides,
  type SecurityProduct,
} from "@/lib/catalog"
import ImageInput from "./ImageInput"
import { Labeled, Text, Num, Toggle, IconBtn, SaveButton } from "./catalog-ui"

type Row = SecurityProduct & { _custom: boolean; _hidden: boolean }

const blankProduct = (): Omit<SecurityProduct, "id"> => ({
  name: "",
  description: "",
  price: 0,
  unit: "per unit",
  inStock: true,
  image: "",
  badge: "",
})

export default function SecurityCatalogTab() {
  const [overrides, setOverrides] = useState<CatalogOverrides>(EMPTY_OVERRIDES)
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sid, setSid] = useState(securitySolutions[0].id)

  // add-form state
  const [draft, setDraft] = useState(blankProduct())

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setOverrides(normaliseOverrides(data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeSolution =
    securitySolutions.find((s) => s.id === sid) ?? securitySolutions[0]

  const update = (fn: (prev: CatalogOverrides) => CatalogOverrides) => {
    setOverrides(fn)
    setDirty(true)
  }

  const o = overrides.security[sid] ?? EMPTY_SOLUTION_OVERRIDE

  const rows: Row[] = useMemo(() => {
    const builtin = activeSolution.products.map((p) => ({
      ...p,
      ...o.edits[p.id],
      _custom: false,
      _hidden: o.removed.includes(p.id),
    }))
    const custom = o.added.map((p) => ({ ...p, _custom: true, _hidden: false }))
    return [...builtin, ...custom]
  }, [activeSolution, o])

  /* ── mutations ── */
  const patchBuiltin = (id: string, patch: Partial<SecurityProduct>) =>
    update((prev) => {
      const cur = prev.security[sid] ?? EMPTY_SOLUTION_OVERRIDE
      return {
        ...prev,
        security: {
          ...prev.security,
          [sid]: {
            ...cur,
            edits: { ...cur.edits, [id]: { ...cur.edits[id], ...patch } },
          },
        },
      }
    })

  const patchCustom = (id: string, patch: Partial<SecurityProduct>) =>
    update((prev) => {
      const cur = prev.security[sid] ?? EMPTY_SOLUTION_OVERRIDE
      return {
        ...prev,
        security: {
          ...prev.security,
          [sid]: {
            ...cur,
            added: cur.added.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        },
      }
    })

  const onField = (row: Row, patch: Partial<SecurityProduct>) =>
    row._custom ? patchCustom(row.id, patch) : patchBuiltin(row.id, patch)

  const toggleHide = (id: string) =>
    update((prev) => {
      const cur = prev.security[sid] ?? EMPTY_SOLUTION_OVERRIDE
      const removed = cur.removed.includes(id)
        ? cur.removed.filter((x) => x !== id)
        : [...cur.removed, id]
      return { ...prev, security: { ...prev.security, [sid]: { ...cur, removed } } }
    })

  const deleteCustom = (id: string) =>
    update((prev) => {
      const cur = prev.security[sid] ?? EMPTY_SOLUTION_OVERRIDE
      return {
        ...prev,
        security: {
          ...prev.security,
          [sid]: { ...cur, added: cur.added.filter((p) => p.id !== id) },
        },
      }
    })

  const addProduct = () => {
    if (!draft.name.trim()) return
    const product: SecurityProduct = { ...draft, id: makeCustomId("sec") }
    update((prev) => {
      const cur = prev.security[sid] ?? EMPTY_SOLUTION_OVERRIDE
      return {
        ...prev,
        security: { ...prev.security, [sid]: { ...cur, added: [...cur.added, product] } },
      }
    })
    setDraft(blankProduct())
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
      /* ignore — stays dirty so the admin can retry */
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-[#9496a8] text-[14px]">
        Loading products…
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="font-bold text-[28px] text-[#1a1a2e]">
            Security Solutions — Products
          </h1>
          <p className="text-[#666] text-[14px] mt-1">
            Add, edit or remove products. Changes go live on the matching
            product page after you Save.
          </p>
        </div>
        <SaveButton dirty={dirty} saving={saving} saved={saved} onClick={save} />
      </div>

      {/* solution tabs */}
      <div className="flex gap-2 flex-wrap my-6">
        {securitySolutions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSid(s.id)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
              sid === s.id
                ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* ── ADD NEW PRODUCT ── */}
      <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-6">
        <h2 className="font-bold text-[15px] text-[#1a1a2e] mb-4 flex items-center gap-2">
          <Plus size={16} className="text-[#7f85f7]" /> Add a product to{" "}
          {activeSolution.name}
        </h2>
        <div className="flex flex-wrap gap-5 items-start">
          <Labeled label="Image">
            <ImageInput
              value={draft.image}
              onChange={(v) => setDraft((d) => ({ ...d, image: v }))}
            />
          </Labeled>
          <Labeled label="Name">
            <Text
              value={draft.name}
              placeholder="e.g. 4K PTZ Camera"
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              w="w-[190px]"
            />
          </Labeled>
          <Labeled label="Short description">
            <Text
              value={draft.description}
              placeholder="e.g. Pan-tilt-zoom, night vision"
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              w="w-[240px]"
            />
          </Labeled>
          <Labeled label="Price ($)">
            <Num
              value={draft.price}
              onChange={(n) => setDraft((d) => ({ ...d, price: n }))}
            />
          </Labeled>
          <Labeled label="Unit">
            <Text
              value={draft.unit}
              placeholder="per camera"
              onChange={(v) => setDraft((d) => ({ ...d, unit: v }))}
              w="w-[110px]"
            />
          </Labeled>
          <Labeled label="Badge (optional)">
            <Text
              value={draft.badge ?? ""}
              placeholder="e.g. New"
              onChange={(v) => setDraft((d) => ({ ...d, badge: v }))}
              w="w-[110px]"
            />
          </Labeled>
          <button
            onClick={addProduct}
            disabled={!draft.name.trim()}
            className="self-end inline-flex items-center gap-1.5 bg-[#7f85f7] text-white rounded-[8px] h-[38px] px-4 text-[13px] font-medium hover:bg-[#6b71f0] transition-colors disabled:opacity-50"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* ── EXISTING PRODUCTS ── */}
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
              <Labeled label="Name">
                <Text
                  value={row.name}
                  onChange={(v) => onField(row, { name: v })}
                  w="w-[190px]"
                />
              </Labeled>
              <Labeled label="Short description">
                <Text
                  value={row.description}
                  onChange={(v) => onField(row, { description: v })}
                  w="w-[240px]"
                />
              </Labeled>
              <Labeled label="Price ($)">
                <Num
                  value={row.price}
                  onChange={(n) => onField(row, { price: n })}
                />
              </Labeled>
              <Labeled label="Unit">
                <Text
                  value={row.unit}
                  onChange={(v) => onField(row, { unit: v })}
                  w="w-[110px]"
                />
              </Labeled>
              <Labeled label="Badge">
                <Text
                  value={row.badge ?? ""}
                  placeholder="—"
                  onChange={(v) => onField(row, { badge: v })}
                  w="w-[110px]"
                />
              </Labeled>
              <Labeled label="In stock">
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
                    title="Delete product"
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

      {/* bottom save */}
      <div className="mt-8">
        <SaveButton dirty={dirty} saving={saving} saved={saved} onClick={save} />
      </div>
    </div>
  )
}
