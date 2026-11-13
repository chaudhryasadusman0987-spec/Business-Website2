# PROJECT.md — Multi-Service Business Website

> You are my coding assistant. Read this file fully before every session.
> Never skip sections. When I give a short instruction, interpret it in
> the context of this document. Keep this file updated as decisions are made.

---

## 1. What we are building

A real production website for **Pak Oz Solutions Pty Ltd** (ACN 700 444 695),
Brisbane & Southeast QLD — live at **pakozsolutions.com.au** on Vercel.
Three service brands, each with its own ad-focused landing page:
- **Pak Oz CCTV** — Security Solutions (CCTV, alarms, access control, intercoms…)
- **Pak Oz Rentals** — car rental with online application, payment and e-signed lease
- **Pak Oz Technologies** — web development, app development, AI automation

**Status (Nov 2026) — all core sections are built and live:**
1. ✅ Home (`/`)
2. ✅ Security Solutions hub — landing, 6 solution pages, suburb area pages,
   products catalog, security packages, 5-step quote wizard (§7)
3. ✅ Car Rental — landing, fleet (Postgres), rental application, Stripe
   payments, lease agreements, chargeback protection (§8)
4. ✅ IT Services — landing, 3 detail pages, portfolio, project-brief quote
5. ✅ About, Contact, Testimonials (live Google reviews, env-gated), Blog
6. ✅ Admin dashboard (`/dashboard`) + separate `/rental-admin` (§10)
7. ✅ AI chat agent (Gemini, §9), SEO (sitemap, robots, JSON-LD, OG image)
8. 🚧 Lead finder (`/lead-finder`, own password) — on branch `lead-finder`, not yet merged

Still pending on the business side: Google Business Profile
verification (then set `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`).

---

## 2. BUSINESS NAME SYSTEM (HARD RULE — most important rule in this file)

### The business name is now "Pak Oz Solutions" — but the rule still applies.
(The example values below are the original placeholders; see `src/data/site.ts`
for the real ones, incl. COMPANY_LEGAL_NAME, COMPANY_ACN, COMPANY_ABN, bank/PayID and IT_WHATSAPP.)

The name must be changeable in EXACTLY ONE place, after which the entire
site updates — every page title, every heading, every email, every footer,
every meta tag, the AI agent greeting, the quote form header, everything.

### The ONE place to change it:

```
src/data/site.ts
```

### Exact exports in site.ts:

```ts
// ============================================================
//  CHANGE BUSINESS NAME HERE — updates the entire website
//  Also change domain when you have it
// ============================================================
export const SITE_NAME        = "AuzServ";                    // ← change this
export const SITE_SUFFIX      = "Australia";                  // ← optional second word
export const SITE_FULL        = `${SITE_NAME} ${SITE_SUFFIX}`; // used everywhere
export const SITE_TAGLINE     = "Security. Mobility. Technology.";
export const SITE_DOMAIN      = "https://auzserv.com.au";     // ← change when domain decided
export const SITE_EMAIL       = "info@auzserv.com.au";        // ← change with domain
export const SITE_PHONE       = "+61 400 000 000";            // ← real number when ready
export const SITE_ADDRESS     = "Australia Wide";
export const COMPANY_ABN        = "53 700 444 695";
export const SITE_HOURS       = "Mon–Fri 8am–6pm, Sat 9am–3pm";
```

### How changing the name works (document in README):

When business name is decided, owner runs ONE command in VS Code terminal:
```bash
# This is a helper script we will create at scripts/rename.ts
npx ts-node scripts/rename.ts "NewBusinessName" "newdomain.com.au"
```

This script updates SITE_NAME and SITE_DOMAIN in site.ts.
Because every component imports from site.ts, the entire site updates.
Then: git add . && git commit -m "Rename to NewBusinessName" && git push
Vercel redeploys automatically in ~60 seconds.

### Claude Code rules for the name:

- NEVER write "AuzServ", "SecureVision", or any business name in JSX/TSX
- NEVER write a domain URL in JSX/TSX
- ALWAYS import { SITE_FULL, SITE_NAME, SITE_EMAIL, SITE_PHONE } from "@/data/site"
- Every <title> tag: `${SITE_FULL} | Page Name`
- Every footer: reads from site.ts
- Quote form header: reads SITE_FULL (replaces "SecureVision Australia" in template)
- AI agent system prompt: built dynamically from site.ts values

---

## 3. Tech stack (do not change without asking)

- **Next.js 14** — App Router, TypeScript, `src/` directory
- **Tailwind CSS** — utility classes, brand colors in tailwind.config.ts
- **Poppins** font via next/font/google
- **Lucide React** for icons
- **Google Gemini** (`@google/generative-ai`) — AI agent, model **`gemini-2.5-flash`**
  (server-side only, env var **`GEMINI_API_KEY`**). FREE tier — this **replaced
  Anthropic/Claude**. There are no Anthropic references anywhere in the code.
- **Nodemailer** (`nodemailer`) — sending quote emails
- **React Hook Form** — all forms
- **Framer Motion** — hover transitions
- **Neon Postgres** (`@neondatabase/serverless`, `DATABASE_URL`) — products,
  packages, vehicles, site_settings (catalog), rental files/agreements/disputes.
  Always `neon(url, { fetchOptions: { cache: "no-store" } })` or reads go stale.
  Tables are created/seeded once via `/api/db/setup`.
- **Separate Neon DB** (`LEADS_URL`, table `prospects`) — lead finder only
- **Upstash Redis / Vercel KV** (`@upstash/redis`) — leads + promo discounts
- **Stripe** — card, BECS direct debit (`STRIPE_BECS_ENABLED`), subscriptions, webhook
- **pdf-lib** — signed lease agreements + dispute evidence PDFs
- Deployment: **Vercel** (serverless, read-only filesystem — never persist to files).
  Daily cron 09:00 → `/api/rental-payment/send-reminders` (`vercel.json`)
- Static content still lives in `src/data/*.ts` (services, blog, testimonials,
  service areas, portfolio, IT services)
- **Pinned versions:** Next 14.2 + Tailwind v3 — don't upgrade to Next 15/16 or Tailwind 4.

---

## 4. Design system — Zlymo style (match exactly)

Google Stitch Project ID: 1492827133636844280

### Colors
```
Primary accent:    #7f85f7   brand-primary   (purple-blue — all hovers, highlights)
Accent block:      #8187fa   brand-light     (hero right-side colored block)
Button default bg: #2d2d2c   brand-dark      (dark button background)
Button default tx: #dee4fd   brand-text      (light lavender button text)
Section bg:        #fefefd   brand-section   (off-white sections)
Card bg:           #f7f7f7   brand-card      (product/service cards)
Footer bg:         #252525   brand-footer    (dark footer)
Sidepanel bg:      #111111   brand-panel     (black slide-out nav)
Text dark:         #2f2f2f                   (headings)
Text body:         #666666                   (body)
Price color:       #7f85f7                   (same as primary)
```

### Tailwind config additions
```ts
// tailwind.config.ts
colors: {
  brand: {
    primary: "#7f85f7",
    light:   "#8187fa",
    dark:    "#2d2d2c",
    text:    "#dee4fd",
    section: "#fefefd",
    card:    "#f7f7f7",
    footer:  "#252525",
    panel:   "#111111",
  }
}
```

### Typography (Poppins)
- Section headings: 45px bold uppercase #2f2f2f
- Hero h1: 80px bold (40px on mobile)
- Body: 17px line-height 1.8
- Button text: 17px weight 500

### Key UI rules
- Nav: NO top navbar — hamburger → slide-out sidepanel (#111, full height)
- Cards: #f7f7f7 bg, border-radius 80px, centered content, large padding
- Card hover: bg fills #7f85f7, ALL text/icons → white, button inverts → white bg + dark text
- Hover transition: `ease-in 0.5s` on ALL properties (use Tailwind group/group-hover)
- Buttons default: #2d2d2c bg + #dee4fd text, border-radius 5px
- Buttons hover: #7f85f7 bg + white text
- Section spacing: 200px top padding between sections
- Container: max-width 1170px centered (1500px for wide sections)

### Stitch screens to match
- Home:       440cbdfe432c47ea972eab802a5b5d93
- CCTV:       bffc3718ddb74f6082c551a32b7f40a0
- IT Services: bb18fa27c94c4652a6772bd216c94853
- Contact:    dfb02fae12e3455697b33366eafd3983
- Car Rental: 1d6a928075a34a59a731f2ee0916f2fa
- Dashboard:  47e2f4daaefd4f51851aa58e48947d88

---

## 5. Site architecture

```
/                                          ✅ Home — all services
/services/security-solutions               ✅ Security Solutions landing (ad target)
/services/security-solutions/[slug]        ✅ Solution detail — 6 SSG pages (see §7)
/services/security-solutions/areas/[slug]  ✅ Suburb/service-area SEO pages
/services/security-solutions/products      ✅ All products (live from DB)
/services/security-solutions/quote         ✅ 5-step quote wizard (also package mode)
/services/car-rental                       ✅ Car rental landing + "available now" badges
/services/car-rental/vehicles              ✅ Fleet, vehicle modal → rental application
/rental-terms                              ✅ Full lease terms
/sign-agreement/[id]                       ✅ Customer e-signature page
/services/it-services                      ✅ IT landing (Pak Oz Technologies) + portfolio
/services/it-services/web-development      ✅
/services/it-services/app-development      ✅
/services/it-services/ai-automation        ✅
/services/it-services/quote                ✅ Project brief + estimate
/quote                                     ✅ Quote chooser
/about  /contact  /testimonials            ✅
/blog  /blog/[slug]                        ✅
/dashboard                                 ✅ Admin (server-side auth)
/lead-finder                               🚧 Lead finder — separate login
/rental-admin                              ✅ Rental-only admin (own password)
```

API routes (`src/app/api/`):
```
chat                         AI agent (Gemini)
leads, dashboard/leads       Lead capture → KV (GET for admin)
contact                      Contact form → lead + emails
quote/security               Security quote → emails customer + admin, logs lead
quote/it-services            IT project brief → emails
products, packages, catalog  Security catalog (Postgres)
vehicles, vehicles/counts    Fleet (rego included in public responses)
promo                        Category % discounts
google-reviews               Places API reviews (env-gated)
db/setup                     Create tables + one-time seed
admin/session                Login/logout cookie session
rental-application           Rental application + email quote
rental-payment/*             create-intent, create-setup, start-subscription,
                             negotiate-price, accept-terms, licence, trusted,
                             agreements, return-vehicle, send-reminders (cron),
                             webhook (Stripe)
rental-files/[id], rental-evidence(/photo)   Customer files + photo evidence
agreements(/create, /[id], /[id]/sign)       Lease agreements + e-sign
disputes(/[id]/build, /[id]/submit)          Chargeback evidence → Stripe
lead-finder/search, lead-finder/saved        Prospect search (LEADS_URL db)
```
Admin API routes must be listed in `PROTECTED` in `middleware.ts`.

Redirects (`next.config.mjs`, **not** next.config.js — it does not exist):
```
/services/cctv-installation         → /services/security-solutions          (308 permanent)
/services/cctv-installation/:path*  → /services/security-solutions/:path*    (308 permanent)
```

---

## 6. Data files (single source of truth)

All of these files currently exist in `src/data/`:
```
src/data/
  site.ts                ← THE ONE FILE TO CHANGE FOR BUSINESS NAME/DOMAIN
                           exports SITE_NAME, SITE_SUFFIX, SITE_FULL, SITE_TAGLINE,
                           SITE_DOMAIN, SITE_EMAIL, SITE_PHONE, SITE_ADDRESS,
                           COMPANY_ABN, SITE_HOURS
  services.ts            Master services list (6 cards on home grid).
                           NOTE: the security entry now reads name "Security Solutions",
                           href "/services/security-solutions" (id still "cctv-installation")
  security-solutions.ts  ★ SOURCE OF TRUTH for the security section.
                           exports: interface SecurityProduct, interface SecuritySolution,
                           securitySolutions[] (6 solutions), installFee = 150, gstRate = 0.10
                           The 6 solutions: surveillance, deterrence, commercial,
                           access-control, smoke-alarms, intercoms (see §7 for slugs)
  cctv-products.ts       Backwards-compat SHIM ONLY. Re-exports { installFee, gstRate }
                           from security-solutions.ts and exports
                           cctvProducts = the "surveillance" solution's products.
                           Kept so the AI agent prompt keeps working.
  car-rental.ts          Original vehicle seed data — the live fleet is in Postgres
                           (`vehicles` table, managed from the dashboard)
  it-services.ts         IT services, packages, estimate pricing
  blog.ts                Blog posts (real team as authors)
  service-areas.ts       Suburbs for /services/security-solutions/areas/[slug]
  portfolio.ts           "Our Work" projects on IT pages
  catalog.json, promo.json  Legacy fallbacks only — live data is Postgres/KV
  testimonials.ts        Customer reviews — includes an `image` field per review
  navigation.ts          Nav links (mobile slide-out). Security entry updated to
                           { label: "Security Solutions", href: "/services/security-solutions" }
```

Every price/content block gets this comment:
```ts
// TODO(dashboard): replace with API call when admin dashboard is live
```

---

## 7. Security Solutions quote wizard (current implementation)

File: `src/app/services/security-solutions/quote/page.tsx` (`"use client"`).
Ported from `cctv_quote_form_template (1).html` in project root.
This now handles ALL 6 security solutions, not just CCTV.

### The 6 solutions (id → slug → detail page)
```
surveillance     → surveillance-evidence  → /services/security-solutions/surveillance-evidence
deterrence       → deterrence             → /services/security-solutions/deterrence
commercial       → commercial-security    → /services/security-solutions/commercial-security
access-control   → access-control         → /services/security-solutions/access-control
smoke-alarms     → smoke-alarms           → /services/security-solutions/smoke-alarms
intercoms        → intercoms              → /services/security-solutions/intercoms
```

### Quote theme — GREEN (not the site's purple)
The quote form stays GREEN. The rest of the site uses #7f85f7 purple-blue.
Green: primary #0F6E56, light #5DCAA5, tint #E1F5EE, dark #085041

### Step flow (5 steps, ported exactly)
1. Property type — single select tiles: Residential, Commercial, Industrial, Strata
2. Solutions — multi-select tiles built from `securitySolutions` (the 6 solutions
   above), each showing a "From $X" hint = lowest product price in that solution
3. Quantities — +/- counter for each SELECTED solution only (hide others)
4. Timing — single select: ASAP, Next 2 weeks, This month, Just exploring
5. Contact details: First name, Last name, Email, Phone, Suburb/Postcode,
   How did you hear about us (dropdown)
   + Live quote summary card built dynamically

A `?solution=<id>&product=<id>` query param (used by product-card "Get Quote"
buttons) pre-selects that solution on step 2.

### Pricing logic (from security-solutions.ts — shared source of truth)
```ts
import { securitySolutions, installFee, gstRate } from "@/data/security-solutions"
// installFee = 150, gstRate = 0.10
// "from" price per solution = lowest product price in that solution:
const fromPrice = (sol) => Math.min(...sol.products.map(p => p.price))
// prices map fed to the calculator: { [solution.id]: fromPrice(solution) }
```
Calculation (uses `calcCCTVQuote()` in `src/lib/formatters.ts` — name kept):
```
subtotal  = sum(fromPrice[s] × qty[s] for each selected s) + installFee
gst       = subtotal × 0.10
total     = subtotal + gst
```
Format: `formatAUD()` → `toLocaleString('en-AU')` with `$` prefix

### On submit — EMAIL SENDING (critical requirement)
When the customer clicks "Generate My Quote & Send Email":
1. Validate: firstName, email, phone are required
2. POST to `/api/quote/security` with full quote data
3. Server sends email to the CUSTOMER'S EMAIL ADDRESS they entered
4. Email contains the full quote summary (itemised list, totals, valid 30 days)
5. Show success screen: "Quote sent successfully! Check your email."
6. Also: log lead to leads store for dashboard

### Email content (send to customer)
Subject: `Your Security Solutions Quote from ${SITE_FULL}`
Body (HTML email):
- Business name + logo text header
- "Hi [FirstName], thank you for your quote request"
- Property type + timing selected
- Itemised quote table: solution, qty, unit price, line total
- Install fee line
- Subtotal ex GST
- GST amount
- TOTAL in bold
- "Quote valid for 30 days"
- "Our team will follow up within 1 business day"
- Contact details: SITE_PHONE, SITE_EMAIL

### Email sending setup (Nodemailer)
```ts
// src/lib/mailer.ts
// Uses SMTP — owner configures in .env.local:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
// For testing: use Gmail app password or Mailtrap
```

### Success screen (match template exactly)
- Green checkmark circle (#E1F5EE bg, #0F6E56 icon)
- "Quote sent successfully!"
- "Your personalised quote has been emailed to you."
- "Our team will also follow up within 1 business day."
- "Quote valid for 30 days" badge (green)

### Header (CRITICAL — use SITE_FULL not "SecureVision Australia")
```tsx
// Top of quote form
<div className="logo-box">  // green #0F6E56 square
  <ShieldCheck />           // white icon
</div>
<div className="brand">
  {SITE_NAME}<span>{SITE_SUFFIX}</span>  // reads from site.ts
</div>
```

### API route — `src/app/api/quote/security/route.ts`
- Validates `fname`, `email`, `phone`
- Builds the itemised HTML email **inline** via a local `buildEmail()` (there is
  no separate `src/lib/email-templates/` file) and sends it with `sendEmail()`
  from `src/lib/mailer.ts`
- Logs the lead to the KV leads store (same store as the AI chat) with
  `source: "quote_form"`, `service: "security-solutions"`
- Email requires SMTP env vars; with placeholders the submit returns 500 and the
  form shows a retry message instead of the success screen

This wizard handles ALL 6 solutions plus **package mode** (bundles built in the
dashboard). Dashboard category % promos apply via `effectivePrice()` — never
discount twice.

---

## 8. Car rental (Pak Oz Rentals)

- **Fleet** lives in Postgres `vehicles` table (`src/lib/vehicles.ts`), managed in
  the dashboard. Status: `available` / `coming_soon` / `hidden`. **Rego is public
  (fleet cards, modal, `/api/vehicles`) and unique per vehicle.** Nest the payload in API calls (`type` collides
  with the route discriminator).
- **Customer flow:** vehicle modal → 3-step rental application
  (`/api/rental-application`) → admin approves or counter-offers (price
  negotiation) → customer accepts condensed terms + licence upload → payment →
  e-signs lease (`/sign-agreement/[id]`) → signed PDF emailed to both parties.
- **Payments:** Stripe card or BECS direct debit (preferred for every customer;
  card-only fallback until `STRIPE_BECS_ENABLED`), weekly subscriptions, optional
  bond, or direct bank transfer / PayID. Return → cancel + detach, pro-rated refund.
- **Reminders:** daily cron → `/api/rental-payment/send-reminders` (`CRON_SECRET`).
- **Chargeback protection:** booking starts `pending_payment`; evidence
  (application, signed terms, licence, photos, IP/timestamps) stored as
  `rental_files` in Postgres; dispute builder creates an evidence PDF and submits
  to Stripe. Webhook must subscribe to `charge.succeeded` + `charge.dispute.*`.

---

## 9. AI Agent (on ALL pages)

Floating chat bubble fixed bottom-right on every page via root layout.

Visual: 60px circle, #7f85f7, white chat icon, pulse after 3s
Panel: 380×520px, slides up, dark header, message bubbles

Tech (CURRENT — Google Gemini, not Anthropic):
- API route: `src/app/api/chat/route.ts`
- SDK: `@google/generative-ai`
- Model: **`gemini-2.5-flash`** (free tier, ~1500 requests/day, $0 cost)
- Env var: **`GEMINI_API_KEY`** (`process.env.GEMINI_API_KEY`)
- System prompt: `src/lib/agent-prompt.ts` — built dynamically from site.ts + data files
- Message format: Gemini uses role `"model"` (not `"assistant"`). The route maps
  `assistant → model` and **drops any leading `model` turns** so history starts
  with a `user` turn (Gemini requires this).
- Returns `{ reply, leadCollected }`
- Lead collection: when customer gives name+phone+email → POST /api/leads

Agent behaviour:
- Knows all services and prices (from data files)
- Collects leads (name, phone, email, service interested in)
- Escalates: "Our team will call you within 2 business hours"
- Australian English, 2-3 sentences max per reply
- Uses SITE_FULL in greeting (not hard-coded name)

### Debugging the agent
If the chat replies "Sorry, I am having trouble right now":
1. Check `GEMINI_API_KEY` is set (not a placeholder) in `.env.local` — get a key
   at aistudio.google.com, then **restart the dev server**.
2. Confirm the model name is exactly `"gemini-2.5-flash"`.
3. Confirm the route reads `process.env.GEMINI_API_KEY` (no leftover
   `ANTHROPIC_API_KEY`).
4. To see the real cause, the catch block already logs the full error
   ("Gemini chat error FULL") — run `npm run dev`, open the chat, and read the
   VS Code terminal.

---

## 10. Dashboard

Status: ✅ BUILT. `/dashboard` (`robots: noindex`).

**Auth is server-side:** `/api/admin/session` sets a signed cookie
(`ADMIN_SESSION_SECRET`), checked by `middleware.ts`. Passwords:
`ADMIN_PASSWORD` (main dashboard), `RENTAL_ADMIN_PASSWORD` (`/rental-admin`).
Every new admin API route must be added to `PROTECTED` in `middleware.ts`.

**`/dashboard` tabs:** Overview · Security · Products (DB) · Packages · Car Rental
(vehicles) · Offers · Active Rentals · IT Services · Discounts · Leads ·
Enquiries
- Add/edit/delete products, packages and vehicles → Postgres, show up live on the site
  (images stored inline as URL/data-URL, compressed client-side)
- Discounts = category % promos, applied in every quote wizard + email
- **Lead finder is NOT in the dashboard** — it lives at `/lead-finder` with its own
  password (`LEAD_FINDER_PASSWORD`) and cookie (`pakoz_leads`, role `leads`).
  Dashboard logins can't open it and vice versa. Own DB (`LEADS_URL`).

**`/rental-admin` tabs:** Overview · Vehicles · Active Rentals · Price Offers ·
Agreements · Disputes · Leads

---

## 11. Definition of done (per page)

- [ ] `npm run build` passes — zero errors, zero warnings
- [ ] No hard-coded business name, phone, email, domain anywhere
- [ ] All text/prices from src/data/ files
- [ ] Mobile responsive (375px, 768px, 1280px)
- [ ] Per-page <title> uses SITE_FULL
- [ ] Per-page <meta description> set
- [ ] AI chat bubble working
- [ ] Poppins font applied

---

## 12. Environment variables (.env.local — never commit)

```bash
# AI Agent (Google Gemini — free tier, key starts with AIzaSy...)
GEMINI_API_KEY=AIzaSy...

GEMINI_MODEL=gemini-2.5-flash     # optional override

# Email — Hostinger mailbox info@pakozsolutions.com.au
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=info@pakozsolutions.com.au
SMTP_PASS=...
SMTP_FROM=info@pakozsolutions.com.au
LEAD_NOTIFY_EMAIL=...             # where new-lead alerts go

# Databases
DATABASE_URL=postgres://...       # Neon — ⚠ .env.local points at the LIVE db
LEADS_URL=postgres://...          # Neon — lead finder only
KV_REST_API_URL=...  KV_REST_API_TOKEN=...   # (or UPSTASH_REDIS_REST_URL/TOKEN)

# Admin auth
ADMIN_PASSWORD=...
RENTAL_ADMIN_PASSWORD=...
LEAD_FINDER_PASSWORD=...         # /lead-finder only
ADMIN_SESSION_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_BECS_ENABLED=true|false

# Misc
NEXT_PUBLIC_APP_URL=https://pakozsolutions.com.au
CRON_SECRET=...
GOOGLE_PLACES_API_KEY=...  GOOGLE_PLACE_ID=...   # reviews — not set yet
```

There is **no `ANTHROPIC_API_KEY`** — the agent uses `GEMINI_API_KEY`.
All env vars must also be set in Vercel → Project Settings → Environment
Variables, **then redeploy** (env changes don't apply to existing deployments).

---

## 13. Rename script (exists: `scripts/rename.ts`)

Name is now decided (Pak Oz Solutions) — kept for reference:
```ts
// Usage: npx ts-node scripts/rename.ts "BusinessName" "domain.com.au"
// Updates SITE_NAME and SITE_DOMAIN in src/data/site.ts
// The entire website updates because all components import from site.ts
import { readFileSync, writeFileSync } from "fs"

const [,, name, domain] = process.argv
if (!name || !domain) {
  console.error("Usage: npx ts-node scripts/rename.ts \"Name\" \"domain.com.au\"")
  process.exit(1)
}

const path = "src/data/site.ts"
let content = readFileSync(path, "utf-8")
content = content.replace(/SITE_NAME\s*=\s*"[^"]*"/, `SITE_NAME        = "${name}"`)
content = content.replace(/SITE_DOMAIN\s*=\s*"[^"]*"/, `SITE_DOMAIN      = "https://${domain}"`)
content = content.replace(/SITE_EMAIL\s*=\s*"[^"]*"/, `SITE_EMAIL       = "info@${domain}"`)
writeFileSync(path, content)
console.log(`✅ Business renamed to "${name}" with domain "${domain}"`)
console.log(`   Now run: git add . && git commit -m "Rename to ${name}" && git push`)
```

---

## 14. Our working style

- One page at a time. Finish completely before next.
- After each page: run `npm run build`, fix ALL errors, then report done.
- If unsure about design: ask me before guessing.
- Keep components under 150 lines — split if larger.
- Never install new packages without telling me first.
- Update this PROJECT.md if decisions change.

---

## 15. Decisions log

Every UI/design/architecture decision made so far:

- **AI model:** switched from Anthropic/Claude to **Google Gemini**
  (`@google/generative-ai`, `gemini-2.5-flash`) — free tier, $0 cost.
  Env var is `GEMINI_API_KEY`. All Anthropic references removed.
- **Security section renamed:** "CCTV Installation" → **"Security Solutions"**, now
  a hub with **6 sub-solutions** (Surveillance & Evidence, Deterrence, Commercial
  Security, Access Control, Smoke Alarms, Intercoms) via a dynamic `[slug]` route.
  Old `/services/cctv-installation*` URLs **308-redirect** to the new paths.
- **Hero style:** Option 1 — **dark `#0d0d1a`** hero with a Brisbane skyline image.
  - Hero image: `public/images/hero.jpg` (Brisbane skyline).
  - Hero LEFT: badge + h1 (`{SITE_FULL}`) + 3 service "pill" links.
  - Hero RIGHT: `hero.jpg` image — **no floating badges** (both removed).
  - The Security Solutions landing reuses this dark-hero treatment (dot grid +
    purple glow) with a `#8187fa` block + ShieldCheck on the right.
- **Navbar:** purple top nav `rgba(127,133,247,0.95)`, sticky, blur. Has a
  **Services dropdown** (CSS `group-hover`, no JS) listing Security Solutions /
  Car Rental / IT & AI Services, and a **Plus (+) menu** for Testimonials +
  Contact. Mobile = slide-out panel from `navigation.ts`.
- **Services grid order** (home, `src/data/services.ts`): Web Development,
  App Development, AI Automation, **Security Solutions**, Car Rental, IT Consulting.
- **Quote form theme:** stays **GREEN** (`#0F6E56`) while the rest of the site is
  purple `#7f85f7`.
- **Backwards compat:** `cctv-products.ts` is now a shim re-exporting from
  `security-solutions.ts` so the AI prompt and any old imports keep working.
- **Business name decided:** Pak Oz Solutions (sub-brands Pak Oz CCTV,
  Pak Oz Rentals, Pak Oz Technologies). IT has its own WhatsApp number (`IT_WHATSAPP`).
- **Persistence:** Vercel FS is read-only → products/packages/vehicles/rentals in
  Neon Postgres; leads + promos in KV. File writes silently vanish on deploy.
- **DB seeds run once** — re-running `/api/db/setup` must not resurrect deleted products.
- **Car rental quote form removed** — replaced by vehicle modal + rental application
  + Stripe checkout + e-signed lease.
- **Admin auth moved server-side** (cookie + middleware), plus API rate limits and
  HTML escaping in emails.
- **SEO:** sitemap, robots, canonicals, LocalBusiness/Service/Breadcrumb/FAQ/
  BlogPosting JSON-LD, edge-runtime OG image (Node `@vercel/og` breaks the
  Windows build; Satori rejects multiple gradients).
- **Testing:** verify with `npm run build`, not `npm run dev` (Google Fonts fetch
  can hang locally).
