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

// ============================================================
//  SECURITY SUB-BRAND — used ONLY under /services/security-solutions
//  and in the security quote email. Everything else on the site keeps
//  SITE_FULL ("Pak Oz Solutions"). SITE_COMPANY stays the legal entity.
// ============================================================
export const SECURITY_BRAND   = "Pak Oz CCTV";
export const SECURITY_TAGLINE = "Professional CCTV & Security Installation Brisbane";
