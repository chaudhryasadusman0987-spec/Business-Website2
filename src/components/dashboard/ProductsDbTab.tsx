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
} from "lucide-react"
import { securitySolutions } from "@/data/security-solutions"
import {
  blankProductInput,
  type Product,
  type ProductInput,
} from "@/lib/products"
import ImageInput from "./ImageInput"
import { Labeled, Text, Num, Toggle, IconBtn } from "./catalog-ui"

// Postgres-backed product manager. Reads from /api/products?slug=… ; all writes
// go through /api/dashboard/update (type: "product"). Products assigned to the
// "surveillance-evidence" slug render live on that solution page. Other slugs
// are storable here too, though only surveillance reads from the DB today.

const SLUGS = securitySolutions.map((s) => ({ slug: s.slug, name: s.name }))

async function postUpdate(body: Record<string, unknown>) {
  const res = await fetch("/api/dashboard/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "product", ...body }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok && data?.success !== false, data }
}

function toInput(p: Product): ProductInput {
  return {
    name: p.name,
    description: p.description,
    sku: p.sku,
    imageUrl: p.imageUrl,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice,
    badge: p.badge,
    inStock: p.inStock,
    solutionSlug: p.solutionSlug,
  }
}

export default function ProductsDbTab() {
  const [slug, setSlug] = useState("surveillance-evidence")
  const [rows, setRows] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const [draft, setDraft] = useState<ProductInput>(() =>
    blankProductInput("surveillance-evidence"),
  )
  const [adding, setAdding] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data.products) ? data.products : [])
        setDirty({})
      })
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  const patch = (id: string, p: Partial<Product>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)))
    setDirty((d) => ({ ...d, [id]: true }))
  }

  const saveRow = async (row: Product) => {
    setSavingId(row.id)
    setError(null)
    const { ok, data } = await postUpdate({
      action: "update",
      id: row.id,
      ...toInput(row),
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

  const deleteRow = async (row: Product) => {
    const { ok, data } = await postUpdate({ action: "delete", id: row.id })
    if (!ok) {
      setError(data?.error ?? "Delete failed.")
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const addProduct = async () => {
    if (!draft.name.trim()) return
    setAdding(true)
    setError(null)
    const { ok, data } = await postUpdate({
      action: "create",
      ...draft,
      solutionSlug: slug,
    })
    setAdding(false)
    if (!ok) {
      setError(data?.error ?? "Could not add product.")
      return
    }
    setDraft(blankProductInput(slug))
    load()
  }

  const activeName = SLUGS.find((s) => s.slug === slug)?.name ?? slug

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="font-bold text-[28px] text-[#1a1a2e]">
            Products (Database)
          </h1>
          <p className="text-[#666] text-[14px] mt-1">
            Stored in Postgres. Products on{" "}
            <span className="font-semibold">Surveillance &amp; Evidence</span>{" "}
            show live on that solution page.
          </p>
        </div>
        <button
          onClick={load}
          className="bg-white border border-[#e8e8f0] rounded-[8px] px-4 h-[36px] flex items-center gap-2 text-[13px] text-[#666] hover:border-[#7f85f7] transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* solution slug selector */}
      <div className="flex gap-2 flex-wrap my-6">
        {SLUGS.map((s) => (
          <button
            key={s.slug}
            onClick={() => setSlug(s.slug)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border cursor-pointer transition-colors ${
              slug === s.slug
                ? "bg-[#7f85f7] border-[#7f85f7] text-white"
                : "bg-white border-[#e8e8f0] text-[#666] hover:border-[#7f85f7]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-[#c0392b] flex items-center gap-1.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {/* ── ADD NEW PRODUCT ── */}
      <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-6">
        <h2 className="font-bold text-[15px] text-[#1a1a2e] mb-4 flex items-center gap-2">
          <Plus size={16} className="text-[#7f85f7]" /> Add a product to{" "}
          {activeName}
        </h2>
        <div className="flex flex-wrap gap-5 items-start">
          <Labeled label="Image">
            <ImageInput
              value={draft.imageUrl}
              onChange={(v) => setDraft((d) => ({ ...d, imageUrl: v }))}
            />
          </Labeled>
          <Labeled label="Name">
            <Text
              value={draft.name}
              placeholder="e.g. 4K PTZ Camera"
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              w="w-[180px]"
            />
          </Labeled>
          <Labeled label="Description">
            <Text
              value={draft.description}
              placeholder="e.g. Pan-tilt-zoom, night vision, weatherproof"
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              w="w-[280px]"
            />
          </Labeled>
          <Labeled label="SKU">
            <Text
              value={draft.sku}
              placeholder="e.g. SUR-PTZ-4K"
              onChange={(v) => setDraft((d) => ({ ...d, sku: v }))}
              w="w-[130px]"
            />
          </Labeled>
          <Labeled label="Category">
            <Text
              value={draft.category}
              placeholder="e.g. Cameras"
              onChange={(v) => setDraft((d) => ({ ...d, category: v }))}
              w="w-[130px]"
            />
          </Labeled>
          <Labeled label="Price ($)">
            <Num
              value={draft.price}
              onChange={(n) => setDraft((d) => ({ ...d, price: n }))}
            />
          </Labeled>
          <Labeled label="Sale price (0 = none)">
            <Num
              value={draft.discountPrice ?? 0}
              onChange={(n) =>
                setDraft((d) => ({ ...d, discountPrice: n > 0 ? n : null }))
              }
            />
          </Labeled>
          <Labeled label="Badge (optional)">
            <Text
              value={draft.badge ?? ""}
              placeholder="e.g. New / Sale"
              onChange={(v) => setDraft((d) => ({ ...d, badge: v || null }))}
              w="w-[120px]"
            />
          </Labeled>
          <Labeled label="In stock">
            <Toggle
              on={draft.inStock}
              onClick={() => setDraft((d) => ({ ...d, inStock: !d.inStock }))}
            />
          </Labeled>
          <button
            onClick={addProduct}
            disabled={!draft.name.trim() || adding}
            className="self-end inline-flex items-center gap-1.5 bg-[#7f85f7] text-white rounded-[8px] h-[38px] px-4 text-[13px] font-medium hover:bg-[#6b71f0] transition-colors disabled:opacity-50"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      </div>

      {/* ── EXISTING PRODUCTS ── */}
      {loading ? (
        <p className="py-16 text-center text-[#9496a8] text-[14px]">
          Loading products…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-16 text-center text-[#9496a8] text-[14px]">
          No products yet for {activeName}. Add one above, or run{" "}
          <code className="text-[#534ab7]">/api/db/setup</code> once to seed.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-[16px] border border-[#e8e8f0] p-5"
            >
              <div className="flex flex-wrap gap-5 items-start">
                <Labeled label="Image">
                  <ImageInput
                    value={row.imageUrl}
                    onChange={(v) => patch(row.id, { imageUrl: v })}
                  />
                </Labeled>
                <Labeled label="Name">
                  <Text
                    value={row.name}
                    onChange={(v) => patch(row.id, { name: v })}
                    w="w-[180px]"
                  />
                </Labeled>
                <Labeled label="Description">
                  <Text
                    value={row.description}
                    onChange={(v) => patch(row.id, { description: v })}
                    w="w-[280px]"
                  />
                </Labeled>
                <Labeled label="SKU">
                  <Text
                    value={row.sku}
                    onChange={(v) => patch(row.id, { sku: v })}
                    w="w-[130px]"
                  />
                </Labeled>
                <Labeled label="Category">
                  <Text
                    value={row.category}
                    onChange={(v) => patch(row.id, { category: v })}
                    w="w-[130px]"
                  />
                </Labeled>
                <Labeled label="Price ($)">
                  <Num
                    value={row.price}
                    onChange={(n) => patch(row.id, { price: n })}
                  />
                </Labeled>
                <Labeled label="Sale price (0 = none)">
                  <Num
                    value={row.discountPrice ?? 0}
                    onChange={(n) =>
                      patch(row.id, { discountPrice: n > 0 ? n : null })
                    }
                  />
                </Labeled>
                <Labeled label="Badge">
                  <Text
                    value={row.badge ?? ""}
                    placeholder="—"
                    onChange={(v) => patch(row.id, { badge: v || null })}
                    w="w-[120px]"
                  />
                </Labeled>
                <Labeled label="In stock">
                  <Toggle
                    on={row.inStock}
                    onClick={() => patch(row.id, { inStock: !row.inStock })}
                  />
                </Labeled>

                <div className="self-end flex items-center gap-2 ml-auto">
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
                    title="Delete product"
                    onClick={() => deleteRow(row)}
                    danger
                  >
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </div>
              {dirty[row.id] && (
                <p className="text-[11px] text-[#c0392b] mt-3">
                  Unsaved changes — click Save to persist to the database.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
