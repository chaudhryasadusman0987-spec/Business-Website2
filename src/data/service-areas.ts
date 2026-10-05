// ============================================================
//  SECURITY SERVICE AREAS — one landing page per area at
//  /services/security-solutions/areas/[slug].
//  Keep each intro / FAQ genuinely specific to the area: near-duplicate
//  location pages are treated as doorway pages by Google and hurt rankings.
//  Don't add claims (job counts, response times) the business can't back up.
// ============================================================

export interface ServiceArea {
  slug: string
  name: string
  /** Used in titles: "CCTV Installation <headline>" */
  headline: string
  metaDescription: string
  intro: string[]
  suburbs: string[]
  /** What properties in this area typically need — rendered as cards. */
  focus: { title: string; body: string }[]
  faqs: { q: string; a: string }[]
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "brisbane-southside",
    name: "Brisbane Southside",
    headline: "Brisbane Southside",
    metaDescription:
      "CCTV and security camera installation across Brisbane's southside — Sunnybank, Mount Gravatt, Carindale, Annerley and surrounds. Free site assessment and quote.",
    intro: [
      "Brisbane's southside is our home patch. From the older Queenslanders of Annerley, Tarragindi and Greenslopes to the newer estates around Calamvale, Parkinson and Stretton, we install CCTV, alarms and access control for homes, rentals and small businesses.",
      "Every install starts with a site assessment, so camera positions are planned around how your property is actually approached — driveways, side gates, rear lanes and shopfronts — rather than a one-size kit.",
    ],
    suburbs: [
      "Sunnybank", "Sunnybank Hills", "Runcorn", "Calamvale", "Parkinson",
      "Algester", "Stretton", "Eight Mile Plains", "Mount Gravatt", "Mansfield",
      "Wishart", "Carindale", "Macgregor", "Holland Park", "Tarragindi",
      "Annerley", "Greenslopes", "Yeronga", "Moorooka", "Salisbury",
      "Acacia Ridge", "Coopers Plains", "Nathan", "Woolloongabba",
      "South Brisbane", "West End", "Highgate Hill",
    ],
    focus: [
      {
        title: "Older homes, tidy cabling",
        body: "Timber Queenslanders and post-war homes need cable runs planned through roof spaces and under-floor areas so the install stays neat and doesn't damage original features.",
      },
      {
        title: "Shopfronts & food strips",
        body: "Retail and hospitality along the southside's shopping strips benefit from clear coverage of counters, entries and rear deliveries, with remote phone viewing for owners.",
      },
      {
        title: "Townhouses & units",
        body: "Compact layouts call for fewer, better-placed cameras and video intercoms that work with shared driveways and body-corporate rules.",
      },
    ],
    faqs: [
      {
        q: "Do you install CCTV in rental properties on the southside?",
        a: "Yes. We regularly quote for landlords and tenants. For rentals we recommend wireless or minimally invasive options, and the property owner should approve any fixed installation first.",
      },
      {
        q: "Can I view my cameras on my phone?",
        a: "Yes. Every system we install can be set up for live and recorded viewing on iPhone and Android, and we configure it with you on the day.",
      },
    ],
  },
  {
    slug: "logan",
    name: "Logan",
    headline: "Logan",
    metaDescription:
      "CCTV, alarm and access control installation in Logan — Springwood, Loganholme, Browns Plains, Beenleigh and surrounds. Licensed installers, free quotes.",
    intro: [
      "We install security cameras and alarm systems right across Logan City, from Springwood and Rochedale through to Loganholme, Browns Plains and Beenleigh.",
      "Logan has a big mix of family homes on larger blocks, acreage on the fringes and busy light-industrial areas, so we design each system around the property — not a pre-packaged kit.",
    ],
    suburbs: [
      "Springwood", "Rochedale", "Logan Central", "Loganholme", "Shailer Park",
      "Daisy Hill", "Slacks Creek", "Underwood", "Browns Plains", "Marsden",
      "Beenleigh", "Waterford", "Meadowbrook", "Kingston",
    ],
    focus: [
      {
        title: "Larger blocks & long driveways",
        body: "Wider frontages and long driveways need cameras with the range and night-vision to identify vehicles and faces at the gate, not just at the front door.",
      },
      {
        title: "Sheds, workshops & vehicles",
        body: "Detached sheds, trailers and work vehicles are common targets. We cover them with dedicated cameras and motion alerts to your phone.",
      },
      {
        title: "Light industrial & trade sites",
        body: "Warehouses and yards benefit from perimeter coverage, after-hours alerts and access control on staff entries.",
      },
    ],
    faqs: [
      {
        q: "Can you cover a shed or workshop away from the house?",
        a: "Yes. Depending on distance we run a cable or use a wireless bridge so a detached shed or workshop records to the same system as the house.",
      },
      {
        q: "Do you install for businesses in Logan as well as homes?",
        a: "Yes — we quote for shops, offices, warehouses and trade yards, including access control and multi-camera systems.",
      },
    ],
  },
  {
    slug: "gold-coast",
    name: "Gold Coast",
    headline: "Gold Coast",
    metaDescription:
      "Security camera and CCTV installation on the Gold Coast for homes, holiday rentals and businesses. Free site assessment and quote from licensed installers.",
    intro: [
      "We travel down the M1 to install CCTV, alarms and video intercoms for Gold Coast homes, holiday properties and businesses.",
      "Coastal conditions are hard on outdoor equipment, so we spec weather-rated cameras and housings suited to salt air, humidity and summer storms.",
    ],
    suburbs: [
      "Coomera", "Helensvale", "Oxenford", "Pimpama", "Southport",
      "Nerang", "Robina", "Varsity Lakes", "Burleigh Heads", "Surfers Paradise",
    ],
    focus: [
      {
        title: "Weather-rated equipment",
        body: "Salt air and humidity shorten the life of cheap outdoor gear. We use IP-rated cameras and protected connections built for coastal exposure.",
      },
      {
        title: "Holiday & short-stay rentals",
        body: "Remote viewing and entry cameras help owners keep an eye on a property they don't live in, while keeping guest-privacy areas clear of cameras.",
      },
      {
        title: "New estates in the northern corridor",
        body: "Fast-growing suburbs like Coomera and Pimpama often have new builds that are easiest to pre-wire before landscaping and fit-out are finished.",
      },
    ],
    faqs: [
      {
        q: "Is there an extra travel charge for the Gold Coast?",
        a: "Any travel cost is included in your written quote up front, so there are no surprises on the day.",
      },
      {
        q: "Can I put cameras on a holiday rental?",
        a: "Yes, for external areas and entries. Cameras must not cover bedrooms, bathrooms or other private areas, and guests should be told they are there.",
      },
    ],
  },
  {
    slug: "ipswich",
    name: "Ipswich",
    headline: "Ipswich",
    metaDescription:
      "CCTV and security system installation in Ipswich — Springfield, Redbank Plains, Goodna, Ripley and surrounds. Licensed installers and free quotes.",
    intro: [
      "We install CCTV, alarms and access control across the Ipswich region, including the growing Springfield and Ripley Valley areas.",
      "Ipswich ranges from heritage homes in the older suburbs to brand-new estates and acreage, and we tailor each system to suit.",
    ],
    suburbs: [
      "Springfield", "Springfield Lakes", "Augustine Heights", "Redbank Plains",
      "Goodna", "Bellbird Park", "Ripley", "Brassall", "Raceview",
      "Ipswich Central",
    ],
    focus: [
      {
        title: "New builds & estates",
        body: "Booking in during or soon after construction makes it simpler to hide cabling and place cameras exactly where they're needed.",
      },
      {
        title: "Acreage & rural-residential",
        body: "Bigger properties need long-range cameras, gate coverage and sometimes wireless links to outbuildings.",
      },
      {
        title: "Small business & retail",
        body: "Shopping centres and local strips benefit from counter, entry and stockroom coverage with remote viewing for owners.",
      },
    ],
    faqs: [
      {
        q: "Can you pre-wire a new home for CCTV?",
        a: "Yes. Pre-wiring before plaster and fit-out are finished gives the cleanest result. Contact us with your build stage and we'll plan around it.",
      },
      {
        q: "Do you cover acreage properties?",
        a: "Yes. We use long-range and wireless options to cover gates, driveways and sheds on larger blocks.",
      },
    ],
  },
  {
    slug: "redlands",
    name: "Redlands",
    headline: "Redlands",
    metaDescription:
      "CCTV, alarm and intercom installation in the Redlands — Capalaba, Cleveland, Victoria Point, Alexandra Hills and surrounds. Free site assessment and quote.",
    intro: [
      "We install security cameras, alarms and video intercoms across Redland City, from Capalaba and Alexandra Hills to Cleveland, Wellington Point and Victoria Point.",
      "Many Redlands homes sit on generous, leafy blocks close to the bay, so camera placement and weather protection both get extra attention.",
    ],
    suburbs: [
      "Capalaba", "Alexandra Hills", "Birkdale", "Wellington Point",
      "Ormiston", "Cleveland", "Thornlands", "Victoria Point", "Redland Bay",
      "Sheldon",
    ],
    focus: [
      {
        title: "Leafy, larger blocks",
        body: "Trees and landscaping can block views and trigger false alerts, so we position cameras and tune motion detection to suit the garden.",
      },
      {
        title: "Bay-side weather",
        body: "Proximity to Moreton Bay means salt and wind exposure — we use weather-rated cameras and sealed connections outdoors.",
      },
      {
        title: "Gates & intercoms",
        body: "Video intercoms with phone answering let you see and speak to visitors at the gate, whether you're home or not.",
      },
    ],
    faqs: [
      {
        q: "Can I answer my front-gate intercom from my phone?",
        a: "Yes. The video intercoms we install can ring your phone, so you can see and talk to visitors from anywhere.",
      },
      {
        q: "Will trees set off motion alerts?",
        a: "We tune detection zones and use person and vehicle detection where available to cut down on false alerts from moving foliage.",
      },
    ],
  },
]

export function getServiceArea(slug: string): ServiceArea | undefined {
  return serviceAreas.find((a) => a.slug === slug)
}
