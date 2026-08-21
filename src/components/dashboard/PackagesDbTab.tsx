"use client"

import { useEffect, useState } from "react"

interface DbProduct {
  id: string
  name: string
  category: string
  imageUrl: string
  price: number
  discountPrice: number | null
}

interface PackageItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface DbPackage {
  id: string
  name: string
  brand: string
  solutionSlug: string
  description: string
  image: string
  badge: string
  items: PackageItem[]
  calculatedSubtotal: number
  packagePrice: number
  discountPercent: number
  installFeePerUnit: number
  totalUnits: number
  inStock: boolean
}

const SOLUTION_OPTIONS = [
  { value: "surveillance-evidence", label: "Surveillance & Evidence" },
  { value: "deterrence", label: "Deterrence" },
  { value: "commercial-security", label: "Commercial Security" },
  { value: "access-control", label: "Access Control" },
  { value: "smoke-alarms", label: "Smoke Alarms" },
  { value: "intercoms", label: "Intercoms" },
]

const EMPTY_FORM = {
  name: "",
  brand: "",
  solutionSlug: "surveillance-evidence",
  description: "",
  image: "",
  badge: "",
  discountPercent: 0,
  installFeePerUnit: 150,
  packagePrice: "", // empty string = auto-calculate
  inStock: true,
}

function unitPriceOf(p: DbProduct): number {
  return p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price
}

export default function PackagesDbTab() {
  const [allProducts, setAllProducts] = useState<DbProduct[]>([])
  const [packages, setPackages] = useState<DbPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const [prodRes, pkgRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/packages", { cache: "no-store" }),
      ])
      const prodData = await prodRes.json()
      const pkgData = await pkgRes.json()
      setAllProducts(prodData.products || [])
      setPackages(pkgData.packages || [])
    } catch (err) {
      console.error("Packages load error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setSelectedItems({})
    setEditingId(null)
  }

  const startEdit = (pkg: DbPackage) => {
    const itemsMap: Record<string, number> = {}
    pkg.items.forEach((it) => {
      itemsMap[it.productId] = it.quantity
    })
    setSelectedItems(itemsMap)
    setForm({
      name: pkg.name,
      brand: pkg.brand,
      solutionSlug: pkg.solutionSlug,
      description: pkg.description || "",
      image: pkg.image || "",
      badge: pkg.badge || "",
      discountPercent: pkg.discountPercent || 0,
      installFeePerUnit: Number(pkg.installFeePerUnit) || 150,
      packagePrice: String(pkg.packagePrice),
      inStock: pkg.inStock,
    })
    setEditingId(pkg.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (pkg: DbPackage) => {
    if (!confirm(`Delete "${pkg.name}"?`)) return
    await fetch(`/api/packages?id=${pkg.id}`, { method: "DELETE" })
    load()
  }

  const handleSave = async () => {
    const items = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }))
    if (!form.name || items.length === 0) {
      alert("Enter a package name and select at least one product.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: form.name,
          brand: form.brand,
          solutionSlug: form.solutionSlug,
          description: form.description,
          image: form.image,
          badge: form.badge,
          items,
          discountPercent: form.discountPercent,
          installFeePerUnit: form.installFeePerUnit,
          packagePrice: form.packagePrice ? Number(form.packagePrice) : null,
          inStock: form.inStock,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Could not save the package.")
        return
      }
      resetForm()
      load()
    } catch (err) {
      console.error("Save package error:", err)
      alert("Could not save the package.")
    } finally {
      setSaving(false)
    }
  }

  const visibleProducts = allProducts.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  )

  const previewItems = Object.entries(selectedItems)
    .map(([pid, qty]) => {
      const prod = allProducts.find((p) => p.id === pid)
      if (!prod) return null
      return { prod, qty, lineTotal: unitPriceOf(prod) * qty }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const subtotal = previewItems.reduce((sum, i) => sum + i.lineTotal, 0)
  const totalUnits = previewItems.reduce((sum, i) => sum + i.qty, 0)
  const installTotal = totalUnits * form.installFeePerUnit
  const autoPrice = (subtotal + installTotal) * (1 - (form.discountPercent || 0) / 100)

  const inp =
    "w-full border border-[#e8e8f0] rounded-[8px] px-3 h-[42px] text-[14px] focus:border-[#7f85f7] outline-none"
  const lbl = "text-[11px] font-semibold text-[#9496a8] uppercase tracking-wider block mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-[28px] text-[#1a1a2e]">Security Packages</h2>
        <button
          onClick={load}
          className="flex items-center gap-2 text-[13px] text-[#7f85f7] hover:underline"
        >
          🔄 Refresh
        </button>
      </div>
      <p className="text-[14px] text-[#666] mb-6">
        Build complete bundle deals from products already in your database — e.g. 4×
        cameras + 1× NVR sold as one package. Pricing is calculated from live product
        prices; you can override the final price.
      </p>

      {/* ── PACKAGE BUILDER FORM ── */}
      <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-6 mb-8">
        <h3 className="font-bold text-[16px] text-[#1a1a2e] mb-5">
          {editingId ? "Edit Package" : "+ Build New Package"}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={lbl}>Package Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inp}
              placeholder="e.g. HiLook 4-Camera Complete Kit"
            />
          </div>
          <div>
            <label className={lbl}>Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              className={inp}
              placeholder="e.g. HiLook"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={lbl}>Solution Category</label>
            <select
              value={form.solutionSlug}
              onChange={(e) => setForm((f) => ({ ...f, solutionSlug: e.target.value }))}
              className={`${inp} appearance-none cursor-pointer`}
            >
              {SOLUTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Badge (optional)</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className={inp}
              placeholder="e.g. Best Value"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className={lbl}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full border border-[#e8e8f0] rounded-[8px] px-3 py-2 text-[14px] focus:border-[#7f85f7] outline-none resize-none"
            placeholder="Complete 4-camera security setup with NVR recorder. Perfect for homes and small businesses."
          />
        </div>

        <div className="mb-4">
          <label className={lbl}>Package Image URL (optional)</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className={inp}
            placeholder="/images/products/hilook-4cam-kit.jpg"
          />
        </div>

        {/* ── PRODUCT SELECTOR ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className={`${lbl} mb-0`}>Select Products &amp; Quantities</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="border border-[#e8e8f0] rounded-[8px] px-3 h-[32px] text-[12px] w-[180px] focus:border-[#7f85f7] outline-none"
            />
          </div>
          <div className="border border-[#e8e8f0] rounded-[12px] max-h-[320px] overflow-y-auto">
            {loading ? (
              <p className="text-center text-[13px] text-[#9496a8] py-8">Loading products…</p>
            ) : visibleProducts.length === 0 ? (
              <p className="text-center text-[13px] text-[#9496a8] py-8">No products found.</p>
            ) : (
              visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f8] last:border-none hover:bg-[#fafaff]"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedItems[product.id]}
                    onChange={(e) => {
                      setSelectedItems((prev) => {
                        const next = { ...prev }
                        if (e.target.checked) next[product.id] = 1
                        else delete next[product.id]
                        return next
                      })
                    }}
                    className="w-4 h-4 accent-[#7f85f7] flex-shrink-0"
                  />

                  <div className="w-[48px] h-[36px] rounded-[6px] overflow-hidden bg-[#f0f0ff] flex-shrink-0">
                    {product.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a2e] truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-[#9496a8]">
                      {product.category || "Uncategorised"} · ${unitPriceOf(product).toFixed(2)}
                    </p>
                  </div>

                  {selectedItems[product.id] ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems((prev) => ({
                            ...prev,
                            [product.id]: Math.max(1, prev[product.id] - 1),
                          }))
                        }
                        className="w-6 h-6 rounded-full border border-[#e8e8f0] flex items-center justify-center text-[12px] hover:border-[#7f85f7]"
                      >
                        −
                      </button>
                      <span className="text-[13px] font-semibold w-[20px] text-center">
                        {selectedItems[product.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedItems((prev) => ({
                            ...prev,
                            [product.id]: prev[product.id] + 1,
                          }))
                        }
                        className="w-6 h-6 rounded-full border border-[#e8e8f0] flex items-center justify-center text-[12px] hover:border-[#7f85f7]"
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── LIVE CALCULATION PREVIEW ── */}
        {previewItems.length > 0 && (
          <div className="bg-[#f8f8ff] rounded-[14px] p-4 mb-4">
            <p className="text-[11px] font-bold text-[#9496a8] uppercase tracking-wider mb-3">
              Package Summary
            </p>
            {previewItems.map(({ prod, qty, lineTotal }) => (
              <div key={prod.id} className="flex justify-between text-[13px] py-1">
                <span className="text-[#444]">
                  {prod.name} × {qty}
                </span>
                <span className="font-medium text-[#1a1a2e]">${lineTotal.toFixed(2)}</span>
              </div>
            ))}

            <div className="flex justify-between text-[13px] py-1 border-t border-[#e0f0ea] mt-2 pt-2">
              <span className="text-[#666]">Products subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#666]">
                Installation ({totalUnits} × ${form.installFeePerUnit})
              </span>
              <span className="font-medium">${installTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[15px] font-bold pt-2 mt-1 border-t border-[#e0f0ea]">
              <span className="text-[#1a1a2e]">Calculated Total</span>
              <span className="text-[#0f6e56]">${autoPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── PRICE OVERRIDE + DISCOUNT ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={lbl}>
              Final Package Price
              <span className="normal-case text-[#c0c0c8] ml-1">(blank = auto-calculate)</span>
            </label>
            <input
              type="number"
              value={form.packagePrice}
              onChange={(e) => setForm((f) => ({ ...f, packagePrice: e.target.value }))}
              className={`${inp} font-bold text-[#0f6e56]`}
              placeholder="Auto from products + install"
            />
          </div>
          <div>
            <label className={lbl}>Install Fee Per Unit</label>
            <input
              type="number"
              value={form.installFeePerUnit}
              onChange={(e) =>
                setForm((f) => ({ ...f, installFeePerUnit: Number(e.target.value) }))
              }
              className={inp}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className={lbl}>Discount % (optional)</label>
          <input
            type="number"
            min={0}
            max={80}
            value={form.discountPercent}
            onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
            className={`${inp} w-[120px]`}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#7f85f7] text-white rounded-[10px] px-6 h-[46px] font-semibold text-[14px] hover:bg-[#6b71f0] disabled:opacity-50 transition-all"
          >
            {saving ? "Saving…" : editingId ? "Update Package" : "+ Create Package"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border-2 border-[#e8e8f0] text-[#666] rounded-[10px] px-6 h-[46px] font-semibold text-[14px]"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* ── EXISTING PACKAGES LIST ── */}
      <h3 className="font-bold text-[16px] text-[#1a1a2e] mb-4">
        Existing Packages ({packages.length})
      </h3>

      {loading ? (
        <div className="text-center py-12 text-[#9496a8]">Loading packages…</div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#e8e8f0] p-10 text-center text-[#9496a8]">
          No packages created yet. Build one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-[16px] border border-[#e8e8f0] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[15px] text-[#1a1a2e]">{pkg.name}</p>
                  <p className="text-[12px] text-[#9496a8]">
                    {pkg.brand} · {pkg.solutionSlug}
                    {!pkg.inStock && " · hidden"}
                  </p>
                </div>
                <p className="font-extrabold text-[18px] text-[#0f6e56]">
                  ${Number(pkg.packagePrice).toFixed(2)}
                </p>
              </div>

              <div className="text-[12px] text-[#666] mb-3">
                {pkg.items.map((item) => (
                  <p key={item.productId}>
                    • {item.productName} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(pkg)}
                  className="text-[12px] text-[#7f85f7] font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg)}
                  className="text-[12px] text-red-500 font-medium hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
