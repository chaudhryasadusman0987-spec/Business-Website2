import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { securitySolutions } from "@/data/security-solutions"
import { seedVehicles as VEHICLE_SEED } from "@/data/car-rental"
import type { Product, ProductInput } from "@/lib/products"
import type { RentalVehicle, VehicleInput } from "@/lib/vehicles"

// Database layer. Server-only (imports @neondatabase/serverless) — only import
// from route handlers, never from client components. Connects via DATABASE_URL
// (injected by Vercel's native Neon integration; we also accept POSTGRES_URL).
// The client is created lazily so a missing connection string surfaces as a
// clear error at query time rather than crashing on import; callers wrap reads
// so the public page falls back to an empty grid instead of 500ing.
//
// This holds two catalogs — security `products` and car rental `vehicles` —
// plus a generic `site_settings` key/JSONB table used for dashboard-editable
// settings (see catalog-store.ts). Leads stay on Vercel KV.

let client: NeonQueryFunction<false, false> | null = null

function sql(): NeonQueryFunction<false, false> {
  if (client) return client
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) {
    throw new Error(
      "No database connection string — set DATABASE_URL (or POSTGRES_URL).",
    )
  }
  // The Neon serverless driver runs every query as an HTTP `fetch` to the
  // Neon SQL endpoint. In the Next.js App Router that fetch is wrapped by the
  // Data Cache, so without this the very first SELECT result gets cached and
  // re-served forever — newly inserted/updated products persist in Postgres but
  // never appear on refresh. `cache: "no-store"` opts those queries out so
  // reads always hit the live database.
  client = neon(url, { fetchOptions: { cache: "no-store" } })
  return client
}

// Categories for the seeded surveillance products (the static data file has no
// category field). Products without an entry seed with no category; the admin
// can add one later in the dashboard.
const SEED_CATEGORY: Record<string, string> = {
  "hd-bullet-cam": "Cameras",
  "dome-cam": "Cameras",
  "ptz-cam": "Cameras",
  "solar-cam": "Cameras",
  "nvr-system": "Recorders",
  "doorbell-cam": "Doorbells",
}

interface ProductRow {
  id: string
  name: string
  description: string | null
  sku: string | null
  image_url: string | null
  category: string | null
  price: string | number
  discount_price: string | number | null
  badge: string | null
  in_stock: boolean
  solution_slug: string
  created_at: string | Date
}

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    sku: r.sku ?? "",
    imageUrl: r.image_url ?? "",
    category: r.category ?? "",
    // NUMERIC comes back as a string from the driver.
    price: Number(r.price),
    discountPrice: r.discount_price == null ? null : Number(r.discount_price),
    badge: r.badge ?? null,
    inStock: r.in_stock,
    solutionSlug: r.solution_slug,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
  }
}

/** True when a connection string is configured, so callers can pick a fallback. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL)
}

/**
 * Generic settings table. One row per setting key, value as JSONB — dashboard
 * settings need no schema migration when a new editable field appears.
 * Created by ensureSchema(); createSettingsTable() lets a caller create just
 * this table lazily without touching the products schema.
 */
export async function createSettingsTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

/** Read one setting, or null when the key has never been written. */
export async function readSetting<T = unknown>(key: string): Promise<T | null> {
  const rows = (await sql()`
    SELECT value FROM site_settings WHERE key = ${key}
  `) as { value: T }[]
  return rows[0]?.value ?? null
}

/** Upsert one setting. Overwrites the whole value. */
export async function writeSetting(key: string, value: unknown): Promise<void> {
  // The driver serialises objects to a JSON string; cast it back to jsonb.
  const json = JSON.stringify(value)
  await sql()`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${json}::jsonb, now())
    ON CONFLICT (key) DO UPDATE
      SET value = ${json}::jsonb, updated_at = now()
  `
}

/** Create the vehicles table if absent. Idempotent. */
export async function createVehiclesTable(): Promise<void> {
  const db = sql()
  await db`
    CREATE TABLE IF NOT EXISTS vehicles (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      year        INTEGER NOT NULL DEFAULT 0,
      make        TEXT,
      model       TEXT,
      type        TEXT,
      rego        TEXT,
      image       TEXT,
      images      JSONB NOT NULL DEFAULT '[]'::jsonb,
      image_alt   TEXT,
      weekly_rate NUMERIC NOT NULL DEFAULT 0,
      bond        NUMERIC NOT NULL DEFAULT 0,
      available   BOOLEAN NOT NULL DEFAULT true,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      variant      TEXT,
      fuel_type    TEXT,
      engine       TEXT,
      transmission TEXT,
      seats        INTEGER NOT NULL DEFAULT 5,
      colours      JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`
    CREATE INDEX IF NOT EXISTS vehicles_sort_order_idx ON vehicles (sort_order)
  `
  // Migrations for fleets created before the specification columns existed.
  // The live table predates them, so these run on the next /api/db/setup.
  await db`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS variant TEXT`
  await db`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT`
  await db`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine TEXT`
  await db`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission TEXT`
  await db`
    ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INTEGER NOT NULL DEFAULT 5
  `
  await db`
    ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS colours JSONB NOT NULL DEFAULT '[]'::jsonb
  `
}

/** Create the active_rentals table if absent. Idempotent. */
export async function createActiveRentalsTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS active_rentals (
      id                 TEXT PRIMARY KEY,
      vehicle_id         TEXT NOT NULL,
      vehicle_name       TEXT NOT NULL,
      vehicle_rego       TEXT NOT NULL,
      customer_name      TEXT NOT NULL,
      customer_email     TEXT NOT NULL,
      customer_phone     TEXT NOT NULL,
      weekly_rent        NUMERIC NOT NULL,
      last_payment_date  TIMESTAMPTZ NOT NULL,
      next_due_date      TIMESTAMPTZ NOT NULL,
      status             TEXT NOT NULL DEFAULT 'active',
      reminder_sent_at   TIMESTAMPTZ,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

/** Create the price_negotiations table if absent. Idempotent. */
export async function createNegotiationsTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS price_negotiations (
      id             TEXT PRIMARY KEY,
      vehicle_id     TEXT NOT NULL,
      vehicle_name   TEXT NOT NULL,
      customer_name  TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      listed_price   NUMERIC NOT NULL,
      offered_price  NUMERIC NOT NULL,
      status         TEXT NOT NULL DEFAULT 'pending',
      approved_price NUMERIC,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      responded_at   TIMESTAMPTZ
    )
  `
}

/** Create the rental_agreements table if absent. Idempotent. */
export async function createRentalAgreementsTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS rental_agreements (
      id                        TEXT PRIMARY KEY,
      vehicle_id                TEXT NOT NULL,
      vehicle_name               TEXT NOT NULL,
      vehicle_rego               TEXT NOT NULL,
      customer_name              TEXT NOT NULL,
      customer_email             TEXT NOT NULL,
      customer_phone             TEXT NOT NULL,
      listed_weekly_rate         NUMERIC NOT NULL,
      agreed_weekly_rate         NUMERIC NOT NULL,
      bond_weeks                 INTEGER NOT NULL DEFAULT 0,
      bond_amount                NUMERIC NOT NULL DEFAULT 0,
      payment_method              TEXT,
      stripe_customer_id          TEXT,
      stripe_subscription_id      TEXT,
      stripe_payment_method_id    TEXT,
      status                      TEXT NOT NULL DEFAULT 'active',
      start_date                  TIMESTAMPTZ NOT NULL DEFAULT now(),
      return_date                 TIMESTAMPTZ,
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

/** Create the lease_agreements table if absent. Idempotent. */
export async function createLeaseAgreementsTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS lease_agreements (
      id                    TEXT PRIMARY KEY,
      renter_name           TEXT NOT NULL,
      renter_address        TEXT,
      renter_dob            TEXT,
      licence_number        TEXT,
      licence_state         TEXT,
      renter_phone          TEXT,
      renter_email          TEXT NOT NULL,
      vehicle_id            TEXT,
      rego                  TEXT NOT NULL,
      make                  TEXT,
      model                 TEXT,
      year                  TEXT,
      vin                   TEXT,
      odometer_start        TEXT,
      weekly_rent           NUMERIC NOT NULL,
      security_deposit      NUMERIC DEFAULT 0,
      insurance_access_fee  NUMERIC DEFAULT 0,
      start_date            TEXT,
      start_time            TEXT,
      status                TEXT DEFAULT 'pending_signature',
      signature_data        TEXT,
      signed_at             TIMESTAMPTZ,
      signed_ip             TEXT,
      created_at            TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

/** Create the security_packages table if absent. Idempotent. */
export async function createPackagesTable(): Promise<void> {
  await sql()`
    CREATE TABLE IF NOT EXISTS security_packages (
      id                    TEXT PRIMARY KEY,
      name                  TEXT NOT NULL,
      brand                 TEXT NOT NULL,
      solution_slug         TEXT NOT NULL,
      description           TEXT,
      image                 TEXT,
      badge                 TEXT,
      items                 JSONB NOT NULL,
      calculated_subtotal   NUMERIC NOT NULL,
      package_price         NUMERIC NOT NULL,
      discount_percent      INTEGER NOT NULL DEFAULT 0,
      install_fee_per_unit  NUMERIC NOT NULL DEFAULT 150,
      total_units           INTEGER NOT NULL,
      in_stock              BOOLEAN NOT NULL DEFAULT true,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql()`
    CREATE INDEX IF NOT EXISTS security_packages_solution_slug_idx
    ON security_packages (solution_slug)
  `
}

/** Create the products + vehicles + settings tables if absent. Idempotent. */
export async function ensureSchema(): Promise<void> {
  const db = sql()
  await createSettingsTable()
  await createVehiclesTable()
  await createActiveRentalsTable()
  await createPackagesTable()
  await createNegotiationsTable()
  await createRentalAgreementsTable()
  await createLeaseAgreementsTable()
  await db`
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      description    TEXT,
      sku            TEXT,
      image_url      TEXT,
      category       TEXT,
      price          NUMERIC NOT NULL DEFAULT 0,
      discount_price NUMERIC,
      badge          TEXT,
      in_stock       BOOLEAN NOT NULL DEFAULT true,
      solution_slug  TEXT NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`
    CREATE INDEX IF NOT EXISTS products_solution_slug_idx
    ON products (solution_slug)
  `
  // Migration for tables created before the description column existed.
  await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`
}

/**
 * Marks recording that a seed has already been run, so /api/db/setup can be
 * visited again (to create a new table, say) without resurrecting rows the
 * admin deleted. ON CONFLICT DO NOTHING protects against duplicates but not
 * against deletions: a deleted seed row has no id to conflict with, so a second
 * seed run brings it straight back. These marks are the fix.
 */
async function seedAlreadyRun(key: string): Promise<boolean> {
  await createSettingsTable()
  return (await readSetting<{ at: string }>(`seed:${key}`)) !== null
}

async function markSeedRun(key: string): Promise<void> {
  await writeSetting(`seed:${key}`, { at: new Date().toISOString() })
}

/**
 * Seed every security solution's products from the static data file. Runs at
 * most once — see seedAlreadyRun. Within a run, existing rows (matched by id)
 * are left untouched so admin edits survive. Returns the number of rows
 * inserted, or -1 when the seed was skipped because it had already run.
 */
export async function seedAllProducts(force = false): Promise<number> {
  if (!force && (await seedAlreadyRun("products"))) return -1
  const db = sql()

  let inserted = 0
  for (const solution of securitySolutions) {
    // SKU prefix derived from the solution id (e.g. surveillance → "SUR"),
    // matching the original surveillance seed convention.
    const prefix = solution.id.slice(0, 3).toUpperCase()
    for (const p of solution.products) {
      // RETURNING id yields a row only when the INSERT actually happened (no
      // conflict), which lets us count inserts without full query metadata.
      const rows = (await db`
        INSERT INTO products
          (id, name, description, sku, image_url, category, price, discount_price, badge, in_stock, solution_slug)
        VALUES (
          ${p.id},
          ${p.name},
          ${p.description},
          ${`${prefix}-${p.id.toUpperCase()}`},
          ${p.image},
          ${SEED_CATEGORY[p.id] ?? null},
          ${p.price},
          ${null},
          ${p.badge ?? null},
          ${p.inStock},
          ${solution.slug}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `) as { id: string }[]
      inserted += rows.length
    }
  }
  await markSeedRun("products")
  return inserted
}

/** All products, optionally filtered to one solution slug. */
export async function getProducts(solutionSlug?: string): Promise<Product[]> {
  const db = sql()
  const rows = (solutionSlug
    ? await db`
        SELECT * FROM products
        WHERE solution_slug = ${solutionSlug}
        ORDER BY created_at ASC
      `
    : await db`SELECT * FROM products ORDER BY created_at ASC`) as ProductRow[]
  return rows.map(toProduct)
}

/** One product by id, or null. Used to price packages from live DB data. */
export async function getProduct(id: string): Promise<Product | null> {
  const rows = (await sql()`
    SELECT * FROM products WHERE id = ${id}
  `) as ProductRow[]
  return rows[0] ? toProduct(rows[0]) : null
}

function newId(): string {
  return `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = sql()
  const id = newId()
  const rows = (await db`
    INSERT INTO products
      (id, name, description, sku, image_url, category, price, discount_price, badge, in_stock, solution_slug)
    VALUES (
      ${id},
      ${input.name},
      ${input.description || null},
      ${input.sku || null},
      ${input.imageUrl || null},
      ${input.category || null},
      ${input.price},
      ${input.discountPrice},
      ${input.badge || null},
      ${input.inStock},
      ${input.solutionSlug}
    )
    RETURNING *
  `) as ProductRow[]
  return toProduct(rows[0])
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  const db = sql()
  const rows = (await db`
    UPDATE products SET
      name           = ${input.name},
      description    = ${input.description || null},
      sku            = ${input.sku || null},
      image_url      = ${input.imageUrl || null},
      category       = ${input.category || null},
      price          = ${input.price},
      discount_price = ${input.discountPrice},
      badge          = ${input.badge || null},
      in_stock       = ${input.inStock},
      solution_slug  = ${input.solutionSlug}
    WHERE id = ${id}
    RETURNING *
  `) as ProductRow[]
  return rows[0] ? toProduct(rows[0]) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = sql()
  const rows = (await db`DELETE FROM products WHERE id = ${id} RETURNING id`) as {
    id: string
  }[]
  return rows.length > 0
}

/* ───────────────────── Car rental fleet ───────────────────── */

interface VehicleRow {
  id: string
  name: string
  year: number
  make: string | null
  model: string | null
  type: string | null
  rego: string | null
  image: string | null
  // JSONB — the driver hands this back already parsed.
  images: unknown
  image_alt: string | null
  weekly_rate: string | number
  bond: string | number
  available: boolean
  sort_order: number
  variant: string | null
  fuel_type: string | null
  engine: string | null
  transmission: string | null
  seats: number | null
  // JSONB — parsed by the driver, like `images`.
  colours: unknown
  created_at: string | Date
}

function toVehicle(r: VehicleRow): RentalVehicle {
  return {
    id: r.id,
    name: r.name,
    year: Number(r.year),
    make: r.make ?? "",
    model: r.model ?? "",
    type: r.type ?? "",
    rego: r.rego ?? "",
    image: r.image ?? "",
    images: Array.isArray(r.images) ? r.images.map(String) : [],
    imageAlt: r.image_alt ?? "",
    // NUMERIC comes back as a string from the driver.
    weeklyRate: Number(r.weekly_rate),
    bond: Number(r.bond),
    available: r.available,
    sortOrder: Number(r.sort_order),
    variant: r.variant ?? "",
    fuelType: r.fuel_type ?? "",
    engine: r.engine ?? "",
    transmission: r.transmission ?? "",
    // A car added before the column existed reads back null — 5 seats is the
    // right answer for every car on this yard, and beats rendering "0 Seats".
    seats: r.seats == null ? 5 : Number(r.seats),
    colours: Array.isArray(r.colours) ? r.colours.map(String) : [],
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
  }
}

/**
 * The whole fleet, in display order. `sort_order` is admin-controlled so cars
 * can be re-ordered without touching created_at, which breaks the ties.
 */
export async function getVehicles(): Promise<RentalVehicle[]> {
  const rows = (await sql()`
    SELECT * FROM vehicles ORDER BY sort_order ASC, created_at ASC
  `) as VehicleRow[]
  return rows.map(toVehicle)
}

/** One vehicle by id, or null. */
export async function getVehicle(id: string): Promise<RentalVehicle | null> {
  const rows = (await sql()`
    SELECT * FROM vehicles WHERE id = ${id}
  `) as VehicleRow[]
  return rows[0] ? toVehicle(rows[0]) : null
}

function newVehicleId(): string {
  return `veh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function createVehicle(input: VehicleInput): Promise<RentalVehicle> {
  const db = sql()
  const id = newVehicleId()
  // The driver serialises arrays to a Postgres array literal, which JSONB will
  // not accept — send JSON text and cast it, the same way writeSetting does.
  const images = JSON.stringify(input.images)
  const colours = JSON.stringify(input.colours)
  const rows = (await db`
    INSERT INTO vehicles
      (id, name, year, make, model, type, rego, image, images, image_alt,
       weekly_rate, bond, available, sort_order,
       variant, fuel_type, engine, transmission, seats, colours)
    VALUES (
      ${id},
      ${input.name},
      ${input.year},
      ${input.make || null},
      ${input.model || null},
      ${input.type || null},
      ${input.rego || null},
      ${input.image || null},
      ${images}::jsonb,
      ${input.imageAlt || null},
      ${input.weeklyRate},
      ${input.bond},
      ${input.available},
      ${input.sortOrder},
      ${input.variant || null},
      ${input.fuelType || null},
      ${input.engine || null},
      ${input.transmission || null},
      ${input.seats},
      ${colours}::jsonb
    )
    RETURNING *
  `) as VehicleRow[]
  return toVehicle(rows[0])
}

export async function updateVehicle(
  id: string,
  input: VehicleInput,
): Promise<RentalVehicle | null> {
  const db = sql()
  const images = JSON.stringify(input.images)
  const colours = JSON.stringify(input.colours)
  const rows = (await db`
    UPDATE vehicles SET
      name        = ${input.name},
      year        = ${input.year},
      make        = ${input.make || null},
      model       = ${input.model || null},
      type        = ${input.type || null},
      rego        = ${input.rego || null},
      image       = ${input.image || null},
      images      = ${images}::jsonb,
      image_alt   = ${input.imageAlt || null},
      weekly_rate = ${input.weeklyRate},
      bond        = ${input.bond},
      available   = ${input.available},
      sort_order  = ${input.sortOrder},
      variant      = ${input.variant || null},
      fuel_type    = ${input.fuelType || null},
      engine       = ${input.engine || null},
      transmission = ${input.transmission || null},
      seats        = ${input.seats},
      colours      = ${colours}::jsonb
    WHERE id = ${id}
    RETURNING *
  `) as VehicleRow[]
  return rows[0] ? toVehicle(rows[0]) : null
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const rows = (await sql()`
    DELETE FROM vehicles WHERE id = ${id} RETURNING id
  `) as { id: string }[]
  return rows.length > 0
}

/**
 * Seed the fleet from the static list in src/data/car-rental.ts. Runs at most
 * once (see seedAlreadyRun) so a later /api/db/setup never brings back a car
 * the admin sold and deleted. Within a run, existing rows are left untouched,
 * so the weekly rates and photos set in the dashboard survive. Returns rows
 * inserted, or -1 when the seed was skipped because it had already run.
 */
export async function seedAllVehicles(force = false): Promise<number> {
  if (!force && (await seedAlreadyRun("vehicles"))) return -1
  const db = sql()
  let inserted = 0
  for (const v of VEHICLE_SEED) {
    const images = JSON.stringify(v.images)
    const colours = JSON.stringify(v.colours)
    const rows = (await db`
      INSERT INTO vehicles
        (id, name, year, make, model, type, rego, image, images, image_alt,
         weekly_rate, bond, available, sort_order,
         variant, fuel_type, engine, transmission, seats, colours)
      VALUES (
        ${v.id}, ${v.name}, ${v.year}, ${v.make}, ${v.model}, ${v.type},
        ${v.rego}, ${v.image}, ${images}::jsonb, ${v.imageAlt},
        ${v.weeklyRate}, ${v.bond}, ${v.available}, ${v.sortOrder},
        ${v.variant}, ${v.fuelType}, ${v.engine}, ${v.transmission},
        ${v.seats}, ${colours}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `) as { id: string }[]
    inserted += rows.length
  }
  await markSeedRun("vehicles")
  return inserted
}

/**
 * Fill in the specifications (variant, fuel, engine, transmission, seats,
 * colours) for the original 16 cars.
 *
 * The fleet seed has already run on the live database, so those rows exist with
 * the spec columns empty and seedAllVehicles will never touch them again. This
 * fills the blanks in — and only the blanks: a row whose variant the admin has
 * already set is left alone, and the whole pass is marked done so it cannot
 * come back and undo a spec they deliberately cleared. Returns rows filled, or
 * -1 when it had already run.
 */
export async function backfillVehicleSpecs(force = false): Promise<number> {
  if (!force && (await seedAlreadyRun("vehicle-specs"))) return -1
  const db = sql()
  let filled = 0
  for (const v of VEHICLE_SEED) {
    const colours = JSON.stringify(v.colours)
    const rows = (await db`
      UPDATE vehicles SET
        variant      = ${v.variant},
        fuel_type    = ${v.fuelType},
        engine       = ${v.engine},
        transmission = ${v.transmission},
        seats        = ${v.seats},
        colours      = ${colours}::jsonb
      WHERE id = ${v.id}
        AND (variant IS NULL OR variant = '')
      RETURNING id
    `) as { id: string }[]
    filled += rows.length
  }
  await markSeedRun("vehicle-specs")
  return filled
}

/* ───────────────────── Active rentals (weekly rent reminders) ───────────────────── */

export interface ActiveRentalInput {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleRego: string
  customerName: string
  customerEmail: string
  customerPhone: string
  weeklyRent: number
}

export interface ActiveRental {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleRego: string
  customerName: string
  customerEmail: string
  customerPhone: string
  weeklyRent: number
  nextDueDate: string
  reminderSentAt: string | null
}

interface ActiveRentalRow {
  id: string
  vehicle_id: string
  vehicle_name: string
  vehicle_rego: string
  customer_name: string
  customer_email: string
  customer_phone: string
  weekly_rent: string | number
  next_due_date: string | Date
  reminder_sent_at: string | Date | null
}

function toActiveRental(r: ActiveRentalRow): ActiveRental {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name,
    vehicleRego: r.vehicle_rego,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    weeklyRent: Number(r.weekly_rent),
    nextDueDate: new Date(r.next_due_date).toISOString(),
    reminderSentAt: r.reminder_sent_at ? new Date(r.reminder_sent_at).toISOString() : null,
  }
}

/**
 * Records a successful rent payment so the reminder cron knows when the next
 * week's rent falls due. `id` is the Stripe PaymentIntent id — ON CONFLICT DO
 * NOTHING makes the webhook's at-least-once delivery safe to insert twice.
 */
export async function insertActiveRental(input: ActiveRentalInput): Promise<void> {
  await createActiveRentalsTable()
  await sql()`
    INSERT INTO active_rentals (
      id, vehicle_id, vehicle_name, vehicle_rego,
      customer_name, customer_email, customer_phone,
      weekly_rent, last_payment_date, next_due_date, status
    ) VALUES (
      ${input.id}, ${input.vehicleId}, ${input.vehicleName}, ${input.vehicleRego},
      ${input.customerName}, ${input.customerEmail}, ${input.customerPhone},
      ${input.weeklyRent}, now(), now() + INTERVAL '7 days', 'active'
    )
    ON CONFLICT (id) DO NOTHING
  `
}

/**
 * Active rentals whose rent falls due within the next 24 hours and have not
 * had a reminder sent in the last 6 days — so the same rental is not
 * re-emailed every time the daily cron runs.
 */
export async function getRentalsDueForReminder(): Promise<ActiveRental[]> {
  const rows = (await sql()`
    SELECT * FROM active_rentals
    WHERE status = 'active'
      AND next_due_date <= now() + INTERVAL '1 day'
      AND (reminder_sent_at IS NULL OR reminder_sent_at < now() - INTERVAL '6 days')
  `) as ActiveRentalRow[]
  return rows.map(toActiveRental)
}

/** Marks a reminder as sent so it is not re-sent on the next cron run. */
export async function markReminderSent(id: string): Promise<void> {
  await sql()`
    UPDATE active_rentals SET reminder_sent_at = now() WHERE id = ${id}
  `
}

/* ───────────────────── Security packages (bundle deals) ───────────────────── */

export interface PackageItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface SecurityPackageInput {
  id?: string
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

export interface SecurityPackage extends SecurityPackageInput {
  id: string
  createdAt?: string
  updatedAt?: string
}

interface SecurityPackageRow {
  id: string
  name: string
  brand: string
  solution_slug: string
  description: string | null
  image: string | null
  badge: string | null
  items: unknown
  calculated_subtotal: string | number
  package_price: string | number
  discount_percent: number
  install_fee_per_unit: string | number
  total_units: number
  in_stock: boolean
  created_at: string | Date
  updated_at: string | Date
}

function toSecurityPackage(r: SecurityPackageRow): SecurityPackage {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    solutionSlug: r.solution_slug,
    description: r.description ?? "",
    image: r.image ?? "",
    badge: r.badge ?? "",
    items: (Array.isArray(r.items) ? r.items : []) as PackageItem[],
    calculatedSubtotal: Number(r.calculated_subtotal),
    packagePrice: Number(r.package_price),
    discountPercent: Number(r.discount_percent),
    installFeePerUnit: Number(r.install_fee_per_unit),
    totalUnits: Number(r.total_units),
    inStock: r.in_stock,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  }
}

/** All packages, optionally filtered to one solution slug. In-stock only when
 *  filtering by slug (the public solution page never shows a sold-out bundle);
 *  the dashboard list (no slug) shows everything so the owner can re-enable one. */
export async function getPackages(slug?: string): Promise<SecurityPackage[]> {
  const db = sql()
  const rows = (slug
    ? await db`
        SELECT * FROM security_packages
        WHERE solution_slug = ${slug} AND in_stock = true
        ORDER BY created_at DESC
      `
    : await db`SELECT * FROM security_packages ORDER BY created_at DESC`) as SecurityPackageRow[]
  return rows.map(toSecurityPackage)
}

/** One package by id, or null. Used by the quote wizard's ?package=xxx flow. */
export async function getPackage(id: string): Promise<SecurityPackage | null> {
  const rows = (await sql()`
    SELECT * FROM security_packages WHERE id = ${id}
  `) as SecurityPackageRow[]
  return rows[0] ? toSecurityPackage(rows[0]) : null
}

function newPackageId(): string {
  return `pkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Create or update a package (upsert on id, matching createVehicle/updateVehicle's
 *  separate-id convention isn't used here since the dashboard form doesn't know the
 *  id ahead of time for a new package — ON CONFLICT keeps create and edit as one call). */
export async function upsertPackage(input: SecurityPackageInput): Promise<SecurityPackage> {
  const db = sql()
  const id = input.id || newPackageId()
  const items = JSON.stringify(input.items)
  const rows = (await db`
    INSERT INTO security_packages (
      id, name, brand, solution_slug, description, image, badge, items,
      calculated_subtotal, package_price, discount_percent,
      install_fee_per_unit, total_units, in_stock, updated_at
    ) VALUES (
      ${id}, ${input.name}, ${input.brand}, ${input.solutionSlug},
      ${input.description || null}, ${input.image || null}, ${input.badge || null},
      ${items}::jsonb,
      ${input.calculatedSubtotal}, ${input.packagePrice}, ${input.discountPercent},
      ${input.installFeePerUnit}, ${input.totalUnits}, ${input.inStock}, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      name                 = ${input.name},
      brand                = ${input.brand},
      solution_slug        = ${input.solutionSlug},
      description          = ${input.description || null},
      image                = ${input.image || null},
      badge                = ${input.badge || null},
      items                = ${items}::jsonb,
      calculated_subtotal  = ${input.calculatedSubtotal},
      package_price        = ${input.packagePrice},
      discount_percent     = ${input.discountPercent},
      install_fee_per_unit = ${input.installFeePerUnit},
      total_units          = ${input.totalUnits},
      in_stock             = ${input.inStock},
      updated_at           = now()
    RETURNING *
  `) as SecurityPackageRow[]
  return toSecurityPackage(rows[0])
}

export async function deletePackage(id: string): Promise<boolean> {
  const rows = (await sql()`
    DELETE FROM security_packages WHERE id = ${id} RETURNING id
  `) as { id: string }[]
  return rows.length > 0
}

/* ───────────────────── Price negotiations ───────────────────── */

export interface PriceNegotiationInput {
  id: string
  vehicleId: string
  vehicleName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedPrice: number
  offeredPrice: number
}

export interface PriceNegotiation {
  id: string
  vehicleId: string
  vehicleName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedPrice: number
  offeredPrice: number
  status: string
  approvedPrice: number | null
  createdAt: string
  respondedAt: string | null
}

interface PriceNegotiationRow {
  id: string
  vehicle_id: string
  vehicle_name: string
  customer_name: string
  customer_email: string
  customer_phone: string
  listed_price: string | number
  offered_price: string | number
  status: string
  approved_price: string | number | null
  created_at: string | Date
  responded_at: string | Date | null
}

function toNegotiation(r: PriceNegotiationRow): PriceNegotiation {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    listedPrice: Number(r.listed_price),
    offeredPrice: Number(r.offered_price),
    status: r.status,
    approvedPrice: r.approved_price == null ? null : Number(r.approved_price),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : "",
    respondedAt: r.responded_at ? new Date(r.responded_at).toISOString() : null,
  }
}

export async function insertNegotiation(input: PriceNegotiationInput): Promise<void> {
  await createNegotiationsTable()
  await sql()`
    INSERT INTO price_negotiations (
      id, vehicle_id, vehicle_name, customer_name, customer_email,
      customer_phone, listed_price, offered_price, status
    ) VALUES (
      ${input.id}, ${input.vehicleId}, ${input.vehicleName}, ${input.customerName},
      ${input.customerEmail}, ${input.customerPhone}, ${input.listedPrice},
      ${input.offeredPrice}, 'pending'
    )
  `
}

/** All negotiations (newest first), or one by id. */
export async function getNegotiations(id?: string): Promise<PriceNegotiation[]> {
  await createNegotiationsTable()
  const rows = (id
    ? await sql()`SELECT * FROM price_negotiations WHERE id = ${id}`
    : await sql()`SELECT * FROM price_negotiations ORDER BY created_at DESC`) as PriceNegotiationRow[]
  return rows.map(toNegotiation)
}

export async function updateNegotiationStatus(
  id: string,
  status: "approved" | "declined",
  approvedPrice: number | null,
): Promise<PriceNegotiation | null> {
  await createNegotiationsTable()
  const rows = (await sql()`
    UPDATE price_negotiations
    SET status = ${status}, approved_price = ${approvedPrice}, responded_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as PriceNegotiationRow[]
  return rows[0] ? toNegotiation(rows[0]) : null
}

/* ───────────────────── Rental agreements (subscriptions) ───────────────────── */

export interface RentalAgreementInput {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleRego: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedWeeklyRate: number
  agreedWeeklyRate: number
  bondWeeks: number
  bondAmount: number
  paymentMethod: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePaymentMethodId: string
}

export interface RentalAgreement {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleRego: string
  customerName: string
  customerEmail: string
  customerPhone: string
  listedWeeklyRate: number
  agreedWeeklyRate: number
  bondWeeks: number
  bondAmount: number
  paymentMethod: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePaymentMethodId: string | null
  status: string
  startDate: string
  returnDate: string | null
}

interface RentalAgreementRow {
  id: string
  vehicle_id: string
  vehicle_name: string
  vehicle_rego: string
  customer_name: string
  customer_email: string
  customer_phone: string
  listed_weekly_rate: string | number
  agreed_weekly_rate: string | number
  bond_weeks: number
  bond_amount: string | number
  payment_method: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_payment_method_id: string | null
  status: string
  start_date: string | Date
  return_date: string | Date | null
}

function toRentalAgreement(r: RentalAgreementRow): RentalAgreement {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name,
    vehicleRego: r.vehicle_rego,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    listedWeeklyRate: Number(r.listed_weekly_rate),
    agreedWeeklyRate: Number(r.agreed_weekly_rate),
    bondWeeks: Number(r.bond_weeks),
    bondAmount: Number(r.bond_amount),
    paymentMethod: r.payment_method ?? "",
    stripeCustomerId: r.stripe_customer_id,
    stripeSubscriptionId: r.stripe_subscription_id,
    stripePaymentMethodId: r.stripe_payment_method_id,
    status: r.status,
    startDate: r.start_date ? new Date(r.start_date).toISOString() : "",
    returnDate: r.return_date ? new Date(r.return_date).toISOString() : null,
  }
}

export async function insertRentalAgreement(input: RentalAgreementInput): Promise<void> {
  await createRentalAgreementsTable()
  await sql()`
    INSERT INTO rental_agreements (
      id, vehicle_id, vehicle_name, vehicle_rego, customer_name,
      customer_email, customer_phone, listed_weekly_rate, agreed_weekly_rate,
      bond_weeks, bond_amount, payment_method, stripe_customer_id,
      stripe_subscription_id, stripe_payment_method_id, status
    ) VALUES (
      ${input.id}, ${input.vehicleId}, ${input.vehicleName}, ${input.vehicleRego},
      ${input.customerName}, ${input.customerEmail}, ${input.customerPhone},
      ${input.listedWeeklyRate}, ${input.agreedWeeklyRate}, ${input.bondWeeks},
      ${input.bondAmount}, ${input.paymentMethod}, ${input.stripeCustomerId},
      ${input.stripeSubscriptionId}, ${input.stripePaymentMethodId}, 'active'
    )
  `
}

/** Agreements, optionally filtered by status (e.g. "active"). Newest first. */
export async function getRentalAgreements(status?: string): Promise<RentalAgreement[]> {
  await createRentalAgreementsTable()
  const rows = (status
    ? await sql()`
        SELECT * FROM rental_agreements WHERE status = ${status} ORDER BY start_date DESC
      `
    : await sql()`SELECT * FROM rental_agreements ORDER BY start_date DESC`) as RentalAgreementRow[]
  return rows.map(toRentalAgreement)
}

export async function getRentalAgreement(id: string): Promise<RentalAgreement | null> {
  await createRentalAgreementsTable()
  const rows = (await sql()`
    SELECT * FROM rental_agreements WHERE id = ${id}
  `) as RentalAgreementRow[]
  return rows[0] ? toRentalAgreement(rows[0]) : null
}

export async function markRentalAgreementReturned(
  id: string,
  returnDate: string,
): Promise<RentalAgreement | null> {
  await createRentalAgreementsTable()
  const rows = (await sql()`
    UPDATE rental_agreements
    SET status = 'returned', return_date = ${returnDate}
    WHERE id = ${id}
    RETURNING *
  `) as RentalAgreementRow[]
  return rows[0] ? toRentalAgreement(rows[0]) : null
}

/* ───────────────────── Lease agreements (signed PDF workflow) ───────────────────── */

export interface LeaseAgreementInput {
  renterName: string
  renterAddress: string
  renterDob: string
  licenceNumber: string
  licenceState: string
  renterPhone: string
  renterEmail: string
  vehicleId: string
  rego: string
  make: string
  model: string
  year: string
  vin: string
  odometerStart: string
  weeklyRent: number
  securityDeposit: number
  insuranceAccessFee: number
  startDate: string
  startTime: string
}

export interface LeaseAgreement {
  id: string
  renterName: string
  renterAddress: string
  renterDob: string
  licenceNumber: string
  licenceState: string
  renterPhone: string
  renterEmail: string
  vehicleId: string
  rego: string
  make: string
  model: string
  year: string
  vin: string
  odometerStart: string
  weeklyRent: number
  securityDeposit: number
  insuranceAccessFee: number
  startDate: string
  startTime: string
  status: string
  signatureData: string | null
  signedAt: string | null
  signedIp: string | null
  createdAt: string
}

interface LeaseAgreementRow {
  id: string
  renter_name: string
  renter_address: string | null
  renter_dob: string | null
  licence_number: string | null
  licence_state: string | null
  renter_phone: string | null
  renter_email: string
  vehicle_id: string | null
  rego: string
  make: string | null
  model: string | null
  year: string | null
  vin: string | null
  odometer_start: string | null
  weekly_rent: string | number
  security_deposit: string | number | null
  insurance_access_fee: string | number | null
  start_date: string | null
  start_time: string | null
  status: string
  signature_data: string | null
  signed_at: string | Date | null
  signed_ip: string | null
  created_at: string | Date
}

function toLeaseAgreement(r: LeaseAgreementRow): LeaseAgreement {
  return {
    id: r.id,
    renterName: r.renter_name,
    renterAddress: r.renter_address ?? "",
    renterDob: r.renter_dob ?? "",
    licenceNumber: r.licence_number ?? "",
    licenceState: r.licence_state ?? "",
    renterPhone: r.renter_phone ?? "",
    renterEmail: r.renter_email,
    vehicleId: r.vehicle_id ?? "",
    rego: r.rego,
    make: r.make ?? "",
    model: r.model ?? "",
    year: r.year ?? "",
    vin: r.vin ?? "",
    odometerStart: r.odometer_start ?? "",
    weeklyRent: Number(r.weekly_rent),
    securityDeposit: Number(r.security_deposit ?? 0),
    insuranceAccessFee: Number(r.insurance_access_fee ?? 0),
    startDate: r.start_date ?? "",
    startTime: r.start_time ?? "",
    status: r.status,
    signatureData: r.signature_data,
    signedAt: r.signed_at ? new Date(r.signed_at).toISOString() : null,
    signedIp: r.signed_ip,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : "",
  }
}

function newLeaseAgreementId(): string {
  return `agr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function createLeaseAgreement(
  input: LeaseAgreementInput,
): Promise<LeaseAgreement> {
  await createLeaseAgreementsTable()
  const id = newLeaseAgreementId()
  const rows = (await sql()`
    INSERT INTO lease_agreements (
      id, renter_name, renter_address, renter_dob, licence_number,
      licence_state, renter_phone, renter_email, vehicle_id, rego,
      make, model, year, vin, odometer_start, weekly_rent,
      security_deposit, insurance_access_fee, start_date, start_time, status
    ) VALUES (
      ${id}, ${input.renterName}, ${input.renterAddress || null},
      ${input.renterDob || null}, ${input.licenceNumber || null},
      ${input.licenceState || null}, ${input.renterPhone || null},
      ${input.renterEmail}, ${input.vehicleId || null}, ${input.rego},
      ${input.make || null}, ${input.model || null}, ${input.year || null},
      ${input.vin || null}, ${input.odometerStart || null}, ${input.weeklyRent},
      ${input.securityDeposit || 0}, ${input.insuranceAccessFee || 0},
      ${input.startDate || null}, ${input.startTime || null}, 'pending_signature'
    )
    RETURNING *
  `) as LeaseAgreementRow[]
  return toLeaseAgreement(rows[0])
}

/** All lease agreements, newest first. */
export async function getLeaseAgreements(): Promise<LeaseAgreement[]> {
  await createLeaseAgreementsTable()
  const rows = (await sql()`
    SELECT * FROM lease_agreements ORDER BY created_at DESC
  `) as LeaseAgreementRow[]
  return rows.map(toLeaseAgreement)
}

export async function getLeaseAgreement(id: string): Promise<LeaseAgreement | null> {
  await createLeaseAgreementsTable()
  const rows = (await sql()`
    SELECT * FROM lease_agreements WHERE id = ${id}
  `) as LeaseAgreementRow[]
  return rows[0] ? toLeaseAgreement(rows[0]) : null
}

export async function signLeaseAgreement(
  id: string,
  signatureDataUrl: string,
  signedIp: string | null,
): Promise<LeaseAgreement | null> {
  await createLeaseAgreementsTable()
  const rows = (await sql()`
    UPDATE lease_agreements
    SET status = 'signed', signature_data = ${signatureDataUrl},
        signed_at = now(), signed_ip = ${signedIp}
    WHERE id = ${id}
    RETURNING *
  `) as LeaseAgreementRow[]
  return rows[0] ? toLeaseAgreement(rows[0]) : null
}
