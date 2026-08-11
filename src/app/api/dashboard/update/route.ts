import {
  createProduct,
  updateProduct,
  deleteProduct,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/db"
import { readCatalog, writeCatalog } from "@/lib/catalog-store"
import {
  formatEstimateRange,
  itPackageKey,
  type ITServiceEstimateEdit,
  type ITServiceOverviewEdit,
} from "@/lib/catalog"
import type { ProductInput } from "@/lib/products"
import { parseColours, type VehicleInput } from "@/lib/vehicles"
import type { ITPackage } from "@/data/it-services"
import { itServiceItems, itServices } from "@/data/it-services"

// Dashboard save endpoint.
//
// type === "product": create / update / delete a Postgres-backed product
//   (powers the security solution grids and the "Products (DB)" tab).
// type === "vehicle": create / update / delete a Postgres-backed car rental
//   vehicle (powers the car rental pages and the "Car Rental" tab).
// type === "it-service-overview" / "it-package": persist the admin's edits as
//   catalog overrides in KV, merged over src/data/it-services.ts at read time.
//   These used to mutate the imported module array, which looked like it worked
//   but was lost on the next request (and was never visible to the client
//   bundle at all) — hence "changes reset on refresh".
//
// Security products are NOT handled here: their dashboard tab POSTs the whole
// override object to /api/catalog directly.

export const dynamic = "force-dynamic"

function coerceInput(p: Record<string, unknown>): ProductInput {
  const discount = p.discountPrice
  return {
    name: String(p.name ?? ""),
    description: String(p.description ?? ""),
    sku: String(p.sku ?? ""),
    imageUrl: String(p.imageUrl ?? ""),
    category: String(p.category ?? ""),
    price: Number(p.price ?? 0),
    discountPrice:
      discount === null || discount === undefined || discount === ""
        ? null
        : Number(discount),
    badge: p.badge ? String(p.badge) : null,
    inStock: p.inStock !== false,
    solutionSlug: String(p.solutionSlug ?? ""),
  }
}

async function handleProduct(data: Record<string, unknown>) {
  const action = String(data.action ?? "")
  try {
    if (action === "create") {
      const product = await createProduct(coerceInput(data))
      return Response.json({ success: true, product })
    }
    if (action === "update") {
      const id = String(data.id ?? "")
      if (!id) return Response.json({ success: false, error: "Missing id" }, { status: 400 })
      const product = await updateProduct(id, coerceInput(data))
      if (!product) return Response.json({ success: false, error: "Not found" }, { status: 404 })
      return Response.json({ success: true, product })
    }
    if (action === "delete") {
      const id = String(data.id ?? "")
      if (!id) return Response.json({ success: false, error: "Missing id" }, { status: 400 })
      const ok = await deleteProduct(id)
      return Response.json({ success: ok })
    }
    return Response.json({ success: false, error: "Unknown action" }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

function fail(error: string, status: number) {
  return Response.json({ success: false, error }, { status })
}

function coerceVehicle(v: Record<string, unknown>): VehicleInput {
  const num = (x: unknown) => {
    const n = Number(x ?? 0)
    return Number.isFinite(n) ? n : 0
  }
  return {
    name: String(v.name ?? ""),
    year: Math.round(num(v.year)),
    make: String(v.make ?? ""),
    model: String(v.model ?? ""),
    type: String(v.type ?? ""),
    rego: String(v.rego ?? ""),
    image: String(v.image ?? ""),
    // Drop blanks so an empty gallery slot never renders as a broken photo.
    images: Array.isArray(v.images)
      ? v.images.map((i) => String(i).trim()).filter(Boolean)
      : [],
    imageAlt: String(v.imageAlt ?? ""),
    weeklyRate: num(v.weeklyRate),
    bond: num(v.bond),
    available: v.available !== false,
    sortOrder: Math.round(num(v.sortOrder)),
    variant: String(v.variant ?? ""),
    fuelType: String(v.fuelType ?? ""),
    engine: String(v.engine ?? ""),
    transmission: String(v.transmission ?? ""),
    // Seats is a select in the dashboard, but a hand-rolled request could send
    // anything — 5 is the fleet's norm and keeps "0 Seats" off the site.
    seats: v.seats == null ? 5 : Math.round(num(v.seats)) || 5,
    // Accepts either the parsed array or the raw comma-separated string.
    colours: Array.isArray(v.colours)
      ? v.colours.map((c) => String(c).trim()).filter(Boolean)
      : parseColours(String(v.colours ?? "")),
  }
}

async function handleVehicle(data: Record<string, unknown>) {
  const action = String(data.action ?? "")
  // The vehicle is nested rather than spread at the top level: a vehicle has
  // its own `type` field (the body style — "Hatchback", "Ute"), which would
  // otherwise overwrite the `type` discriminator that routes this request.
  const payload =
    data.vehicle && typeof data.vehicle === "object"
      ? (data.vehicle as Record<string, unknown>)
      : {}
  try {
    if (action === "create") {
      const input = coerceVehicle(payload)
      if (!input.name.trim()) return fail("A vehicle needs a name", 400)
      return Response.json({ success: true, vehicle: await createVehicle(input) })
    }
    if (action === "update") {
      const id = String(data.id ?? "")
      if (!id) return fail("Missing id", 400)
      const vehicle = await updateVehicle(id, coerceVehicle(payload))
      if (!vehicle) return fail("Not found", 404)
      return Response.json({ success: true, vehicle })
    }
    if (action === "delete") {
      const id = String(data.id ?? "")
      if (!id) return fail("Missing id", 400)
      return Response.json({ success: await deleteVehicle(id) })
    }
    return fail("Unknown action", 400)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error"
    return fail(message, 500)
  }
}

async function handleItServiceOverview(data: Record<string, unknown>) {
  const serviceId = String(data.serviceId ?? "")
  if (!serviceId) return fail("Missing serviceId", 400)
  if (!itServiceItems.some((s) => s.id === serviceId)) {
    return fail(`Unknown service "${serviceId}"`, 404)
  }

  // Only persist fields the admin actually sent, so a partial payload never
  // blanks out the others.
  const edit: ITServiceOverviewEdit = {}
  if (typeof data.tagline === "string") edit.tagline = data.tagline
  if (typeof data.startingFrom === "string") edit.startingFrom = data.startingFrom
  if (typeof data.description === "string") edit.description = data.description

  try {
    const current = await readCatalog()
    const next = await writeCatalog({
      ...current,
      itServices: {
        ...current.itServices,
        services: {
          ...current.itServices.services,
          [serviceId]: { ...current.itServices.services[serviceId], ...edit },
        },
      },
    })
    return Response.json({ success: true, itServices: next.itServices })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save"
    return fail(message, 500)
  }
}

async function handleItPackage(data: Record<string, unknown>) {
  const serviceId = String(data.serviceId ?? "")
  const packageId = String(data.packageId ?? "")
  if (!serviceId || !packageId) return fail("Missing serviceId or packageId", 400)

  const service = itServiceItems.find((s) => s.id === serviceId)
  if (!service) return fail(`Unknown service "${serviceId}"`, 404)
  if (!service.packages.some((p) => p.id === packageId)) {
    return fail(`Unknown package "${packageId}"`, 404)
  }

  const edit: Partial<ITPackage> = {}
  if (typeof data.startingFrom === "string") edit.startingFrom = data.startingFrom
  if (data.startingFromValue !== undefined) {
    const n = Number(data.startingFromValue)
    if (!Number.isFinite(n) || n < 0) return fail("startingFromValue must be a number", 400)
    edit.startingFromValue = n
  }
  // An empty badge is meaningful — it clears the badge — so store it as-is.
  if (typeof data.badge === "string") edit.badge = data.badge
  if (Array.isArray(data.features)) {
    edit.features = data.features.map((f) => String(f).trim()).filter(Boolean)
  }

  const key = itPackageKey(serviceId, packageId)
  try {
    const current = await readCatalog()
    const next = await writeCatalog({
      ...current,
      itServices: {
        ...current.itServices,
        packages: {
          ...current.itServices.packages,
          [key]: { ...current.itServices.packages[key], ...edit },
        },
      },
    })
    return Response.json({ success: true, itServices: next.itServices })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save"
    return fail(message, 500)
  }
}

// type === "it-service": the estimate range, features and badge shown on the
// /services/it-services landing page and its brief form. Prices there are
// guides, not quotes, so only the range is editable — there is no line-item
// pricing to keep in step.
async function handleItService(data: Record<string, unknown>) {
  const serviceId = String(data.serviceId ?? "")
  if (!serviceId) return fail("Missing serviceId", 400)
  if (!itServices.some((s) => s.id === serviceId)) {
    return fail(`Unknown service "${serviceId}"`, 404)
  }

  const edit: ITServiceEstimateEdit = {}

  const money = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  if (data.estimatedFrom !== undefined) {
    const n = money(data.estimatedFrom)
    if (n === null) return fail("estimatedFrom must be a positive number", 400)
    edit.estimatedFrom = n
  }
  if (data.estimatedTo !== undefined) {
    const n = money(data.estimatedTo)
    if (n === null) return fail("estimatedTo must be a positive number", 400)
    edit.estimatedTo = n
  }
  if (
    edit.estimatedFrom !== undefined &&
    edit.estimatedTo !== undefined &&
    edit.estimatedFrom > edit.estimatedTo
  ) {
    return fail("The 'from' price cannot be higher than the 'to' price", 400)
  }

  // Trust the derived text only when it is absent — the dashboard sends it, but
  // a range with no display string would render blank on the site.
  if (typeof data.estimatedDisplay === "string" && data.estimatedDisplay.trim()) {
    edit.estimatedDisplay = data.estimatedDisplay.trim()
  } else if (edit.estimatedFrom !== undefined && edit.estimatedTo !== undefined) {
    edit.estimatedDisplay = formatEstimateRange(edit.estimatedFrom, edit.estimatedTo)
  }

  // An empty badge is meaningful — it clears the badge — so store it as-is.
  if (typeof data.badge === "string") edit.badge = data.badge
  if (Array.isArray(data.features)) {
    edit.features = data.features.map((f) => String(f).trim()).filter(Boolean)
  }

  try {
    const current = await readCatalog()
    const next = await writeCatalog({
      ...current,
      itServices: {
        ...current.itServices,
        estimates: {
          ...current.itServices.estimates,
          [serviceId]: { ...current.itServices.estimates[serviceId], ...edit },
        },
      },
    })
    return Response.json({ success: true, itServices: next.itServices })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save"
    return fail(message, 500)
  }
}

export async function POST(req: Request) {
  let data: Record<string, unknown>
  try {
    data = (await req.json()) as Record<string, unknown>
  } catch {
    return fail("Invalid JSON body", 400)
  }

  const type = String(data?.type ?? "")

  if (type === "product") return handleProduct(data)
  if (type === "vehicle") return handleVehicle(data)
  if (type === "it-service") return handleItService(data)
  if (type === "it-service-overview") return handleItServiceOverview(data)
  if (type === "it-package") return handleItPackage(data)

  // Previously this returned {success:true} for anything unrecognised, so a
  // typo'd type silently "saved". Fail loudly instead.
  return fail(`Unsupported update type "${type}"`, 400)
}
