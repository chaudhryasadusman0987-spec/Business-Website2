// ============================================================
//  CHANGE BUSINESS NAME HERE — updates the entire website
//  Also change domain when you have it
// ============================================================
export const SITE_NAME        = "Pak Oz";                     // ← change this
export const SITE_SUFFIX      = "Solutions";                  // ← optional second word
export const SITE_FULL        = `${SITE_NAME} ${SITE_SUFFIX}`; // used everywhere → "Pak Oz Solutions"
export const SITE_TAGLINE     = "Better Solutions, Better Living.";
export const SITE_DOMAIN      = "https://pakozsolutions.com.au";
export const SITE_EMAIL       = "info@pakozsolutions.com.au";
export const SITE_PHONE       = "+61 424 948 512";
export const SITE_ADDRESS     = "Brisbane & Southeast QLD";
// Temporary until the ATO issues the company ABN. The footer renders any value
// containing "Pending" in muted italics so it reads as a placeholder, not a
// real registration number.
export const SITE_ABN         = "ABN: Pending registration";
export const SITE_HOURS       = "Mon–Fri 8am–6pm, Sat 9am–3pm";
export const SITE_COMPANY     = "PAK OZ SOLUTIONS PTY LTD";
export const SITE_ACN         = "ACN: 700 444 695";
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
export const BANK_ACCOUNT_NAME = "Pak Oz Solutions Pty Ltd";
export const BANK_BSB          = "034-076";
export const BANK_ACCOUNT      = "841442";
export const BANK_PAYID        = "0424948512";
export const BANK_PAYID_TYPE   = "Australian Mobile Number";

// ============================================================
//  SECURITY SUB-BRAND — used ONLY under /services/security-solutions
//  and in the security quote email. Everything else on the site keeps
//  SITE_FULL ("Pak Oz Solutions"). SITE_COMPANY stays the legal entity.
// ============================================================
export const SECURITY_BRAND   = "Pak Oz CCTV";
export const SECURITY_TAGLINE = "Professional CCTV & Security Installation Brisbane";

// ============================================================
//  IT SUB-BRAND — used ONLY on the IT landing page, its project
//  brief form and the emails that form sends. Navigation, the footer
//  and the About page stay SITE_FULL ("Pak Oz Solutions"), which is
//  the parent company. Mirrors SECURITY_BRAND above.
// ============================================================
export const IT_BRAND         = "Pak Oz Technologies";
