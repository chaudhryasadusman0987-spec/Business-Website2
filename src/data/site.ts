// ============================================================
//  CHANGE BUSINESS NAME HERE — updates the entire website
//  Also change domain when you have it
// ============================================================
export const SITE_NAME        = "Pak Oz";                     // ← change this
export const SITE_SUFFIX      = "Solutions";                  // ← optional second word
export const SITE_FULL        = `${SITE_NAME} ${SITE_SUFFIX}`; // used everywhere → "Pak Oz Solutions"
export const SITE_TAGLINE     = "Better Solutions, Better Living.";
// www is the canonical host — canonicals, sitemap, robots and JSON-LD all
// derive from this. Keep the bare domain redirecting to it in Vercel.
export const SITE_DOMAIN      = "https://www.pakozsolutions.com.au";
export const SITE_EMAIL       = "info@pakozsolutions.com.au";
export const SITE_PHONE       = "+61 424 948 512";
export const SITE_ADDRESS     = "Brisbane & Southeast QLD";
export const SITE_HOURS       = "Mon–Fri 8am–6pm, Sat 9am–3pm";
// Machine-readable version of SITE_HOURS for schema.org JSON-LD. Change both
// together.
export const SITE_OPENING_HOURS: { days: string[]; opens: string; closes: string }[] = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
  { days: ["Saturday"], opens: "09:00", closes: "15:00" },
];
// ============================================================
//  LEGAL ENTITY — official ASIC details. Every page, email, PDF and
//  JSON-LD block that names the company reads these; never hardcode them.
// ============================================================
export const COMPANY_LEGAL_NAME = "Pak Oz Solutions Pty Ltd";
export const COMPANY_ACN        = "700 444 695";
export const COMPANY_ABN        = "53 700 444 695";
// Registered office locality only — no street address.
export const COMPANY_OFFICE_LOCALITY = "Sunnybank Hills QLD 4109";
// "Pak Oz Solutions Pty Ltd, ABN 53 700 444 695" — the line for emails and PDFs.
export const COMPANY_LEGAL_LINE = `${COMPANY_LEGAL_NAME}, ABN ${COMPANY_ABN}`;
// Security installer credential shown in trust strips. Replace with your real
// number when available, e.g. "Queensland Security Licence: 1234567".
export const SITE_SECURITY_LICENCE = "Licensed & Insured Installers";

// Fallback "find us on Google" link, used until the Google Business Profile is
// verified. Once NEXT_PUBLIC_GOOGLE_PLACE_ID is set, the review buttons switch
// to the direct write-a-review form instead of this search page.
export const SITE_GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=Pak+Oz+Solutions+Brisbane+review";

// ============================================================
//  BANK DETAILS — shown on the car rental payment step and repeated
//  in both confirmation emails. Change here and every surface follows.
// ============================================================
export const BANK_NAME         = "Westpac";
export const BANK_ACCOUNT_NAME = COMPANY_LEGAL_NAME;
export const BANK_BSB          = "034-076";
export const BANK_ACCOUNT      = "841442";
// The PayID is the company ABN, without spaces.
export const BANK_PAYID        = COMPANY_ABN.replace(/\s/g, "");
export const BANK_PAYID_TYPE   = "ABN (Australian Business Number)";

// ============================================================
//  SECURITY SUB-BRAND — used ONLY under /services/security-solutions
//  and in the security quote email. Everything else on the site keeps
//  SITE_FULL ("Pak Oz Solutions"). COMPANY_LEGAL_NAME stays the legal entity.
// ============================================================
export const SECURITY_BRAND   = "Pak Oz CCTV";
export const SECURITY_TAGLINE = "Professional CCTV & Security Installation Brisbane";

// ============================================================
//  CAR RENTAL SUB-BRAND — used under /services/car-rental, its blog posts
//  and the AutoRental JSON-LD. The yard is in Sunnybank Hills; only the
//  suburb is published in structured data (no street address).
// ============================================================
export const RENTAL_BRAND     = "Pak Oz Rentals";
export const RENTAL_LOCALITY  = "Sunnybank Hills";
export const RENTAL_REGION    = "QLD";
export const RENTAL_POSTCODE  = "4109";

// ============================================================
//  IT SUB-BRAND — used ONLY on the IT landing page, its project
//  brief form and the emails that form sends. Navigation, the footer
//  and the About page stay SITE_FULL ("Pak Oz Solutions"), which is
//  the parent company. Mirrors SECURITY_BRAND above.
// ============================================================
export const IT_BRAND         = "Pak Oz Technologies";

// ============================================================
//  IT WHATSAPP — dedicated number for Pak Oz Technologies (IT services).
//  Used ONLY on /services/it-services/**, the footer's IT line and the
//  IT brief emails. Security and car rental keep SITE_PHONE.
// ============================================================
export const IT_WHATSAPP = "+61 494 579 116"
// Local display format ("0494 579 116"), derived so the number lives in one place.
export const IT_WHATSAPP_LOCAL = IT_WHATSAPP.replace(/^\+61\s?/, "0")
export const IT_WHATSAPP_LINK =
  "https://wa.me/" + IT_WHATSAPP.replace(/\D/g, "") + "?text=" +
  encodeURIComponent("Hi, I'm interested in Pak Oz Technologies IT services (website / app / AI automation).")
