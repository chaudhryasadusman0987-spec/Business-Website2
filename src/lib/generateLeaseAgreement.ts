import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib"

// Generates the Pak Oz Rentals vehicle lease agreement PDF — used both for a
// blank agreement (no signature yet) and the finalised, signed copy attached
// to the confirmation emails. Layout mirrors the reference lease document
// Ehtsham shared: owner/rentee/vehicle details, rental terms, key clauses,
// a fees table, then the signature block.

export interface AgreementData {
  renterName: string
  renterAddress: string
  renterDob: string
  licenceNumber: string
  licenceState: string
  renterPhone: string
  renterEmail: string
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
  signatureImageBytes?: Uint8Array
  signedAt?: string
}

export async function generateLeaseAgreementPdf(
  data: AgreementData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageSize: [number, number] = [595, 842] // A4
  const margin = 50
  let page = pdfDoc.addPage(pageSize)
  let y = pageSize[1] - margin

  const lineHeight = 14

  function newPageIfNeeded(needed = lineHeight) {
    if (y - needed < margin) {
      page = pdfDoc.addPage(pageSize)
      y = pageSize[1] - margin
    }
  }

  function drawText(
    text: string,
    opts: {
      size?: number
      font?: PDFFont
      color?: [number, number, number]
      gapAfter?: number
    } = {},
  ) {
    const size = opts.size ?? 10
    const f = opts.font ?? font
    const maxWidth = pageSize[0] - margin * 2
    const words = text.split(" ")
    let line = ""
    for (const word of words) {
      const test = line ? line + " " + word : word
      const width = f.widthOfTextAtSize(test, size)
      if (width > maxWidth) {
        newPageIfNeeded()
        page.drawText(line, {
          x: margin,
          y,
          size,
          font: f,
          color: opts.color ? rgb(...opts.color) : rgb(0, 0, 0),
        })
        y -= lineHeight
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      newPageIfNeeded()
      page.drawText(line, {
        x: margin,
        y,
        size,
        font: f,
        color: opts.color ? rgb(...opts.color) : rgb(0, 0, 0),
      })
      y -= lineHeight
    }
    y -= opts.gapAfter ?? 4
  }

  function heading(text: string) {
    newPageIfNeeded(20)
    y -= 6
    drawText(text, { size: 13, font: bold, gapAfter: 6 })
  }

  function row(label: string, value: string) {
    newPageIfNeeded()
    page.drawText(label, { x: margin, y, size: 10, font: bold })
    page.drawText(value || "—", { x: margin + 160, y, size: 10, font })
    y -= lineHeight
  }

  // ── HEADER ──
  drawText("PAK OZ RENTALS", { size: 18, font: bold, gapAfter: 2 })
  drawText("A Pak Oz Solutions Company", { size: 10, gapAfter: 2 })
  drawText("VEHICLE LEASE AGREEMENT", { size: 13, font: bold, gapAfter: 12 })

  // ── REGISTERED OWNER ──
  heading("Registered Owner")
  row("Name:", "Pak Oz Solutions Pty Ltd (trading as Pak Oz Rentals)")
  row("Address:", "1 Cedrus St, Sunnybank Hills QLD 4109")
  row("Contact:", "0424 948 512 / +61 480 488 080")
  row("Email:", "pakozsolutions.com.au")

  // ── RENTEE DETAILS ──
  heading("Rentee Details")
  row("Name:", data.renterName)
  row("Address:", data.renterAddress)
  row("Date of Birth:", data.renterDob)
  row("Licence No.:", data.licenceNumber)
  row("Licence State:", data.licenceState)
  row("Contact:", data.renterPhone)
  row("Email:", data.renterEmail)

  // ── VEHICLE ──
  heading("Vehicle")
  row("Registration:", data.rego)
  row("Make:", data.make)
  row("Model:", data.model)
  row("Year:", data.year)
  row("VIN:", data.vin)
  row("Odometer at Start:", data.odometerStart)
  row("Km Allowance:", "Unlimited (subject to Prohibited Use terms)")

  drawText(
    "NOTE: The parties choose the above stated addresses as their physical " +
      "addresses at which legal proceedings may be instituted. Insurance " +
      "covers Queensland only unless otherwise agreed in writing.",
    { size: 8, gapAfter: 10 },
  )

  // ── RENTAL TERMS ──
  heading("Rental Terms")
  row("Weekly Rent:", `$${data.weeklyRent.toFixed(2)}`)
  row("Refundable Security Deposit:", `$${data.securityDeposit.toFixed(2)}`)
  row(
    "Insurance Access Fee:",
    `$${data.insuranceAccessFee.toFixed(2)} (covers your excess in the event of a claim)`,
  )
  row(
    "Minimum Rental Period:",
    "4 weeks, then continuing until 1 week's written notice",
  )
  row("Start Date & Time:", `${data.startDate} at ${data.startTime}`)

  drawText(
    "If the Rentee returns the vehicle before completing the 4-week minimum " +
      "period, 50% of the remaining rent up to the 4-week mark is still " +
      "payable to the Owner, unless otherwise agreed in writing. If no " +
      "written notice is provided by the Rentee after the minimum period, " +
      "this agreement continues on a week-to-week basis until 1 week's " +
      "written notice is given by either party.",
    { size: 8, gapAfter: 10 },
  )

  // ── IMPORTANT INFORMATION ──
  heading("Rentee: Important Information")

  drawText("Damage to Vehicle", { size: 10, font: bold, gapAfter: 2 })
  drawText(
    "You are responsible for any loss or damage to the vehicle during the " +
      "rental, even if it is not your fault, subject to the exceptions set " +
      "out below. The minimum amount payable is the Insurance Access Fee " +
      "stated above, plus any loss of rental income during the vehicle's " +
      "repair period, per incident.",
    { size: 8, gapAfter: 8 },
  )

  drawText("Prohibited Use", { size: 10, font: bold, gapAfter: 2 })
  drawText(
    "Prohibited Use includes: driving recklessly or under the influence; " +
      "driving on unsealed roads or failing to safeguard the vehicle; " +
      "unauthorised drivers; using the vehicle for hire or reward (e.g. " +
      "rideshare) without written consent; subletting or selling the " +
      "vehicle; racing or track use; driving through floodwater or a " +
      "natural disaster that could reasonably be avoided; driving outside " +
      "a 100km radius of Brisbane without the Owner's permission. If loss " +
      "or damage results from a Prohibited Use, the Insurance Access Fee " +
      "cap does not apply and the Rentee is responsible for the full value " +
      "of the vehicle and any third-party property damage.",
    { size: 8, gapAfter: 8 },
  )

  drawText("Personal Possessions", { size: 10, font: bold, gapAfter: 2 })
  drawText(
    "The Owner is not responsible for any loss or damage to the Rentee's " +
      "or passengers' personal possessions left in the vehicle.",
    { size: 8, gapAfter: 8 },
  )

  drawText("Roadside Assistance", { size: 10, font: bold, gapAfter: 2 })
  drawText(
    "Provided for breakdowns that are not your fault. If assistance is " +
      "needed for an issue that is your fault (e.g. flat battery, lost " +
      "keys, punctured tyre), the Rentee is responsible for that cost.",
    { size: 8, gapAfter: 8 },
  )

  heading("What Is Included")
  drawText(
    "Service & maintenance; comprehensive insurance (subject to the " +
      "Insurance Access Fee); roadside assistance for faults not the " +
      "Rentee's fault; unlimited kilometres under normal use; full tank of " +
      "fuel at pickup (if not returned full, refuelling is charged per the " +
      "Fees table below).",
    { size: 8, gapAfter: 8 },
  )

  heading("What Is Not Included")
  drawText(
    "Unlisted/unauthorised drivers; fines, parking charges and tolls " +
      "incurred during the rental; loss of income due to breakdown that is " +
      "the Rentee's fault.",
    { size: 8, gapAfter: 8 },
  )

  // ── TERMINATION ──
  heading("Termination of Agreement")
  drawText(
    "After the minimum rental period, either party may terminate by " +
      "giving 1 week's written notice. The Owner may terminate at any time " +
      "with 24 hours' notice if rent/fees are overdue, if the Owner " +
      "reasonably believes the Rentee has breached or is likely to breach " +
      "this agreement, or if there are reasonable grounds to believe the " +
      "vehicle is being used for a Prohibited Use or is being abused. " +
      "Clauses relating to Liability for Damage and Loss survive " +
      "termination.",
    { size: 8, gapAfter: 10 },
  )

  // ── EXCESS LIABILITY ──
  heading("Excess Liability — Fault and Non-Fault Accidents")
  drawText(
    "If you are AT FAULT, you are responsible for the full Insurance " +
      "Access Fee plus any loss of rental income during repair. If you are " +
      "NOT AT FAULT, you must provide sufficient third-party information " +
      "(name, licence, registration, photos/video, and an admission of " +
      "fault). If this is not provided or insufficient, the Rentee remains " +
      "responsible for the Insurance Access Fee regardless of fault.",
    { size: 8, gapAfter: 10 },
  )

  // ── FEES TABLE ──
  heading("Charges Explained")
  const fees: [string, string][] = [
    ["Unpaid Toll Notice", "$5 + toll amount"],
    ["Infringement Nomination", "$10 + fine amount"],
    ["Late Payment Fee", "22% of amount owing (after 3 days overdue)"],
    ["Refuelling Price", "$2.50 per litre"],
    ["Key Replacement", "$400 per key"],
    ["Early Return Fee", "$400"],
    ["Damage Assessment Admin Fee", "$20"],
    ["Age Excess (21–25)", "$500–$1,000"],
    ["Inexperienced Driver Fee", "$695 (licence held < 2 years)"],
  ]
  fees.forEach(([label, fee]) => row(label + ":", fee))

  y -= 6
  drawText(
    "Drivers must be aged 21–75, hold a current valid licence (not a " +
      "learner's permit); international licences require a certified " +
      "English translation. Only a driver nominated in writing by the " +
      "Owner may drive the vehicle.",
    { size: 8, gapAfter: 10 },
  )

  // ── RETURN & REPOSSESSION ──
  heading("Return")
  drawText(
    "The vehicle must be returned to the agreed location on the date/time " +
      "stated, or as otherwise agreed. Late return starts a new rental " +
      "period at the standard weekly rate. All personal belongings must be " +
      "removed on return.",
    { size: 8, gapAfter: 8 },
  )

  heading("Repossession")
  drawText(
    "If the Rentee fails to return the vehicle when required (other than " +
      "due to theft or accident), the Owner will issue a written demand. " +
      "If not returned within 24 hours, the Owner may take reasonable " +
      "steps to recover the vehicle. The Rentee remains liable for all " +
      "rental charges, damage, towing, storage, loss of rental income, and " +
      "repossession costs.",
    { size: 8, gapAfter: 10 },
  )

  drawText(
    "By signing below, both parties acknowledge and agree to the terms of " +
      "this Vehicle Lease Agreement.",
    { size: 9, font: bold, gapAfter: 20 },
  )

  // ── SIGNATURES ──
  newPageIfNeeded(120)
  drawText("Owner — Pak Oz Solutions Pty Ltd", {
    size: 10,
    font: bold,
    gapAfter: 30,
  })

  if (data.signatureImageBytes) {
    heading("Rentee — " + data.renterName)
    const sigImage = await pdfDoc.embedPng(data.signatureImageBytes)
    const sigDims = sigImage.scale(0.3)
    newPageIfNeeded(sigDims.height + 20)
    page.drawImage(sigImage, {
      x: margin,
      y: y - sigDims.height,
      width: sigDims.width,
      height: sigDims.height,
    })
    y -= sigDims.height + 6
    drawText(`Signed electronically on ${data.signedAt || ""}`, {
      size: 8,
      gapAfter: 10,
    })
  } else {
    heading("Rentee — " + data.renterName)
    drawText("Date: ______________", { size: 10, gapAfter: 20 })
  }

  drawText(
    "Pak Oz Rentals • 0424 948 512 / +61 480 488 080 • pakozsolutions.com.au",
    { size: 8, color: [0.5, 0.5, 0.5] },
  )

  return pdfDoc.save()
}
