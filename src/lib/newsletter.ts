import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Newsletter sign-ups. Server-only — import from route handlers.
//
// Its own small module rather than another section of db.ts, but the same
// database (DATABASE_URL) and the same rule: the Neon driver's fetch must opt
// out of the Next Data Cache, or reads go stale.

let client: NeonQueryFunction<false, false> | null = null

function sql(): NeonQueryFunction<false, false> {
  if (client) return client
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) {
    throw new Error("No database connection string — set DATABASE_URL (or POSTGRES_URL).")
  }
  client = neon(url, { fetchOptions: { cache: "no-store" } })
  return client
}

let ready: Promise<unknown> | undefined

/** Creates the table on first use, once per server instance. Idempotent. */
function ensureTable(): Promise<unknown> {
  ready ??= sql()`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         BIGSERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      source     TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.catch((err) => {
    ready = undefined
    throw err
  })
  return ready
}

/**
 * Saves a subscriber. Returns true when the address is new, false when it was
 * already on the list (so the caller can skip the notification email).
 */
export async function addNewsletterSubscriber(email: string, source: string): Promise<boolean> {
  await ensureTable()
  const rows = (await sql()`
    INSERT INTO newsletter_subscribers (email, source)
    VALUES (${email}, ${source})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `) as { id: number }[]
  return rows.length > 0
}
