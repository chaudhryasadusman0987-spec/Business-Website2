// ============================================================
//  CAR RENTAL LANDING PAGES — copy for /services/car-rental/rideshare,
//  /services/car-rental/long-term and the suburb pages
//  /services/car-rental/[suburb].
//
//  Facts here must match /rental-terms (src/app/rental-terms/page.tsx) and
//  src/lib/rental-terms.ts. Prices are NOT written here: the pages read the
//  live weekly range from the fleet (src/lib/fleet-summary.ts).
//
//  Keep each suburb intro genuinely specific. Near-duplicate location pages
//  read as doorway pages to Google and hurt rankings.
//  Business names and contact details come from src/data/site.ts.
// ============================================================

import { RENTAL_BRAND, RENTAL_LOCALITY } from "@/data/site"

export interface RentalFaq {
  q: string
  a: string
}

export interface RentalSection {
  heading: string
  body: string[]
}

/** Same spec sheet as the hub, so every page states the terms identically. */
export const RENTAL_SPEC: { label: string; value: string }[] = [
  { label: "Payment", value: "Weekly, in advance" },
  { label: "Minimum term", value: "4 weeks, then week to week" },
  { label: "Security bond", value: "Refunded at the end" },
  { label: "Insurance excess", value: "$1,300 AUD" },
  { label: "Roadside assistance", value: "Included" },
  { label: "Servicing & maintenance", value: "Included" },
]

/** Driver eligibility, from /rental-terms. */
export const DRIVER_REQUIREMENTS: string[] = [
  "Aged 21 to 75 on the day you collect the car.",
  "A current, valid driver licence. Learner permits are not accepted.",
  "Overseas licences are accepted with a certified English translation.",
  "Licence held for less than 2 years: an inexperienced driver fee of $695 applies.",
  "Drivers aged 21–25: an age excess of $500–$1,000 applies on top of the standard excess.",
  "Only drivers named in writing on the agreement may drive the car.",
]

export const HOW_TO_START: { title: string; body: string }[] = [
  {
    title: "Pick a car",
    body: "Open the fleet, choose a car and press Get on Rent. The form asks for your licence details and a photo of your licence.",
  },
  {
    title: "We call you",
    body: "We ring to confirm the car, your start date and how you'll use it. Tell us on this call if you plan to drive rideshare.",
  },
  {
    title: "Bond and first week",
    body: "Sign the agreement online and pay the refundable bond plus the first week's rent, by card, direct debit or bank transfer.",
  },
  {
    title: "Collect and drive",
    body: `Pick the car up from our yard in ${RENTAL_LOCALITY} with a full tank. Rent then comes out weekly until you return it.`,
  },
]

// ── Rideshare ────────────────────────────────────────────────

export const rideshareFaqs: RentalFaq[] = [
  {
    q: "Can I use a rental car for Uber in Brisbane?",
    a: `Yes, if rideshare use is approved in writing on your agreement. Our terms list hire-or-reward use without written consent as prohibited use, so tell us you plan to drive Uber or DiDi when you apply and we confirm it on the agreement for the car you pick.`,
  },
  {
    q: "Can I drive for both Uber and DiDi in the same car?",
    a: "Yes. Once rideshare use is approved on your agreement it covers the car, not a single app. Many Brisbane drivers run both apps to cut down on waiting time between trips.",
  },
  {
    q: "What do I need to rent a car for rideshare?",
    a: "You must be 21 to 75 with a current licence (not a learner permit). Overseas licences need a certified English translation. On top of that you need to meet Uber's or DiDi's own driver checks and the Queensland booked hire rules, which you apply for separately.",
  },
  {
    q: "Is there a kilometre limit?",
    a: "No. Kilometres are unlimited under normal use, which matters when you are driving full shifts. The car does need to stay within 100 km of Brisbane unless we have agreed otherwise in writing.",
  },
  {
    q: "Who pays for fuel, tolls and fines?",
    a: "You do. The car comes with a full tank and should go back full. Tolls and fines incurred during the rental are passed on to you, plus a $5 admin fee per unpaid toll notice and $10 per infringement nomination.",
  },
  {
    q: "What happens if the car breaks down while I'm working?",
    a: "Roadside assistance is included for breakdowns that are not your fault, and servicing and maintenance are on us. Issues caused by the driver, such as a flat battery, lost keys or a punctured tyre, are charged to you.",
  },
  {
    q: "How quickly can I start driving?",
    a: "Usually within the same week. Apply for a car online, we call to confirm the details, and once the agreement is signed and the bond and first week are paid you collect the car from the yard.",
  },
]

// ── Long-term ────────────────────────────────────────────────

export const longTermFaqs: RentalFaq[] = [
  {
    q: "What is the minimum rental period?",
    a: "Four weeks. After that the rental rolls on week to week until either side gives one week's written notice, so you can keep the car for a month or for a year.",
  },
  {
    q: "What if I return the car before four weeks?",
    a: "Half of the remaining rent up to the four-week mark is still payable, unless we agree otherwise in writing. After the first four weeks you only need to give one week's notice.",
  },
  {
    q: "What does the weekly price include?",
    a: "Servicing and maintenance, comprehensive insurance (subject to the $1,300 insurance excess), roadside assistance for faults that are not yours, unlimited kilometres under normal use and a full tank at pickup.",
  },
  {
    q: "What is not included?",
    a: "Fuel after the first tank, tolls, fines and parking charges, and any driver who is not named on the agreement.",
  },
  {
    q: "How much is the bond?",
    a: "It depends on the car and is shown on each car in the fleet. The bond is refunded at the end of the rental, less any unpaid rent, tolls, fines or damage.",
  },
  {
    q: "How do I pay each week?",
    a: "Rent is charged weekly in advance. You can pay by card or direct debit, which charges automatically on the same weekday each week, or by bank transfer.",
  },
  {
    q: "Can I swap to a different car?",
    a: "Ask us. If another car on the yard suits you better we can move you across, subject to availability and the rate for that car.",
  },
]

// ── Suburbs ──────────────────────────────────────────────────

export interface RentalSuburb {
  slug: string
  name: string
  /** <title>, under 60 characters. */
  title: string
  /** Meta description, under 155 characters. */
  metaDescription: string
  /** First paragraph. Must contain "car rental <name>". */
  intro: string
  sections: RentalSection[]
  /** Google Maps search used for the embedded map. */
  mapQuery: string
  /** Suburbs around this one, shown as chips. */
  nearby: string[]
  /** Other suburb pages to link to, closest first. */
  nearbyPages: string[]
  faqs: RentalFaq[]
}

export const rentalSuburbs: RentalSuburb[] = [
  {
    slug: "sunnybank",
    name: "Sunnybank",
    title: `Car Rental Sunnybank | Weekly Hire | ${RENTAL_BRAND}`,
    metaDescription:
      "Car rental Sunnybank, by the week: pick up minutes away in Sunnybank Hills. 4-week minimum, servicing and roadside included. Rideshare OK on request.",
    intro:
      `Looking for car rental in Sunnybank that doesn't mean a trip to the airport counters? Our yard is in ${RENTAL_LOCALITY}, a few minutes up the road, so most Sunnybank customers can collect a car the same week they apply and be home before the school run.`,
    sections: [
      {
        heading: "Weekly car hire on Sunnybank's doorstep",
        body: [
          "Sunnybank is a busy place to live without a car. The dining strips along Mains Road and McCullough Street, Sunnybank Plaza and Market Square all draw traffic from right across the southside, and buses don't always line up with shift work or a late finish. A weekly rental gives you a car of your own without the cost of buying one.",
          "We rent by the week with a four-week minimum, then week to week. That suits people who have just arrived in Brisbane, students at the nearby Griffith Nathan campus, families waiting on a car to come back from the panel beater, and anyone who wants a few months of driving before deciding what to buy.",
        ],
      },
      {
        heading: "Built for driving across the southside",
        body: [
          "From Sunnybank you're close to the Pacific Motorway, the Gateway and Logan Road, so trips to the CBD, the airport or the Gold Coast are straightforward. Kilometres are unlimited under normal use and the car stays yours for the whole rental, so there's no handing it back each evening.",
          "Every car comes serviced, insured (subject to the $1,300 excess) and covered by roadside assistance. You put fuel in it and drive. Tolls and fines are yours, and the car needs to stay within 100 km of Brisbane unless we agree otherwise.",
        ],
      },
      {
        heading: "Rideshare from Sunnybank",
        body: [
          "Plenty of our Sunnybank drivers work Uber or DiDi. The area's restaurants and shopping centres keep demand steady into the evening, and the motorways make airport runs quick. Rideshare use has to be approved in writing on your agreement, so mention it when you apply.",
        ],
      },
    ],
    mapQuery: "Sunnybank QLD 4109",
    nearby: ["Sunnybank Hills", "Runcorn", "Robertson", "Macgregor", "Eight Mile Plains", "Coopers Plains", "Kuraby", "Calamvale"],
    nearbyPages: ["calamvale", "logan"],
    faqs: [
      {
        q: "Where do I pick up a rental car near Sunnybank?",
        a: `From our yard in ${RENTAL_LOCALITY}, a few minutes from Sunnybank. We confirm the exact pickup time and address when we call you after you apply.`,
      },
      {
        q: "How soon can I get a car in Sunnybank?",
        a: "Usually within the same week. Apply for a car online, we call to confirm, and once the agreement is signed and the bond and first week are paid, the car is ready to collect.",
      },
      {
        q: "Can international students in Sunnybank rent a car?",
        a: "Yes, if you are 21 to 75 and hold a current licence. Overseas licences need a certified English translation, and a $695 inexperienced driver fee applies if you have held your licence for under two years.",
      },
      {
        q: "Do you deliver cars to Sunnybank?",
        a: "Cars are collected from the yard. Since it is so close to Sunnybank, most customers find that quicker than waiting for a delivery.",
      },
    ],
  },
  {
    slug: "calamvale",
    name: "Calamvale",
    title: `Car Rental Calamvale | Weekly Hire | ${RENTAL_BRAND}`,
    metaDescription:
      "Car rental Calamvale: weekly hire from our yard next door in Sunnybank Hills. 4-week minimum, unlimited km, servicing and roadside assistance included.",
    intro:
      `Car rental in Calamvale is easy when the yard is next door: we're based in ${RENTAL_LOCALITY}, which borders Calamvale, so you can collect your car close to home instead of heading into the city or out to the airport.`,
    sections: [
      {
        heading: "A car for life in Calamvale",
        body: [
          "Calamvale is family territory: big estates, schools, and Calamvale Central or Sunnybank Hills Shoppingtown for the weekly shop. It's a suburb that assumes you drive. If the family car is off the road, you've just moved in, or a second car would make the school and work runs easier, a weekly rental fills the gap without a loan or a dealership.",
          "You rent by the week with a four-week minimum. After that it's week to week with a week's notice, so you can keep the car for as long as you need it and hand it back when you don't.",
        ],
      },
      {
        heading: "Getting around from Calamvale",
        body: [
          "Compton Road and Beaudesert Road connect Calamvale to the Logan Motorway and the Pacific Motorway, so Brisbane's southside, Logan and the Gold Coast are all within easy reach. Kilometres are unlimited under normal use, and servicing, maintenance and roadside assistance are included.",
          "The weekly price covers insurance, subject to a $1,300 excess. Fuel, tolls and fines are your responsibility. The Logan Motorway is tolled, so check your toll account if you use it often.",
        ],
      },
      {
        heading: "Driving rideshare in Calamvale",
        body: [
          "Calamvale sits between the southside and Logan, a good base for Uber or DiDi work in both directions. If you plan to drive rideshare, tell us when you apply so it can be approved in writing on your agreement.",
        ],
      },
    ],
    mapQuery: "Calamvale QLD 4116",
    nearby: ["Sunnybank Hills", "Stretton", "Drewvale", "Parkinson", "Algester", "Karawatha", "Kuraby", "Browns Plains"],
    nearbyPages: ["sunnybank", "logan"],
    faqs: [
      {
        q: "How far is the pickup point from Calamvale?",
        a: `Our yard is in ${RENTAL_LOCALITY}, the suburb next to Calamvale, so pickup is a short drive or rideshare trip. We confirm the exact address and time when we call you.`,
      },
      {
        q: "Can I rent a car in Calamvale for just a month?",
        a: "Yes. The minimum is four weeks, and after that you can return the car with one week's written notice. It works well while your own car is being repaired.",
      },
      {
        q: "Are tolls included if I use the Logan Motorway?",
        a: "No. Tolls incurred during the rental are passed on to you, with a $5 admin fee per unpaid toll notice.",
      },
      {
        q: "What do I need to rent a car in Calamvale?",
        a: "You need to be 21 to 75 with a current licence (not a learner permit). Overseas licences need a certified English translation. You pay a refundable bond and the first week up front.",
      },
    ],
  },
  {
    slug: "logan",
    name: "Logan",
    title: `Car Rental Logan | Weekly Hire | ${RENTAL_BRAND}`,
    metaDescription:
      "Car rental Logan, by the week: collect from Sunnybank Hills, just north of Logan. 4-week minimum, unlimited km, servicing and roadside included.",
    intro:
      `Need car rental in Logan without the short-hire prices? We rent by the week from our yard in ${RENTAL_LOCALITY}, just north of the Logan city boundary, so drivers from Springwood, Woodridge, Browns Plains and Logan Central can pick up close to home.`,
    sections: [
      {
        heading: "Weekly hire for a city built around the car",
        body: [
          "Logan covers a lot of ground, from Springwood and Daisy Hill in the north-east to Browns Plains in the west and Beenleigh down south. Public transport works for some trips, but getting to a job in Yatala, a shift at Logan Hospital or a site across town usually means driving. A weekly rental gives you that car without buying one.",
          "The rental runs for a minimum of four weeks, then week to week with a week's notice. That makes it a practical option while you're between cars, waiting on an insurance claim, or saving up to buy something of your own.",
        ],
      },
      {
        heading: "Motorways, tolls and kilometres",
        body: [
          "Logan sits between the Pacific Motorway (M1) and the Logan Motorway, so the CBD, the Gold Coast and the airport are all in range. Kilometres are unlimited under normal use, and servicing, maintenance and roadside assistance for faults that aren't yours are included in the weekly price.",
          "The Logan Motorway is tolled, and tolls during the rental are passed on to you, so a toll account in your name keeps things simple. The car needs to stay within 100 km of Brisbane, which covers the Gold Coast, unless we agree otherwise in writing.",
        ],
      },
      {
        heading: "Rideshare work across Logan",
        body: [
          "Logan's size makes it good ground for Uber and DiDi: shopping centres such as the Logan Hyperdome and Grand Plaza, the hospital, and steady trips to and from Brisbane. If you plan to drive rideshare, tell us when you apply so it can be approved on your agreement.",
        ],
      },
    ],
    mapQuery: "Logan City QLD",
    nearby: ["Springwood", "Woodridge", "Logan Central", "Kingston", "Slacks Creek", "Underwood", "Daisy Hill", "Browns Plains", "Marsden", "Meadowbrook"],
    nearbyPages: ["calamvale", "sunnybank"],
    faqs: [
      {
        q: "Where do Logan customers pick up the car?",
        a: `From our yard in ${RENTAL_LOCALITY}, just north of Logan. It's a short drive from Underwood, Springwood and Browns Plains. We confirm the address and time when we call.`,
      },
      {
        q: "Can I drive a Logan rental to the Gold Coast?",
        a: "Yes. The Gold Coast is inside the 100 km radius of Brisbane that the rental allows. Trips further than that need our written permission first.",
      },
      {
        q: "Is weekly car rental in Logan cheaper than daily hire?",
        a: "For anything longer than a few weeks, usually yes. Weekly rates on a four-week minimum come in well under most daily hire prices, and servicing and roadside assistance are included.",
      },
      {
        q: "Who pays the Logan Motorway tolls?",
        a: "You do. Tolls incurred during the rental are passed on to you, with a $5 admin fee per unpaid toll notice, so it's worth linking the car to your own toll account.",
      },
    ],
  },
]

export function getRentalSuburb(slug: string): RentalSuburb | undefined {
  return rentalSuburbs.find((s) => s.slug === slug)
}
