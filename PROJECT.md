# PROJECT.md — Multi-Service Business Website

> You are my coding assistant. Read this file fully before every session.
> Never skip sections. When I give a short instruction, interpret it in
> the context of this document. Keep this file updated as decisions are made.

---

## 1. What we are building

A real production website for an Australia-based multi-service business.
Services: CCTV installation, car rental, web/app development, AI automation.
Each service has its own ad-focused landing page.

Built **one page at a time** — complete each page fully before the next.

**Current build order:**
1. Home page ← START HERE
2. CCTV Installation landing + products + quote
3. Car Rental landing + vehicles + quote (placeholder)
4. IT Services landing + subpages
5. Contact + About
6. Dashboard (admin)

---

## 2. BUSINESS NAME SYSTEM (HARD RULE — most important rule in this file)

### The business name is NOT decided yet.

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
export const SITE_ABN         = "ABN: 00 000 000 000";        // ← real ABN when ready
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
- **Anthropic SDK** (`@anthropic-ai/sdk`) — AI agent (server-side only)
- **Nodemailer** (`nodemailer`) — sending quote emails
- **React Hook Form** — all forms
- **Framer Motion** — hover transitions
- Deployment: **Vercel free tier**
- Content: `src/data/*.ts` files (no database yet)

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
/                                     Home — all services
/services/cctv-installation           CCTV landing (ad target)
/services/cctv-installation/products  Products + prices
/services/cctv-installation/quote     5-step quote wizard
/services/car-rental                  Car rental landing (ad target)
/services/car-rental/vehicles         Vehicles + rates
/services/car-rental/quote            Booking form (logic TBD)
/services/it-services                 IT services landing (ad target)
/services/it-services/web-development
/services/it-services/app-development
/services/it-services/ai-automation
/about
/contact
/testimonials
/blog                                 Placeholder
/dashboard                            Admin (password protected)
```

---

## 6. Data files (single source of truth)

```
src/data/
  site.ts            ← THE ONE FILE TO CHANGE FOR BUSINESS NAME/DOMAIN
  services.ts        Master services list
  cctv-products.ts   CCTV products + prices + installFee + gstRate
  car-rental.ts      Vehicles + rates
  it-services.ts     IT packages + features
  testimonials.ts    Customer reviews
  navigation.ts      Sidepanel nav links
```

Every price/content block gets this comment:
```ts
// TODO(dashboard): replace with API call when admin dashboard is live
```

---

## 7. CCTV quote wizard (EXACT logic — do not change)

Template file: `cctv_quote_form_template__1_.html` in project root.

### Quote theme
The template uses GREEN (#0F6E56) not purple. Keep it green for this form.
The rest of the site uses #7f85f7 purple-blue, but this quote form stays green.
Green: primary #0F6E56, light #5DCAA5, tint #E1F5EE

### Step flow (port exactly)
1. Property type — single select tiles: Residential, Commercial, Industrial, Strata
2. Solutions — multi-select checkboxes: CCTV, Alarm, Access Control,
   Intercom, Perimeter, Smoke (show price hint under each)
3. Quantities — +/- counter for each SELECTED solution only (hide others)
4. Timing — single select: ASAP, Next 2 weeks, This month, Just exploring
5. Contact details: First name, Last name, Email, Phone, Suburb/Postcode,
   How did you hear about us (dropdown)
   + Live quote summary card built dynamically

### Pricing logic (from cctv-products.ts — shared source of truth)
```ts
prices = { cctv: 299, alarm: 799, access: 499, intercom: 349, perimeter: 599, smoke: 149 }
installFee = 150
gstRate = 0.10
```
Calculation:
```
subtotal  = sum(price[s] × qty[s] for each selected s) + installFee
gst       = subtotal × 0.10
total     = subtotal + gst
```
Format: `toLocaleString('en-AU')` with AUD prefix

### On submit — EMAIL SENDING (critical requirement)
When the customer clicks "Generate My Quote & Send Email":
1. Validate: firstName, email, phone are required
2. POST to `/api/quote/cctv` with full quote data
3. Server sends email to the CUSTOMER'S EMAIL ADDRESS they entered
4. Email contains the full quote summary (itemised list, totals, valid 30 days)
5. Show success screen: "Quote sent successfully! Check your email."
6. Also: log lead to leads store for dashboard

### Email content (send to customer)
Subject: `Your CCTV Security Quote from ${SITE_FULL}`
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

**This quote is ONLY for CCTV.** Add comment at top of file:
```
// CCTV-SPECIFIC QUOTE — do not reuse for other services
// Car rental quote logic will be provided separately by owner
```

---

## 8. Car rental quote (PLACEHOLDER)

Logic not decided yet. Build a clean form:
```ts
// TODO(owner): Car rental quote logic to be provided
// Do not guess — keep as placeholder until owner provides rules
function calculateRentalQuote(vehicleId: string, days: number) {
  // PLACEHOLDER — returns base rate only
  // Owner will provide full pricing rules (insurance, km, seasonal rates etc.)
  const vehicle = vehicles.find(v => v.id === vehicleId)
  return vehicle ? vehicle.dailyRate * days : 0
}
```
No email sending yet for car rental — just show a "We'll be in touch" message.

---

## 9. AI Agent (on ALL pages)

Floating chat bubble fixed bottom-right on every page via root layout.

Visual: 60px circle, #7f85f7, white chat icon, pulse after 3s
Panel: 380×520px, slides up, dark header, message bubbles

Tech:
- API route: `src/app/api/chat/route.ts`
- Model: `claude-haiku-4-5-20251001` (fast + cheap)
- Max tokens: 300
- System prompt: `src/lib/agent-prompt.ts` — built dynamically from site.ts + data files
- Lead collection: when customer gives name+phone+email → POST /api/leads

Agent behaviour:
- Knows all services and prices (from data files)
- Collects leads (name, phone, email, service interested in)
- Escalates: "Our team will call you within 2 business hours"
- Australian English, 2-3 sentences max per reply
- Uses SITE_FULL in greeting (not hard-coded name)

---

## 10. Dashboard

Password protected client-side (prototype level).
Password from env: NEXT_PUBLIC_DASHBOARD_PASSWORD

Tabs: CCTV Products (edit prices) | Car Rental (edit rates) | Leads | Settings
Stitch screen: 47e2f4daaefd4f51851aa58e48947d88

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
# AI Agent
ANTHROPIC_API_KEY=sk-ant-...

# Email (CCTV quote sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_app_password       # Gmail app password (not account password)
SMTP_FROM=youremail@gmail.com

# Dashboard
NEXT_PUBLIC_DASHBOARD_PASSWORD=admin123
```

README must explain how to set up Gmail app password for SMTP.

---

## 13. Rename script (create this)

Create `scripts/rename.ts`:
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
