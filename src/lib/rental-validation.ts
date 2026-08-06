// Validation for the rental application form. Pure and dependency-free, so the
// browser (VehicleModal) and the API route (/api/rental-application) apply the
// same rules — client-side checks are a convenience, not a guarantee.
//
// These are format checks, not identity checks: they exist to catch typos
// before the owner rings the applicant. The physical licence is still verified
// at pick-up, so every rule errs towards accepting a real customer rather than
// blocking one.

export interface FieldResult {
  ok: boolean
  /** Message to show under the field. Empty when ok. */
  error: string
  /** Tidied value to store/display. Falls back to the input when invalid. */
  value: string
}

const ok = (value: string): FieldResult => ({ ok: true, error: "", value })
const bad = (error: string, value: string): FieldResult => ({
  ok: false,
  error,
  value,
})

/* ─────────────────────── Australian mobile ─────────────────────── */

/**
 * Australian mobile numbers are 04 followed by eight digits. Accepts the ways
 * people actually type them — spaces, dashes, brackets, +61, 0061 — and
 * normalises to "04XX XXX XXX".
 *
 * Landlines are rejected on purpose: the owner rings and texts applicants about
 * pick-up, and the field is labelled for a mobile.
 */
export function validateMobile(raw: string): FieldResult {
  const input = raw.trim()
  if (!input) return bad("Required", input)

  // Strip everything except digits and a leading +.
  let digits = input.replace(/[\s()\-.]/g, "")
  if (digits.startsWith("+61")) digits = "0" + digits.slice(3)
  else if (digits.startsWith("0061")) digits = "0" + digits.slice(4)
  else if (digits.startsWith("61") && digits.length === 11) {
    digits = "0" + digits.slice(2)
  }

  if (!/^\d+$/.test(digits)) {
    return bad("Use digits only, e.g. 0412 345 678", input)
  }
  if (/^0[23478]\d{8}$/.test(digits) && !digits.startsWith("04")) {
    return bad("That looks like a landline — please give a mobile", input)
  }
  if (!/^04\d{8}$/.test(digits)) {
    return bad("Enter an Australian mobile, e.g. 0412 345 678", input)
  }

  return ok(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`)
}

/* ────────────────── Australian driver licence ────────────────── */

interface LicenceRule {
  code: string
  name: string
  pattern: RegExp
  /** Shown when the pattern fails — describes the state's format. */
  hint: string
}

/**
 * Per-state licence number formats. Australia has no national format, so the
 * applicant picks the issuing state and we check against that rule. Kept
 * deliberately permissive — states have reissued licences under older formats,
 * and rejecting a valid one costs a booking.
 */
export const LICENCE_RULES: LicenceRule[] = [
  { code: "QLD", name: "Queensland", pattern: /^\d{8,9}$/, hint: "8 or 9 digits" },
  { code: "NSW", name: "New South Wales", pattern: /^[A-Z0-9]{6,8}$/, hint: "6 to 8 letters or digits" },
  { code: "VIC", name: "Victoria", pattern: /^\d{1,10}$/, hint: "up to 10 digits" },
  { code: "SA", name: "South Australia", pattern: /^[A-Z0-9]{6}$/, hint: "6 letters or digits" },
  { code: "WA", name: "Western Australia", pattern: /^\d{7}$/, hint: "7 digits" },
  { code: "TAS", name: "Tasmania", pattern: /^[A-Z0-9]{6,8}$/, hint: "6 to 8 letters or digits" },
  { code: "ACT", name: "ACT", pattern: /^\d{1,10}$/, hint: "up to 10 digits" },
  { code: "NT", name: "Northern Territory", pattern: /^[A-Z0-9]{1,10}$/, hint: "up to 10 letters or digits" },
  // Overseas licences are accepted at the owner's discretion, so only a loose
  // sanity check applies — the alternative is turning away backpackers.
  { code: "OTHER", name: "Overseas / other", pattern: /^[A-Z0-9-]{4,20}$/, hint: "4 to 20 characters" },
]

export const DEFAULT_LICENCE_STATE = "QLD"

export function validateLicence(raw: string, stateCode: string): FieldResult {
  const input = raw.trim()
  if (!input) return bad("Required", input)

  // Licence numbers are quoted with spaces and dashes; neither is significant.
  const cleaned = input.replace(/[\s-]/g, "").toUpperCase()
  const rule =
    LICENCE_RULES.find((r) => r.code === stateCode) ??
    LICENCE_RULES[LICENCE_RULES.length - 1]

  // OTHER keeps dashes, since overseas numbers often use them.
  const candidate = rule.code === "OTHER" ? input.toUpperCase().replace(/\s/g, "") : cleaned

  if (!rule.pattern.test(candidate)) {
    return bad(`${rule.code} licences are ${rule.hint}`, input)
  }
  return ok(candidate)
}

export function licenceStateName(code: string): string {
  return LICENCE_RULES.find((r) => r.code === code)?.name ?? code
}

/* ─────────────────────────── Email ─────────────────────────── */

export function validateEmail(raw: string): FieldResult {
  const input = raw.trim()
  if (!input) return bad("Required", input)
  // Deliberately loose: one @, something either side, a dot in the domain. Any
  // stricter and valid addresses start getting rejected.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input)) {
    return bad("Enter a valid email, e.g. name@example.com", input)
  }
  return ok(input.toLowerCase())
}

/* ──────────────────────── Date of birth ──────────────────────── */

/**
 * Sanity-checks the date rather than enforcing a rental age — a real date, in
 * the past, for a plausibly-aged human. Age policy is the owner's call and is
 * settled on the phone.
 */
export function validateDob(raw: string): FieldResult {
  const input = raw.trim()
  if (!input) return bad("Required", input)

  const d = new Date(input)
  if (isNaN(d.getTime())) return bad("Enter a valid date", input)

  const now = new Date()
  if (d.getTime() > now.getTime()) return bad("Date of birth cannot be in the future", input)

  let age = now.getFullYear() - d.getFullYear()
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
  if (beforeBirthday) age--

  if (age < 16) return bad("You must hold a driver licence to apply", input)
  if (age > 100) return bad("Please check the year", input)

  return ok(input)
}

/* ──────────────────────── Plain text ──────────────────────── */

export function validateRequired(raw: string, label: string, min = 2): FieldResult {
  const input = raw.trim()
  if (!input) return bad("Required", input)
  if (input.length < min) return bad(`${label} looks too short`, input)
  return ok(input)
}

/* ────────────────────── Licence photos ────────────────────── */

/**
 * Serverless request bodies are capped (~4.5MB on Vercel) and two photos share
 * one request, so each is capped well under that.
 * Used by both the upload control and the email attachment builder.
 */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"]
const ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]

/** `accept` attribute covering the formats below, extensions included so
 *  iPhone HEIC files are offered by the file picker. */
export const UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}

/**
 * Checks a licence photo before it is queued for upload. Matches on extension
 * OR MIME type, not both: iOS hands over HEIC files with an empty `type`, and
 * some Android browsers report `application/octet-stream` for a plain JPEG.
 */
export function validateUpload(file: File): FieldResult {
  const name = file.name || "file"
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : ""
  const mime = (file.type || "").toLowerCase()

  const extOk = ALLOWED_EXTENSIONS.includes(ext)
  const mimeOk = ALLOWED_MIME.includes(mime)

  if (!extOk && !mimeOk) {
    return bad("Use a JPG, PNG, WEBP, HEIC or PDF file", name)
  }
  if (file.size === 0) {
    return bad("That file is empty — try another", name)
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return bad(
      `That file is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}`,
      name,
    )
  }
  return ok(name)
}
