"use client"

// SECURITY SOLUTIONS QUOTE WIZARD
// Ported from cctv_quote_form_template (1).html
// This handles ALL security solutions, not just CCTV.
// Theme stays GREEN (#0F6E56) per PROJECT.md — the rest of the site is purple.
//
// Pricing is driven by REAL products from Postgres (GET /api/products), not the
// static security-solutions.ts file. The customer picks categories, then picks
// individual products with quantities; the quote total is built from each
// product's live price (or sale price when discounted) + install fee + GST.
// Because the picker reads the same DB table the dashboard writes to, a product
// added in the dashboard appears here on the next page load with no code change.

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  Home,
  Building,
  Factory,
  Building2,
  Zap,
  CalendarDays,
  CalendarRange,
  Compass,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  FileText,
  CircleCheck,
  Phone,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import { securitySolutions, installFee, gstRate } from "@/data/security-solutions"
import { formatAUD } from "@/lib/formatters"
import { hasDiscount, type Product } from "@/lib/products"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { SITE_NAME, SITE_SUFFIX, SITE_PHONE } from "@/data/site"

// TODO(dashboard): move installFee and gstRate into a settings table so the
// owner can edit them from the dashboard without redeploying. For now they stay
// as constants imported from security-solutions.ts.

// The 6 known categories, in display order, derived from the static solution
// list. Only the LABELS come from here — every product shown comes from the DB.
const CATEGORIES = securitySolutions.map((s) => ({ slug: s.slug, name: s.name }))

const prettifySlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

const nameOfSlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? prettifySlug(slug)

const unitPriceOf = (p: Product) => (hasDiscount(p) ? p.discountPrice! : p.price)

const propertyTypes = [
  { val: "residential", label: "Residential", sub: "Home & apartments", Icon: Home },
  { val: "commercial", label: "Commercial", sub: "Offices & retail", Icon: Building },
  { val: "industrial", label: "Industrial", sub: "Warehouses & sites", Icon: Factory },
  { val: "strata", label: "Strata / Body Corp", sub: "Multi-unit buildings", Icon: Building2 },
]

const timings = [
  { val: "now", label: "ASAP", sub: "Within this week", Icon: Zap },
  { val: "2weeks", label: "Next 2 weeks", sub: "Planning ahead", Icon: CalendarDays },
  { val: "month", label: "This month", sub: "No rush", Icon: CalendarRange },
  { val: "later", label: "Just exploring", sub: "Getting a price idea", Icon: Compass },
]

function QuoteWizard() {
  const searchParams = useSearchParams()
  const preSolution = searchParams.get("solution")
  const preProduct = searchParams.get("product")

  const [step, setStep] = useState(0)
  const [ptype, setPtype] = useState<string | null>(null)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [qtyById, setQtyById] = useState<Record<string, number>>({})
  const [timing, setTiming] = useState<string | null>(null)
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    suburb: "",
    source: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Live product catalogue from Postgres.
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  // Fetch products once on mount. `cache: "no-store"` + the route's no-store
  // headers guarantee we always see current prices/stock, never a stale list —
  // so dashboard edits show up on the next page load.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" })
        if (!res.ok) throw new Error("Request failed")
        const data = (await res.json()) as { products?: Product[] }
        if (cancelled) return
        const list = data.products ?? []
        setProducts(list)
        // Preselect a specific product if arriving from a product card
        // (?product=id) — only if it's in stock.
        if (preProduct) {
          const p = list.find((x) => x.id === preProduct)
          if (p && p.inStock) {
            setQtyById((prev) => ({ ...prev, [p.id]: prev[p.id] ?? 1 }))
            setSelectedCats((prev) =>
              prev.includes(p.solutionSlug) ? prev : [...prev, p.solutionSlug]
            )
          }
        }
      } catch {
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [preProduct])

  // Preselect a category if arriving from a solution page (?solution=slug|id).
  useEffect(() => {
    if (!preSolution) return
    const match = securitySolutions.find(
      (s) => s.id === preSolution || s.slug === preSolution
    )
    const slug = match?.slug ?? preSolution
    setSelectedCats((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
  }, [preSolution])

  // Products grouped by solution slug, preserving DB order within each group.
  const byCategory = useMemo(() => {
    const map: Record<string, Product[]> = {}
    for (const p of products) {
      ;(map[p.solutionSlug] ??= []).push(p)
    }
    return map
  }, [products])

  const inStockCount = (slug: string) =>
    (byCategory[slug] ?? []).filter((p) => p.inStock).length

  const fromPriceOf = (slug: string) => {
    const inStock = (byCategory[slug] ?? []).filter((p) => p.inStock)
    return inStock.length ? Math.min(...inStock.map(unitPriceOf)) : null
  }

  const toggleCategory = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const changeQty = (id: string, delta: number) =>
    setQtyById((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }))

  // Itemised, priced selection — the single source of truth for the summary,
  // the running subtotal, and the email payload.
  const items = useMemo(() => {
    return products
      .filter((p) => (qtyById[p.id] ?? 0) > 0)
      .map((p) => {
        const qty = qtyById[p.id]
        const unitPrice = unitPriceOf(p)
        return {
          id: p.id,
          name: p.name,
          category: nameOfSlug(p.solutionSlug),
          qty,
          unitPrice,
          originalPrice: p.price,
          isOnSale: hasDiscount(p),
          lineTotal: unitPrice * qty,
        }
      })
  }, [products, qtyById])

  const itemsSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const subtotal = itemsSubtotal + installFee
  const gst = subtotal * gstRate
  const total = subtotal + gst

  const next = () => {
    if (step === 0 && !ptype) return setError("Please select a property type.")
    if (step === 1 && selectedCats.length === 0)
      return setError("Please select at least one category.")
    if (step === 2 && items.length === 0)
      return setError("Please add at least one product to your quote.")
    if (step === 3 && !timing) return setError("Please select a timeframe.")
    setError(null)
    setStep((s) => s + 1)
  }
  const back = () => {
    setError(null)
    setStep((s) => s - 1)
  }

  const submit = async () => {
    if (!form.fname || !form.email || !form.phone)
      return setError("Please fill in all required fields.")
    if (items.length === 0)
      return setError("Your quote is empty — please add at least one product.")
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/quote/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyType: ptype,
          timing,
          items: items.map((i) => ({
            name: i.name,
            category: i.category,
            qty: i.qty,
            unitPrice: i.unitPrice,
            originalPrice: i.originalPrice,
            isOnSale: i.isOnSale,
            lineTotal: i.lineTotal,
          })),
          installFee,
          subtotal,
          gst: Math.round(gst),
          total: Math.round(total),
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setSubmitted(true)
    } catch {
      setError("Something went wrong sending your quote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
          <CircleCheck size={28} className="text-[#0F6E56]" />
        </div>
        <h2 className="text-[20px] font-medium text-[#1a1a2e] mb-2">
          Quote sent successfully!
        </h2>
        <p className="text-[14px] text-gray-500 leading-relaxed">
          Your personalised quote has been emailed to you.
          <br />
          Our team will also follow up within 1 business day.
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] mt-5">
          <ShieldCheck size={13} /> Quote valid for 30 days
        </span>
      </div>
    )
  }

  // Hard failure fetching the catalogue — show a friendly fallback rather than
  // a broken, empty quote form.
  if (fetchError) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FDECEC] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-[#A32D2D]" />
        </div>
        <h2 className="text-[20px] font-medium text-[#1a1a2e] mb-2">
          We couldn&apos;t load our products
        </h2>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-5">
          Something went wrong loading the live catalogue.
          <br />
          Please call us and we&apos;ll put a quote together for you.
        </p>
        <a
          href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] text-white text-[14px] font-medium rounded-[8px] transition-colors"
        >
          <Phone size={16} /> Call {SITE_PHONE}
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 mb-8 border-b border-gray-200">
        <div className="w-[38px] h-[38px] rounded-[8px] bg-[#0F6E56] flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div className="text-[17px] font-medium text-[#1a1a2e]">
          {SITE_NAME}
          <span className="text-[#0F6E56]"> {SITE_SUFFIX}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-7">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step
                ? "bg-[#5DCAA5]"
                : i === step
                ? "bg-[#0F6E56]"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* STEP 0 — property type */}
      {step === 0 && (
        <Step label="Step 1 of 5" title="What type of property are you securing?">
          <div className="grid grid-cols-2 gap-2.5">
            {propertyTypes.map((p) => (
              <OptionCard
                key={p.val}
                selected={ptype === p.val}
                onClick={() => setPtype(p.val)}
                Icon={p.Icon}
                label={p.label}
                sub={p.sub}
              />
            ))}
          </div>
        </Step>
      )}

      {/* STEP 1 — categories */}
      {step === 1 && (
        <Step label="Step 2 of 5" title="Which security solutions do you need?">
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const count = inStockCount(c.slug)
                const from = fromPriceOf(c.slug)
                return (
                  <CheckItem
                    key={c.slug}
                    selected={selectedCats.includes(c.slug)}
                    onClick={() => toggleCategory(c.slug)}
                    label={c.name}
                    price={
                      count > 0
                        ? `${count} product${count === 1 ? "" : "s"} · from ${formatAUD(
                            from!
                          )}`
                        : "Contact us for options"
                    }
                  />
                )
              })}
            </div>
          )}
        </Step>
      )}

      {/* STEP 2 — product selection */}
      {step === 2 && (
        <Step label="Step 3 of 5" title="Select your products">
          {loading ? (
            <SkeletonList />
          ) : (
            <>
              {selectedCats.map((slug) => {
                const all = byCategory[slug] ?? []
                return (
                  <div key={slug} className="mb-6">
                    <h3 className="text-[14px] font-semibold text-[#1a1a2e] mb-2.5">
                      {nameOfSlug(slug)}
                    </h3>
                    {all.length === 0 ? (
                      <EmptyCategory />
                    ) : (
                      <div className="flex flex-col gap-2">
                        {all.map((p) => (
                          <ProductPick
                            key={p.id}
                            product={p}
                            qty={qtyById[p.id] ?? 0}
                            onChange={(delta) => changeQty(p.id, delta)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Live running subtotal */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 mt-2 flex items-center justify-between">
                <span className="text-[12px] text-gray-500">
                  {items.length === 0
                    ? "No products selected yet"
                    : `${items.reduce((n, i) => n + i.qty, 0)} item${
                        items.reduce((n, i) => n + i.qty, 0) === 1 ? "" : "s"
                      } selected`}
                </span>
                <span className="text-[15px] font-medium text-[#1a1a2e]">
                  {formatAUD(itemsSubtotal)}
                </span>
              </div>
            </>
          )}
        </Step>
      )}

      {/* STEP 3 — timing */}
      {step === 3 && (
        <Step label="Step 4 of 5" title="When are you looking to install?">
          <div className="grid grid-cols-2 gap-2.5">
            {timings.map((t) => (
              <OptionCard
                key={t.val}
                selected={timing === t.val}
                onClick={() => setTiming(t.val)}
                Icon={t.Icon}
                label={t.label}
                sub={t.sub}
              />
            ))}
          </div>
        </Step>
      )}

      {/* STEP 4 — contact + summary */}
      {step === 4 && (
        <Step label="Step 5 of 5" title="Your details & instant quote">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="First name" value={form.fname} placeholder="John"
              onChange={(v) => setForm({ ...form, fname: v })} />
            <Field label="Last name" value={form.lname} placeholder="Smith"
              onChange={(v) => setForm({ ...form, lname: v })} />
          </div>
          <Field label="Email address" type="email" value={form.email}
            placeholder="john@example.com.au"
            onChange={(v) => setForm({ ...form, email: v })} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Phone number" type="tel" value={form.phone}
              placeholder="04xx xxx xxx"
              onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Suburb / Postcode" value={form.suburb}
              placeholder="Brisbane, 4000"
              onChange={(v) => setForm({ ...form, suburb: v })} />
          </div>
          <div className="mb-4">
            <label className="text-[12px] text-gray-500 block mb-1">
              How did you hear about us?
            </label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-[14px] text-[#1a1a2e] bg-white"
            >
              <option value="">Select an option</option>
              <option>Google</option>
              <option>Social Media</option>
              <option>Referral</option>
              <option>Other</option>
            </select>
          </div>

          {/* Live summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-[12px] p-5 mb-3">
            <h3 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide mb-3">
              Quote summary
            </h3>
            {items.length === 0 ? (
              <p className="text-[13px] text-gray-500 py-2">
                No products selected. Go back to add products to your quote.
              </p>
            ) : (
              items.map((i) => (
                <div
                  key={i.id}
                  className="flex justify-between items-start py-1.5 border-b border-gray-200 last:border-0"
                >
                  <div className="pr-3">
                    <div className="text-[13px] text-[#1a1a2e]">
                      {i.name} <span className="text-gray-400">× {i.qty}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {i.category} ·{" "}
                      {i.isOnSale ? (
                        <>
                          <span className="text-[#c62828] font-medium">
                            {formatAUD(i.unitPrice)}
                          </span>{" "}
                          <span className="line-through">
                            {formatAUD(i.originalPrice)}
                          </span>{" "}
                          <span className="text-[#c62828] font-medium">ea</span>
                        </>
                      ) : (
                        <>{formatAUD(i.unitPrice)} ea</>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] text-[#1a1a2e] whitespace-nowrap">
                    {formatAUD(i.lineTotal)}
                  </span>
                </div>
              ))
            )}
            <Line left="Installation & labour" right={formatAUD(installFee)} />
            <Line muted left="Subtotal (ex. GST)" right={formatAUD(subtotal)} />
            <Line muted left="GST (10%)" right={formatAUD(Math.round(gst))} />
            <div className="flex justify-between text-[16px] font-medium text-[#1a1a2e] pt-2.5">
              <span>Total (AUD)</span>
              <span>{formatAUD(Math.round(total))}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E1F5EE] text-[#085041] mt-3">
              <ShieldCheck size={13} /> Valid 30 days · GST included
            </span>
          </div>
        </Step>
      )}

      {error && <p className="text-[12px] text-[#A32D2D] mt-1.5">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-2.5 mt-6">
        {step > 0 && (
          <button
            onClick={back}
            className="px-4 py-2.5 border border-gray-300 rounded-[8px] text-gray-500 text-[14px] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] text-white text-[14px] font-medium rounded-[8px] transition-colors"
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F6E56] hover:bg-[#085041] disabled:opacity-60 text-white text-[14px] font-medium rounded-[8px] transition-colors"
          >
            <FileText size={16} />{" "}
            {submitting ? "Sending…" : "Generate My Quote & Send Email"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Small presentational helpers ---- */

function Step({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[12px] font-medium text-[#0F6E56] uppercase tracking-[0.06em] mb-1.5">
        {label}
      </div>
      <div className="text-[20px] font-medium text-[#1a1a2e] mb-6 leading-snug">
        {title}
      </div>
      {children}
    </div>
  )
}

function OptionCard({
  selected,
  onClick,
  Icon,
  label,
  sub,
}: {
  selected: boolean
  onClick: () => void
  Icon: LucideIcon
  label: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-center rounded-[12px] p-4 transition-colors ${
        selected
          ? "border-2 border-[#0F6E56] bg-[#E1F5EE]"
          : "border border-gray-200 bg-white hover:border-[#5DCAA5]"
      }`}
    >
      <Icon size={26} className="text-[#0F6E56] mx-auto mb-2" />
      <div className="text-[13px] font-medium text-[#1a1a2e]">{label}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>
    </button>
  )
}

function CheckItem({
  selected,
  onClick,
  label,
  price,
}: {
  selected: boolean
  onClick: () => void
  label: string
  price: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left transition-colors ${
        selected
          ? "border-[1.5px] border-[#0F6E56] bg-[#E1F5EE]"
          : "border border-gray-200 bg-white hover:border-[#5DCAA5]"
      }`}
    >
      <ShieldCheck size={18} className="text-[#0F6E56] flex-shrink-0" />
      <span>
        <span className="block text-[13px] font-medium text-[#1a1a2e]">
          {label}
        </span>
        <span className="block text-[11px] text-gray-500">{price}</span>
      </span>
    </button>
  )
}

// One selectable product with image, sale-aware pricing and a quantity stepper.
function ProductPick({
  product,
  qty,
  onChange,
}: {
  product: Product
  qty: number
  onChange: (delta: number) => void
}) {
  const discounted = hasDiscount(product)
  const current = discounted ? product.discountPrice! : product.price
  const out = !product.inStock

  return (
    <div
      className={`flex items-center gap-3 border rounded-[10px] p-2.5 ${
        out
          ? "border-gray-200 bg-gray-50 opacity-70"
          : qty > 0
          ? "border-[1.5px] border-[#0F6E56] bg-[#F4FBF8]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-[#f0f5f3] flex-shrink-0">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          fallbackBg="#E1F5EE"
          fallbackIcon="ShieldCheck"
        />
        {discounted && !out && (
          <span className="absolute top-1 left-1 rounded-full bg-[#c62828] text-white text-[9px] font-bold px-1.5 py-0.5">
            Sale
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#1a1a2e] leading-snug">
          {product.name}
        </div>
        {product.description && (
          <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
            {product.description}
          </div>
        )}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          {out ? (
            <span className="text-[12px] font-medium text-[#A32D2D]">
              Out of Stock
            </span>
          ) : (
            <>
              <span className="text-[14px] font-semibold text-[#1a1a2e]">
                {formatAUD(current)}
              </span>
              {discounted && (
                <span className="text-[12px] text-gray-400 line-through">
                  {formatAUD(product.price)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {out ? (
        <span className="text-[11px] text-gray-400 px-2">Unavailable</span>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          <QtyBtn onClick={() => onChange(-1)} Icon={Minus} />
          <span className="text-[14px] font-medium min-w-[20px] text-center text-[#1a1a2e]">
            {qty}
          </span>
          <QtyBtn onClick={() => onChange(1)} Icon={Plus} />
        </div>
      )}
    </div>
  )
}

function EmptyCategory() {
  return (
    <div className="border border-dashed border-gray-300 rounded-[10px] px-4 py-5 text-center">
      <p className="text-[12px] text-gray-500">
        No products currently available in this category — contact us for a
        custom quote.
      </p>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] rounded-[8px] border border-gray-200 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[84px] rounded-[10px] border border-gray-200 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  )
}

function QtyBtn({
  onClick,
  Icon,
}: {
  onClick: () => void
  Icon: LucideIcon
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#1a1a2e] hover:bg-gray-50 transition-colors"
    >
      <Icon size={14} />
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="mb-4">
      <label className="text-[12px] text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-[14px] text-[#1a1a2e] bg-white"
      />
    </div>
  )
}

function Line({
  left,
  right,
  muted,
}: {
  left: string
  right: string
  muted?: boolean
}) {
  return (
    <div
      className={`flex justify-between py-1 border-b border-gray-200 last:border-0 ${
        muted ? "text-[12px] text-gray-500" : "text-[13px] text-[#1a1a2e]"
      }`}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  )
}

export default function SecurityQuoteForm() {
  return (
    <main className="bg-white min-h-screen">
      <Suspense fallback={null}>
        <QuoteWizard />
      </Suspense>
    </main>
  )
}
