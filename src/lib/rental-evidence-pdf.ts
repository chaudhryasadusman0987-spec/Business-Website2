import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from "pdf-lib"
import type {
  RentalAgreement,
  RentalEmailLogEntry,
  RentalEvidence,
  RentalFile,
} from "@/lib/db"

// PDFs for the chargeback-protection flow: the return confirmation emailed to
// the customer, and the evidence pack uploaded to a Stripe dispute. Both use
// pdf-lib (as generateLeaseAgreement.ts does) and only embed JPEG/PNG — which
// is what the admin and checkout uploads are compressed to in the browser.

const PAGE: [number, number] = [595, 842] // A4
const MARGIN = 50
const LINE = 14

/** Small layout helper: flowing text, label/value rows and images with page breaks. */
class Writer {
  page: PDFPage
  y = PAGE[1] - MARGIN

  constructor(
    readonly doc: PDFDocument,
    readonly font: PDFFont,
    readonly bold: PDFFont,
  ) {
    this.page = doc.addPage(PAGE)
  }

  static async create(): Promise<Writer> {
    const doc = await PDFDocument.create()
    return new Writer(
      doc,
      await doc.embedFont(StandardFonts.Helvetica),
      await doc.embedFont(StandardFonts.HelveticaBold),
    )
  }

  ensure(height: number) {
    if (this.y - height < MARGIN) this.newPage()
  }

  newPage() {
    this.page = this.doc.addPage(PAGE)
    this.y = PAGE[1] - MARGIN
  }

  /** Standard fonts are WinAnsi only — drop anything they can't draw. */
  clean(s: string): string {
    return s
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/•/g, "-")
      .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "")
  }

  text(raw: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {}) {
    const size = opts.size ?? 10
    const f = opts.bold ? this.bold : this.font
    const maxWidth = PAGE[0] - MARGIN * 2
    for (const para of this.clean(raw).split("\n")) {
      let line = ""
      const flush = () => {
        this.ensure(LINE)
        this.page.drawText(line, {
          x: MARGIN,
          y: this.y,
          size,
          font: f,
          color: rgb(...(opts.color ?? [0, 0, 0])),
        })
        this.y -= size + 4
      }
      for (const word of para.split(" ")) {
        const test = line ? `${line} ${word}` : word
        if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
          flush()
          line = word
        } else {
          line = test
        }
      }
      flush()
    }
    this.y -= opts.gap ?? 4
  }

  heading(s: string) {
    this.ensure(40)
    this.y -= 8
    this.text(s, { size: 13, bold: true, gap: 6 })
  }

  row(label: string, value: string) {
    const valueX = MARGIN + 150
    const maxWidth = PAGE[0] - MARGIN - valueX
    const words = this.clean(value || "-").split(" ")
    const lines: string[] = []
    let line = ""
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (this.font.widthOfTextAtSize(test, 10) > maxWidth && line) {
        lines.push(line)
        line = w
      } else line = test
    }
    lines.push(line)
    this.ensure(LINE * lines.length)
    this.page.drawText(this.clean(label), { x: MARGIN, y: this.y, size: 10, font: this.bold })
    for (const l of lines) {
      this.page.drawText(l, { x: valueX, y: this.y, size: 10, font: this.font })
      this.y -= LINE
    }
  }

  image(img: PDFImage, maxW: number, maxH: number, caption?: string) {
    const scale = Math.min(maxW / img.width, maxH / img.height, 1)
    const w = img.width * scale
    const h = img.height * scale
    this.ensure(h + (caption ? 18 : 6))
    this.page.drawImage(img, { x: MARGIN, y: this.y - h, width: w, height: h })
    this.y -= h + 4
    if (caption) this.text(caption, { size: 8, color: [0.4, 0.4, 0.4] })
    this.y -= 4
  }

  /** Two images side by side (photo grids). */
  imagePair(imgs: { img: PDFImage; caption: string }[], maxH = 200) {
    const colW = (PAGE[0] - MARGIN * 2 - 10) / 2
    const sized = imgs.map(({ img, caption }) => {
      const scale = Math.min(colW / img.width, maxH / img.height, 1)
      return { img, caption, w: img.width * scale, h: img.height * scale }
    })
    const rowH = Math.max(...sized.map((s) => s.h))
    this.ensure(rowH + 18)
    sized.forEach((s, i) => {
      const x = MARGIN + i * (colW + 10)
      this.page.drawImage(s.img, { x, y: this.y - s.h, width: s.w, height: s.h })
      this.page.drawText(this.clean(s.caption), {
        x,
        y: this.y - rowH - 10,
        size: 8,
        font: this.font,
        color: rgb(0.4, 0.4, 0.4),
      })
    })
    this.y -= rowH + 20
  }

  async embed(file: { data: Buffer | Uint8Array; contentType: string }): Promise<PDFImage | null> {
    try {
      if (file.contentType === "image/jpeg") return await this.doc.embedJpg(file.data)
      if (file.contentType === "image/png") return await this.doc.embedPng(file.data)
    } catch (e) {
      console.error("PDF image embed failed:", e)
    }
    return null
  }

  save(): Promise<Uint8Array> {
    return this.doc.save()
  }
}

const brisbane = (isoDate: string | null | undefined) =>
  isoDate
    ? new Date(isoDate).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }) + " (Brisbane)"
    : "-"

const money = (n: number) => `$${n.toFixed(2)}`

function header(w: Writer, title: string) {
  w.text("PAK OZ RENTALS", { size: 18, bold: true, gap: 2 })
  w.text("Pak Oz Solutions Pty Ltd - ACN 700 444 695 - pakozsolutions.com.au", { size: 9, gap: 2 })
  w.text(title, { size: 13, bold: true, gap: 10 })
}

function checklistRows(w: Writer, ev: RentalEvidence) {
  w.row("Date / time:", brisbane(ev.recordedAt))
  w.row("Odometer:", ev.odometer != null ? `${ev.odometer.toLocaleString("en-AU")} km` : "-")
  w.row("Fuel level:", ev.fuel || "-")
  if (ev.kind === "return") w.row("Amount still owed:", ev.amountOwed != null ? money(ev.amountOwed) : "-")
  w.row("Signed by:", ev.signedName || "-")
  w.row("Photos taken:", String(ev.photoIds.length))
  if (ev.notes) w.row("Notes:", ev.notes)
}

/* ───────────── Return confirmation (emailed to the customer) ───────────── */

export async function generateReturnConfirmationPdf(opts: {
  rental: RentalAgreement
  returnRecord: RentalEvidence
  pickupRecord: RentalEvidence | null
  signature: RentalFile | null
  daysUsed: number
  refundAmount: number
}): Promise<Uint8Array> {
  const { rental, returnRecord, pickupRecord } = opts
  const w = await Writer.create()
  header(w, "VEHICLE RETURN CONFIRMATION")

  w.heading("Rental")
  w.row("Customer:", rental.customerName)
  w.row("Email:", rental.customerEmail)
  w.row("Vehicle:", `${rental.vehicleName} (${rental.vehicleRego})`)
  w.row("Weekly rate:", money(rental.agreedWeeklyRate))
  w.row("Rental started:", brisbane(rental.startDate))
  w.row("Rental reference:", rental.id)

  if (pickupRecord) {
    w.heading("At pickup")
    checklistRows(w, pickupRecord)
  }

  w.heading("At return")
  checklistRows(w, returnRecord)
  if (pickupRecord?.odometer != null && returnRecord.odometer != null) {
    w.row("Distance driven:", `${(returnRecord.odometer - pickupRecord.odometer).toLocaleString("en-AU")} km`)
  }

  w.heading("Billing")
  w.row("Weekly billing:", "Cancelled - no further weekly charges")
  w.row("Days used this week:", `${opts.daysUsed} of 7`)
  if (opts.refundAmount > 0) w.row("Refund due to you:", money(opts.refundAmount))
  w.row(
    "Amount still owed:",
    returnRecord.amountOwed && returnRecord.amountOwed > 0
      ? `${money(returnRecord.amountOwed)} - payable to Pak Oz Rentals`
      : "Nothing owed",
  )

  if (opts.signature) {
    const img = await w.embed(opts.signature)
    if (img) {
      w.heading("Customer signature at return")
      w.image(img, 220, 90, `${returnRecord.signedName || rental.customerName} - ${brisbane(returnRecord.recordedAt)}`)
    }
  }
  return w.save()
}

/* ───────────── Dispute evidence pack ───────────── */

export interface PaymentHistoryEntry {
  id: string
  created: number
  amount: number
  currency: string
  status: string
  description: string
  disputed: boolean
  threeDs: string | null
}

export interface EvidencePackInput {
  rental: RentalAgreement
  disputeId: string
  disputeReason: string
  disputeAmount: number
  licenceFiles: RentalFile[]
  pickup: { record: RentalEvidence; photos: RentalFile[]; signature: RentalFile | null } | null
  returned: { record: RentalEvidence; photos: RentalFile[]; signature: RentalFile | null } | null
  payments: PaymentHistoryEntry[]
  emails: RentalEmailLogEntry[]
  signedLeaseAttached: boolean
}

/**
 * One PDF holding everything a bank reviewer needs, in the order they check
 * it: who the customer is, what they agreed to, how they authenticated, that
 * they received the car, and what they were charged and told. Photos are
 * capped by a byte budget because Stripe limits a dispute's evidence files to
 * 4.5MB combined.
 */
export async function buildEvidencePackPdf(
  input: EvidencePackInput,
  imageBudgetBytes = 3_200_000,
): Promise<{ pdf: Uint8Array; omittedPhotos: number }> {
  const { rental } = input
  const w = await Writer.create()
  let budget = imageBudgetBytes
  let omittedPhotos = 0

  header(w, "CHARGEBACK EVIDENCE - WEEKLY VEHICLE RENTAL")
  w.row("Dispute:", `${input.disputeId} - ${input.disputeReason.replace(/_/g, " ")} - ${money(input.disputeAmount)}`)
  w.row("Prepared:", brisbane(new Date().toISOString()))

  w.heading("1. Summary")
  const pickupLine = input.pickup
    ? `The customer collected the vehicle on ${brisbane(input.pickup.record.recordedAt)}${
        input.pickup.signature ? " and signed the handover checklist on screen" : ""
      }.`
    : "Handover checklist not recorded."
  const returnLine = input.returned
    ? `The vehicle was returned on ${brisbane(input.returned.record.recordedAt)}${
        input.returned.record.amountOwed ? ` with ${money(input.returned.record.amountOwed)} still owed` : ""
      }.`
    : "At the time of this dispute the vehicle had not been returned and remained in the customer's possession."
  w.text(
    `${rental.customerName} rented ${rental.vehicleName} (${rental.vehicleRego}) at ${money(rental.agreedWeeklyRate)} per week, ` +
      `billed automatically each week until the vehicle is returned. Before paying, the customer ticked a box agreeing to ` +
      `these weekly charges and typed their full name (section 3). ` +
      (rental.paymentMethod === "card"
        ? `Their card was verified with 3D Secure by the issuing bank (result: ${rental.threeDsResult ?? "none"}). `
        : "") +
      `${pickupLine} ${returnLine} Every charge was disclosed in advance by email and receipted.`,
  )

  w.heading("2. Customer identity")
  w.row("Name:", rental.customerName)
  w.row("Email:", rental.customerEmail)
  w.row("Phone:", rental.customerPhone)
  w.row("Address:", rental.customerAddress ?? "-")
  w.row("Licence:", [rental.licenceNumber, rental.licenceState].filter(Boolean).join(" ") || "-")
  w.row("Cardholder name:", rental.cardholderName ?? "-")
  w.row(
    "Name check:",
    rental.nameCheck === "match"
      ? "Cardholder name matches the licence name"
      : rental.nameCheck === "mismatch"
        ? "Cardholder name differs from licence name - ID verified in person at handover"
        : "-",
  )
  for (const f of input.licenceFiles) {
    const img = await w.embed(f)
    const label = f.kind === "licence_front" ? "Driving licence - front" : "Driving licence - back"
    if (img) {
      budget -= f.sizeBytes
      w.image(img, 300, 200, `${label} (uploaded ${brisbane(f.createdAt)})`)
    } else {
      w.text(`${label}: on file (${f.contentType}), uploaded ${brisbane(f.createdAt)}`, { size: 9 })
    }
  }

  w.heading("3. Agreement to weekly charges")
  w.row("Accepted at:", brisbane(rental.termsAcceptedAt))
  w.row("IP address:", rental.termsIp ?? "-")
  w.row("Device / browser:", rental.termsUserAgent ?? "-")
  w.row("Typed full name:", rental.termsTypedName ?? "-")
  w.row("Terms version:", rental.termsVersion ?? "-")
  w.row("Signed lease:", input.signedLeaseAttached ? "Yes - attached separately as the signed agreement" : "Not on file")
  w.text("Exact text the customer agreed to:", { bold: true, gap: 2 })
  w.text(rental.termsText ?? "-", { size: 9 })

  w.heading("4. Payment authentication")
  w.row("Payment method:", rental.paymentMethod === "au_becs_debit" ? "BECS direct debit" : "Card")
  w.row("Card:", [rental.cardBrand, rental.cardLast4 && `ending ${rental.cardLast4}`].filter(Boolean).join(" ") || "-")
  w.row("3D Secure result:", rental.threeDsResult ?? "-")
  w.row("3DS version / flow:", [rental.threeDsVersion, rental.threeDsFlow].filter(Boolean).join(" / ") || "-")

  for (const [title, part] of [
    ["5. Vehicle handover (pickup)", input.pickup],
    ["6. Vehicle return", input.returned],
  ] as const) {
    w.heading(title)
    if (!part) {
      w.text(title.startsWith("6") ? "Not yet returned." : "Not recorded.")
      continue
    }
    checklistRows(w, part.record)
    if (part.signature) {
      const sig = await w.embed(part.signature)
      if (sig) w.image(sig, 200, 80, `Customer signature - ${part.record.signedName}`)
    }
    const embedded: { img: PDFImage; caption: string }[] = []
    for (let i = 0; i < part.photos.length; i++) {
      const photo = part.photos[i]
      if (photo.sizeBytes > budget) {
        omittedPhotos++
        continue
      }
      const img = await w.embed(photo)
      if (!img) continue
      budget -= photo.sizeBytes
      embedded.push({ img, caption: `Photo ${i + 1} - ${brisbane(photo.createdAt)}` })
    }
    for (let i = 0; i < embedded.length; i += 2) w.imagePair(embedded.slice(i, i + 2))
  }
  if (omittedPhotos > 0) {
    w.text(`${omittedPhotos} further photo(s) are held on file and available on request.`, { size: 9 })
  }

  w.heading("7. Payment history")
  for (const p of input.payments) {
    w.row(
      new Date(p.created * 1000).toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane" }),
      `${money(p.amount)} ${p.currency.toUpperCase()} - ${p.status}${p.disputed ? " (DISPUTED)" : ""} - ${p.description}${
        p.threeDs ? ` - 3DS ${p.threeDs}` : ""
      } - ${p.id}`,
    )
  }
  if (input.payments.length === 0) w.text("No charges found.")

  w.heading("8. Emails sent to the customer")
  for (const e of input.emails) {
    w.row(
      new Date(e.sentAt).toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane" }),
      `${e.subject} (to ${e.recipient})`,
    )
  }
  if (input.emails.length === 0) w.text("No emails logged.")

  return { pdf: await w.save(), omittedPhotos }
}
