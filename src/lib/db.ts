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
  await ensureRentalProtectionSchema()
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
  // Chargeback-protection evidence. Null on rentals created before it existed
  // and on the bank-transfer / lease flows, which never touch Stripe.
  customerAddress: string | null
  licenceNumber: string | null
  licenceState: string | null
  setupIntentId: string | null
  threeDsResult: string | null
  threeDsVersion: string | null
  threeDsFlow: string | null
  termsVersion: string | null
  termsText: string | null
  termsAcceptedAt: string | null
  termsIp: string | null
  termsUserAgent: string | null
  termsTypedName: string | null
  cardholderName: string | null
  nameCheck: string | null
  cardBrand: string | null
  cardLast4: string | null
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
  // Absent entirely until ensureRentalProtectionSchema() has run.
  customer_address?: string | null
  licence_number?: string | null
  licence_state?: string | null
  setup_intent_id?: string | null
  three_ds_result?: string | null
  three_ds_version?: string | null
  three_ds_flow?: string | null
  terms_version?: string | null
  terms_text?: string | null
  terms_accepted_at?: string | Date | null
  terms_ip?: string | null
  terms_user_agent?: string | null
  terms_typed_name?: string | null
  cardholder_name?: string | null
  name_check?: string | null
  card_brand?: string | null
  card_last4?: string | null
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
    customerAddress: r.customer_address ?? null,
    licenceNumber: r.licence_number ?? null,
    licenceState: r.licence_state ?? null,
    setupIntentId: r.setup_intent_id ?? null,
    threeDsResult: r.three_ds_result ?? null,
    threeDsVersion: r.three_ds_version ?? null,
    threeDsFlow: r.three_ds_flow ?? null,
    termsVersion: r.terms_version ?? null,
    termsText: r.terms_text ?? null,
    termsAcceptedAt: r.terms_accepted_at ? new Date(r.terms_accepted_at).toISOString() : null,
    termsIp: r.terms_ip ?? null,
    termsUserAgent: r.terms_user_agent ?? null,
    termsTypedName: r.terms_typed_name ?? null,
    cardholderName: r.cardholder_name ?? null,
    nameCheck: r.name_check ?? null,
    cardBrand: r.card_brand ?? null,
    cardLast4: r.card_last4 ?? null,
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
    ON CONFLICT (id) DO NOTHING
  `
}

/**
 * Vehicle ids currently out on rent — any active rental agreement (card/BECS
 * subscription, bank transfer or signed lease). Unpaid pending applications
 * don't count; "Return" in /rental-admin frees the car.
 */
export async function getRentedVehicleIds(): Promise<Set<string>> {
  await createRentalAgreementsTable()
  const rows = (await sql()`
    SELECT DISTINCT vehicle_id FROM rental_agreements WHERE status = 'active'
  `) as { vehicle_id: string }[]
  return new Set(rows.map((r) => r.vehicle_id))
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
  // This id is the whole secret in the emailed /sign-agreement link, and the
  // agreement holds licence, DOB and address — so it must be unguessable.
  return `agr-${crypto.randomUUID()}`
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

/* ───────────────────── Chargeback protection ───────────────────── */
//
// Evidence gathered across the card / BECS rental flow so a chargeback can be
// fought: the pending application (with licence images), the customer's
// acceptance of the weekly charge, the 3D Secure outcome, handover and return
// checklists, emails sent, and the disputes themselves.

let protectionSchema: Promise<void> | null = null

/**
 * New tables plus the extra rental_agreements columns. Memoised per server
 * instance — the ALTERs are idempotent but each one is an HTTP round trip, so
 * they should not run on every query. Also run by /api/db/setup.
 */
export function ensureRentalProtectionSchema(): Promise<void> {
  protectionSchema ??= migrateRentalProtection().catch((e) => {
    protectionSchema = null // let the next request retry
    throw e
  })
  return protectionSchema
}

async function migrateRentalProtection(): Promise<void> {
  const db = sql()
  await createRentalAgreementsTable()
  for (const col of [
    "customer_address TEXT",
    "licence_number TEXT",
    "licence_state TEXT",
    "setup_intent_id TEXT",
    "three_ds_result TEXT",
    "three_ds_version TEXT",
    "three_ds_flow TEXT",
    "terms_version TEXT",
    "terms_text TEXT",
    "terms_accepted_at TIMESTAMPTZ",
    "terms_ip TEXT",
    "terms_user_agent TEXT",
    "terms_typed_name TEXT",
    "cardholder_name TEXT",
    "name_check TEXT",
    "card_brand TEXT",
    "card_last4 TEXT",
    "reminder_period_end BIGINT",
    "created_at TIMESTAMPTZ NOT NULL DEFAULT now()",
  ]) {
    // Column definitions are the fixed literals above, never user input.
    await db.query(`ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS ${col}`)
  }
  await db`
    CREATE INDEX IF NOT EXISTS rental_agreements_customer_idx
    ON rental_agreements (stripe_customer_id)
  `
  await db`
    CREATE TABLE IF NOT EXISTS trusted_renters (
      email      TEXT PRIMARY KEY,
      note       TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  // Licence images, checklist photos, signatures and built evidence packs.
  // Stored in Postgres (base64) rather than public blob storage: these are
  // identity documents, and are only ever served through an admin-only route.
  await db`
    CREATE TABLE IF NOT EXISTS rental_files (
      id           TEXT PRIMARY KEY,
      rental_id    TEXT NOT NULL,
      kind         TEXT NOT NULL,
      filename     TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes   INTEGER NOT NULL,
      data         TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`CREATE INDEX IF NOT EXISTS rental_files_rental_idx ON rental_files (rental_id)`
  await db`
    CREATE TABLE IF NOT EXISTS rental_evidence (
      id                TEXT PRIMARY KEY,
      rental_id         TEXT NOT NULL,
      kind              TEXT NOT NULL,
      recorded_at       TIMESTAMPTZ NOT NULL,
      odometer          INTEGER,
      fuel              TEXT,
      photo_ids         JSONB NOT NULL DEFAULT '[]'::jsonb,
      signature_file_id TEXT,
      signed_name       TEXT,
      amount_owed       NUMERIC,
      notes             TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (rental_id, kind)
    )
  `
  await db`
    CREATE TABLE IF NOT EXISTS disputes (
      id                    TEXT PRIMARY KEY,
      rental_id             TEXT,
      charge_id             TEXT,
      customer_name         TEXT,
      amount                NUMERIC NOT NULL,
      currency              TEXT NOT NULL DEFAULT 'aud',
      reason                TEXT,
      status                TEXT NOT NULL,
      due_by                TIMESTAMPTZ,
      evidence_status       TEXT NOT NULL DEFAULT 'none',
      evidence_pack_file_id TEXT,
      evidence_summary      JSONB,
      evidence_built_at     TIMESTAMPTZ,
      evidence_submitted_at TIMESTAMPTZ,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`
    CREATE TABLE IF NOT EXISTS rental_email_log (
      id         TEXT PRIMARY KEY,
      rental_id  TEXT NOT NULL,
      kind       TEXT NOT NULL,
      recipient  TEXT NOT NULL,
      subject    TEXT NOT NULL,
      sent_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await db`CREATE INDEX IF NOT EXISTS rental_email_log_rental_idx ON rental_email_log (rental_id)`
}

function shortId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

/* ── Pending application → active rental ── */

export interface PendingRentalInput extends RentalAgreementInput {
  customerAddress: string
  licenceNumber: string
  licenceState: string
  setupIntentId: string
}

/**
 * The card / BECS application before any money moves. `id` doubles as the
 * customer's only credential for uploading their licence and accepting the
 * terms, so it must come from newRentalId() (unguessable).
 */
export async function createPendingRental(input: PendingRentalInput): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`
    INSERT INTO rental_agreements (
      id, vehicle_id, vehicle_name, vehicle_rego, customer_name,
      customer_email, customer_phone, listed_weekly_rate, agreed_weekly_rate,
      bond_weeks, bond_amount, payment_method, stripe_customer_id,
      stripe_subscription_id, stripe_payment_method_id, status,
      customer_address, licence_number, licence_state, setup_intent_id
    ) VALUES (
      ${input.id}, ${input.vehicleId}, ${input.vehicleName}, ${input.vehicleRego},
      ${input.customerName}, ${input.customerEmail}, ${input.customerPhone},
      ${input.listedWeeklyRate}, ${input.agreedWeeklyRate}, ${input.bondWeeks},
      ${input.bondAmount}, ${input.paymentMethod}, ${input.stripeCustomerId},
      '', '', 'pending_payment',
      ${input.customerAddress}, ${input.licenceNumber}, ${input.licenceState},
      ${input.setupIntentId}
    )
  `
}

export function newRentalId(): string {
  return shortId("rent")
}

export async function recordTermsAcceptance(
  id: string,
  t: { version: string; text: string; ip: string | null; userAgent: string; typedName: string },
): Promise<boolean> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    UPDATE rental_agreements
    SET terms_version = ${t.version}, terms_text = ${t.text},
        terms_accepted_at = now(), terms_ip = ${t.ip},
        terms_user_agent = ${t.userAgent}, terms_typed_name = ${t.typedName}
    WHERE id = ${id} AND status = 'pending_payment'
    RETURNING id
  `) as { id: string }[]
  return rows.length > 0
}

export interface RentalActivation {
  paymentMethod: string
  stripeSubscriptionId: string
  stripePaymentMethodId: string
  threeDsResult: string | null
  threeDsVersion: string | null
  threeDsFlow: string | null
  cardholderName: string | null
  nameCheck: string
  cardBrand: string | null
  cardLast4: string | null
}

export async function activatePendingRental(id: string, a: RentalActivation): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`
    UPDATE rental_agreements
    SET status = 'active', start_date = now(),
        payment_method = ${a.paymentMethod},
        stripe_subscription_id = ${a.stripeSubscriptionId},
        stripe_payment_method_id = ${a.stripePaymentMethodId},
        three_ds_result = ${a.threeDsResult}, three_ds_version = ${a.threeDsVersion},
        three_ds_flow = ${a.threeDsFlow}, cardholder_name = ${a.cardholderName},
        name_check = ${a.nameCheck}, card_brand = ${a.cardBrand}, card_last4 = ${a.cardLast4}
    WHERE id = ${id}
  `
}

/**
 * Applications abandoned before payment still hold licence images. Drop them
 * after a week rather than keeping identity documents for people who never
 * rented.
 */
export async function purgeAbandonedApplications(): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`
    DELETE FROM rental_files WHERE rental_id IN (
      SELECT id FROM rental_agreements
      WHERE status = 'pending_payment' AND created_at < now() - INTERVAL '7 days'
    )
  `
  await sql()`
    DELETE FROM rental_agreements
    WHERE status = 'pending_payment' AND created_at < now() - INTERVAL '7 days'
  `
}

export async function getRentalByStripeCustomer(
  customerId: string,
): Promise<RentalAgreement | null> {
  await ensureRentalProtectionSchema()
  // Pending rows are included on purpose: the first weekly charge succeeds
  // (and its webhook fires) moments before start-subscription activates the
  // rental. Each application gets its own Stripe customer, so this is unique.
  const rows = (await sql()`
    SELECT * FROM rental_agreements
    WHERE stripe_customer_id = ${customerId}
    ORDER BY start_date DESC LIMIT 1
  `) as RentalAgreementRow[]
  return rows[0] ? toRentalAgreement(rows[0]) : null
}

/** Active Stripe-billed rentals with the billing period their last reminder covered. */
export async function getStripeRentalsForReminder(): Promise<
  (RentalAgreement & { reminderPeriodEnd: number | null })[]
> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT * FROM rental_agreements
    WHERE status = 'active' AND stripe_subscription_id <> ''
  `) as (RentalAgreementRow & { reminder_period_end: string | number | null })[]
  return rows.map((r) => ({
    ...toRentalAgreement(r),
    reminderPeriodEnd: r.reminder_period_end == null ? null : Number(r.reminder_period_end),
  }))
}

export async function markRentalReminderPeriod(id: string, periodEnd: number): Promise<void> {
  await sql()`
    UPDATE rental_agreements SET reminder_period_end = ${periodEnd} WHERE id = ${id}
  `
}

/* ── Trusted renters (the only people offered BECS direct debit) ── */

export interface TrustedRenter {
  email: string
  note: string
  createdAt: string
}

export async function getTrustedRenters(): Promise<TrustedRenter[]> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT * FROM trusted_renters ORDER BY created_at DESC
  `) as { email: string; note: string | null; created_at: string | Date }[]
  return rows.map((r) => ({
    email: r.email,
    note: r.note ?? "",
    createdAt: new Date(r.created_at).toISOString(),
  }))
}

export async function isTrustedRenter(email: string): Promise<boolean> {
  if (!email) return false
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT 1 FROM trusted_renters WHERE email = ${email.trim().toLowerCase()}
  `) as unknown[]
  return rows.length > 0
}

export async function addTrustedRenter(email: string, note: string): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`
    INSERT INTO trusted_renters (email, note) VALUES (${email.trim().toLowerCase()}, ${note})
    ON CONFLICT (email) DO UPDATE SET note = ${note}
  `
}

export async function removeTrustedRenter(email: string): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`DELETE FROM trusted_renters WHERE email = ${email.trim().toLowerCase()}`
}

/* ── Files ── */

export interface RentalFileMeta {
  id: string
  rentalId: string
  kind: string
  filename: string
  contentType: string
  sizeBytes: number
  createdAt: string
}

export interface RentalFile extends RentalFileMeta {
  data: Buffer
}

interface RentalFileRow {
  id: string
  rental_id: string
  kind: string
  filename: string
  content_type: string
  size_bytes: number
  created_at: string | Date
  data?: string
}

function toFileMeta(r: RentalFileRow): RentalFileMeta {
  return {
    id: r.id,
    rentalId: r.rental_id,
    kind: r.kind,
    filename: r.filename,
    contentType: r.content_type,
    sizeBytes: Number(r.size_bytes),
    createdAt: new Date(r.created_at).toISOString(),
  }
}

export interface RentalFileInput {
  rentalId: string
  kind: string
  filename: string
  contentType: string
  data: Buffer
}

export async function insertRentalFile(input: RentalFileInput): Promise<string> {
  await ensureRentalProtectionSchema()
  const id = shortId("file")
  await sql()`
    INSERT INTO rental_files (id, rental_id, kind, filename, content_type, size_bytes, data)
    VALUES (
      ${id}, ${input.rentalId}, ${input.kind}, ${input.filename},
      ${input.contentType}, ${input.data.length}, ${input.data.toString("base64")}
    )
  `
  return id
}

/** Replaces any earlier file of the same kind (e.g. a re-uploaded licence front). */
export async function replaceRentalFile(input: RentalFileInput): Promise<string> {
  await ensureRentalProtectionSchema()
  await sql()`
    DELETE FROM rental_files WHERE rental_id = ${input.rentalId} AND kind = ${input.kind}
  `
  return insertRentalFile(input)
}

export async function listRentalFiles(rentalId: string): Promise<RentalFileMeta[]> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT id, rental_id, kind, filename, content_type, size_bytes, created_at
    FROM rental_files WHERE rental_id = ${rentalId} ORDER BY created_at
  `) as RentalFileRow[]
  return rows.map(toFileMeta)
}

export async function getRentalFile(id: string): Promise<RentalFile | null> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`SELECT * FROM rental_files WHERE id = ${id}`) as RentalFileRow[]
  const r = rows[0]
  return r ? { ...toFileMeta(r), data: Buffer.from(r.data ?? "", "base64") } : null
}

/* ── Handover / return checklists ── */

export interface RentalEvidenceInput {
  rentalId: string
  kind: "pickup" | "return"
  recordedAt: string
  odometer: number | null
  fuel: string
  photoIds: string[]
  signatureFileId: string | null
  signedName: string
  amountOwed: number | null
  notes: string
}

export interface RentalEvidence extends RentalEvidenceInput {
  id: string
  createdAt: string
}

interface RentalEvidenceRow {
  id: string
  rental_id: string
  kind: "pickup" | "return"
  recorded_at: string | Date
  odometer: number | null
  fuel: string | null
  photo_ids: string[]
  signature_file_id: string | null
  signed_name: string | null
  amount_owed: string | number | null
  notes: string | null
  created_at: string | Date
}

function toEvidence(r: RentalEvidenceRow): RentalEvidence {
  return {
    id: r.id,
    rentalId: r.rental_id,
    kind: r.kind,
    recordedAt: new Date(r.recorded_at).toISOString(),
    odometer: r.odometer == null ? null : Number(r.odometer),
    fuel: r.fuel ?? "",
    photoIds: Array.isArray(r.photo_ids) ? r.photo_ids : [],
    signatureFileId: r.signature_file_id,
    signedName: r.signed_name ?? "",
    amountOwed: r.amount_owed == null ? null : Number(r.amount_owed),
    notes: r.notes ?? "",
    createdAt: new Date(r.created_at).toISOString(),
  }
}

/** One pickup and one return record per rental; re-saving overwrites it. */
export async function upsertRentalEvidence(input: RentalEvidenceInput): Promise<RentalEvidence> {
  await ensureRentalProtectionSchema()
  const photos = JSON.stringify(input.photoIds)
  const rows = (await sql()`
    INSERT INTO rental_evidence (
      id, rental_id, kind, recorded_at, odometer, fuel, photo_ids,
      signature_file_id, signed_name, amount_owed, notes
    ) VALUES (
      ${shortId("ev")}, ${input.rentalId}, ${input.kind}, ${input.recordedAt},
      ${input.odometer}, ${input.fuel}, ${photos}::jsonb, ${input.signatureFileId},
      ${input.signedName}, ${input.amountOwed}, ${input.notes}
    )
    ON CONFLICT (rental_id, kind) DO UPDATE SET
      recorded_at = EXCLUDED.recorded_at, odometer = EXCLUDED.odometer,
      fuel = EXCLUDED.fuel, photo_ids = EXCLUDED.photo_ids,
      signature_file_id = EXCLUDED.signature_file_id,
      signed_name = EXCLUDED.signed_name, amount_owed = EXCLUDED.amount_owed,
      notes = EXCLUDED.notes
    RETURNING *
  `) as RentalEvidenceRow[]
  return toEvidence(rows[0])
}

export async function getRentalEvidence(rentalId: string): Promise<RentalEvidence[]> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT * FROM rental_evidence WHERE rental_id = ${rentalId} ORDER BY recorded_at
  `) as RentalEvidenceRow[]
  return rows.map(toEvidence)
}

/* ── Email log (what the customer was told, and when) ── */

export interface RentalEmailLogEntry {
  kind: string
  recipient: string
  subject: string
  sentAt: string
}

export async function logRentalEmail(
  rentalId: string,
  kind: string,
  recipient: string,
  subject: string,
): Promise<void> {
  await ensureRentalProtectionSchema()
  await sql()`
    INSERT INTO rental_email_log (id, rental_id, kind, recipient, subject)
    VALUES (${shortId("mail")}, ${rentalId}, ${kind}, ${recipient}, ${subject})
  `
}

export async function getRentalEmailLog(rentalId: string): Promise<RentalEmailLogEntry[]> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`
    SELECT * FROM rental_email_log WHERE rental_id = ${rentalId} ORDER BY sent_at
  `) as { kind: string; recipient: string; subject: string; sent_at: string | Date }[]
  return rows.map((r) => ({
    kind: r.kind,
    recipient: r.recipient,
    subject: r.subject,
    sentAt: new Date(r.sent_at).toISOString(),
  }))
}

/** The signed lease (Agreements tab) for this renter + vehicle, if one exists. */
export async function findSignedLease(email: string, rego: string): Promise<LeaseAgreement | null> {
  await createLeaseAgreementsTable()
  const rows = (await sql()`
    SELECT * FROM lease_agreements
    WHERE lower(renter_email) = ${email.trim().toLowerCase()}
      AND upper(rego) = ${rego.trim().toUpperCase()}
      AND status = 'signed'
    ORDER BY signed_at DESC LIMIT 1
  `) as LeaseAgreementRow[]
  return rows[0] ? toLeaseAgreement(rows[0]) : null
}

/* ── Disputes ── */

export interface Dispute {
  id: string
  rentalId: string | null
  chargeId: string | null
  customerName: string
  amount: number
  currency: string
  reason: string
  status: string
  dueBy: string | null
  evidenceStatus: "none" | "draft" | "submitted"
  evidencePackFileId: string | null
  evidenceSummary: unknown
  evidenceBuiltAt: string | null
  evidenceSubmittedAt: string | null
  createdAt: string
}

interface DisputeRow {
  id: string
  rental_id: string | null
  charge_id: string | null
  customer_name: string | null
  amount: string | number
  currency: string
  reason: string | null
  status: string
  due_by: string | Date | null
  evidence_status: Dispute["evidenceStatus"]
  evidence_pack_file_id: string | null
  evidence_summary: unknown
  evidence_built_at: string | Date | null
  evidence_submitted_at: string | Date | null
  created_at: string | Date
}

const iso = (v: string | Date | null) => (v ? new Date(v).toISOString() : null)

function toDispute(r: DisputeRow): Dispute {
  return {
    id: r.id,
    rentalId: r.rental_id,
    chargeId: r.charge_id,
    customerName: r.customer_name ?? "",
    amount: Number(r.amount),
    currency: r.currency,
    reason: r.reason ?? "",
    status: r.status,
    dueBy: iso(r.due_by),
    evidenceStatus: r.evidence_status,
    evidencePackFileId: r.evidence_pack_file_id,
    evidenceSummary: r.evidence_summary,
    evidenceBuiltAt: iso(r.evidence_built_at),
    evidenceSubmittedAt: iso(r.evidence_submitted_at),
    createdAt: iso(r.created_at) ?? "",
  }
}

/** Insert on dispute.created; later events only refresh the Stripe-owned fields. */
export async function upsertDispute(d: {
  id: string
  rentalId: string | null
  chargeId: string | null
  customerName: string
  amount: number
  currency: string
  reason: string
  status: string
  dueBy: string | null
}): Promise<{ created: boolean }> {
  await ensureRentalProtectionSchema()
  // xmax = 0 only on a freshly inserted row — lets the webhook email the owner
  // once even though Stripe may deliver dispute.created more than once.
  const rows = (await sql()`
    INSERT INTO disputes (
      id, rental_id, charge_id, customer_name, amount, currency, reason, status, due_by
    ) VALUES (
      ${d.id}, ${d.rentalId}, ${d.chargeId}, ${d.customerName}, ${d.amount},
      ${d.currency}, ${d.reason}, ${d.status}, ${d.dueBy}
    )
    ON CONFLICT (id) DO UPDATE SET
      amount = EXCLUDED.amount, reason = EXCLUDED.reason,
      status = EXCLUDED.status, due_by = EXCLUDED.due_by, updated_at = now()
    RETURNING (xmax = 0) AS created
  `) as { created: boolean }[]
  return { created: Boolean(rows[0]?.created) }
}

const CLOSED_DISPUTE_STATUSES = ["won", "lost", "warning_closed", "prevented"]

export async function getDisputes(includeClosed = false): Promise<Dispute[]> {
  await ensureRentalProtectionSchema()
  const rows = (includeClosed
    ? await sql()`SELECT * FROM disputes ORDER BY due_by ASC NULLS LAST`
    : await sql()`
        SELECT * FROM disputes WHERE NOT (status = ANY(${CLOSED_DISPUTE_STATUSES}))
        ORDER BY due_by ASC NULLS LAST
      `) as DisputeRow[]
  return rows.map(toDispute)
}

export async function getDispute(id: string): Promise<Dispute | null> {
  await ensureRentalProtectionSchema()
  const rows = (await sql()`SELECT * FROM disputes WHERE id = ${id}`) as DisputeRow[]
  return rows[0] ? toDispute(rows[0]) : null
}

export async function markDisputeEvidenceDraft(
  id: string,
  packFileId: string,
  summary: unknown,
): Promise<void> {
  await sql()`
    UPDATE disputes SET evidence_status = 'draft', evidence_pack_file_id = ${packFileId},
      evidence_summary = ${JSON.stringify(summary)}::jsonb,
      evidence_built_at = now(), updated_at = now()
    WHERE id = ${id}
  `
}

export async function markDisputeEvidenceSubmitted(id: string, status: string): Promise<void> {
  await sql()`
    UPDATE disputes SET evidence_status = 'submitted', status = ${status},
      evidence_submitted_at = now(), updated_at = now()
    WHERE id = ${id}
  `
}
