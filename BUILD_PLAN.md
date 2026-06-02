# BUILD_PLAN.md — 4-Day Build Plan with Exact Prompts

> Paste prompts into Claude Code in order. Never skip ahead.
> Each session ends with npm run build — do NOT move forward until it passes.

---

## FIRST — One-time orientation (paste this before Day 1)

```
Read all 5 files in this project folder:
PROJECT.md, BUILD_PLAN.md, CODING_STYLE.md, AI_AGENT.md, SKILLS.md

Do not write any code yet. Confirm you understand by answering:
1. Where is the ONE place to change the business name?
2. What are the 6 brand color names and their hex values?
3. What does the card hover effect do (describe fully)?
4. What model does the AI agent use and what is its max_tokens?
5. What happens when a customer submits the CCTV quote form?
6. Which page do we build first?
```

---

## DAY 1 — Scaffold + Home page

### 1A — Project scaffold

```
Start the AuzServ project. Follow PROJECT.md and CODING_STYLE.md.
Build in this exact order:

STEP 1 — Next.js scaffold
Run in the CURRENT folder (not a subfolder):
  npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-git
Then: git init && git add . && git commit -m "Initial scaffold"

STEP 2 — Install all dependencies
  npm install framer-motion @anthropic-ai/sdk lucide-react react-hook-form nodemailer
  npm install --save-dev @types/nodemailer ts-node

STEP 3 — tailwind.config.ts
Add brand color palette exactly as specified in CODING_STYLE.md section 3.
Also add fontFamily: { poppins: ["Poppins", "sans-serif"] }

STEP 4 — src/app/globals.css
Remove default Next.js styles. Add only:
  @tailwind base; @tailwind components; @tailwind utilities;
  body { font-family: 'Poppins', sans-serif; color: #666666; font-size: 14px; }

STEP 5 — src/data/site.ts
Create with EXACT exports from PROJECT.md section 2.
The SITE_NAME, SITE_SUFFIX, SITE_FULL, SITE_TAGLINE, SITE_DOMAIN,
SITE_EMAIL, SITE_PHONE, SITE_ADDRESS, SITE_ABN, SITE_HOURS constants.
Add the big comment "CHANGE BUSINESS NAME HERE" at the top.

STEP 6 — All other data files
src/data/services.ts — 6 services (CCTV, Car Rental, Web Dev, App Dev, AI Automation, IT Consulting)
  Each: { id, name, description, href, iconName, comingSoon: false }
src/data/cctv-products.ts — 6 products with prices from PROJECT.md section 7
  Plus: export const installFee = 150; export const gstRate = 0.10
  Add TODO(dashboard) comment
src/data/car-rental.ts — 4 vehicles: Economy $65/day, SUV $95/day, Van $110/day, Luxury $180/day
  Each: { id, name, description, dailyRate, weeklyRate, passengers, features[] }
src/data/it-services.ts — 3 packages: Web Dev, App Dev, AI Automation
  Each: { id, name, description, features[], startingFrom, icon }
src/data/testimonials.ts — 3 placeholder testimonials
  Each: { id, name, suburb, state, rating, text, service, date }
src/data/navigation.ts — nav links array for sidepanel
  { label, href } for: Home, About, Services, CCTV Installation,
  Car Rental, IT Services, Testimonials, Contact

STEP 7 — src/types/index.ts
Interfaces: Service, CCTVProduct, Vehicle, ITService, Testimonial,
            Lead, Message, NavLink (see SKILLS.md)

STEP 8 — src/lib/formatters.ts
export function formatAUD(amount: number): string

STEP 9 — .env.local (create but do NOT commit)
ANTHROPIC_API_KEY=placeholder
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=placeholder
SMTP_PASS=placeholder
SMTP_FROM=placeholder
NEXT_PUBLIC_DASHBOARD_PASSWORD=admin123

STEP 10 — .gitignore
Confirm it includes: node_modules, .next, .env*, *.local

STEP 11 — scripts/rename.ts
Create the rename script exactly as specified in PROJECT.md section 13.

Run: npm run build
Show me the folder structure with tree command.
Tell me when scaffold is complete.
```

### 1B — Layout components

```
Scaffold done. Build layout components. Follow CODING_STYLE.md exactly.
Import SITE_FULL/SITE_NAME etc from "@/data/site" — never hard-code.

1. src/components/ui/Button.tsx
   Variants: "dark" | "outline" | "accent"
   dark:    bg-brand-dark text-brand-text hover:bg-brand-primary hover:text-white
   outline: border-2 border-brand-dark text-[#2d2d2c] hover:bg-brand-dark hover:text-brand-text
   accent:  bg-brand-primary text-white hover:opacity-90
   All: rounded-[5px] text-[17px] font-medium h-[69px] px-10 transition-all duration-500
   If href prop: render as Next.js Link. If onClick: render as button.

2. src/components/ui/SectionTitle.tsx
   Props: title, subtitle? (string), align: "center"|"left"
   Title: text-[45px] font-bold uppercase text-[#2f2f2f] leading-tight
   Subtitle: text-[17px] text-[#666666] mt-2

3. src/components/layout/SidePanel.tsx
   Slide from right. Width 280px open, 0 closed.
   bg-brand-panel (#111). Full height fixed. z-index high.
   Links from navigation.ts. Active: text-brand-primary (#7f85f7).
   Overlay: semi-transparent black behind panel.
   Smooth 0.5s CSS transition. Props: isOpen, onClose.

4. src/components/layout/Header.tsx
   Transparent bg. Padding 35px 15px.
   Left: SITE_FULL as text wordmark (font-bold text-[#2d2d2c] text-2xl)
   Right: hamburger button (3 lines icon, Lucide Menu) opens SidePanel.
   Static positioning (not sticky) — matches Zlymo exactly.
   SidePanel rendered inside Header with useState.

5. src/components/layout/Footer.tsx
   bg-brand-footer (#252525). pt-[130px].
   4 columns (grid on desktop, 2-col tablet, 1-col mobile):
   Col 1: SITE_NAME large (text-[50px] font-bold text-white) + SITE_TAGLINE + about blurb
   Col 2: "Services" heading (white) + links list from services.ts (light grey text)
   Col 3: "Contact" heading + SITE_PHONE + SITE_EMAIL + social icons (Facebook, Twitter, LinkedIn, Instagram)
   Col 4: "Newsletter" heading + email input + Subscribe button
   All text: white or light grey (#999)
   Bottom bar: copyright with SITE_FULL + year (from new Date().getFullYear())

6. src/app/layout.tsx
   Import Poppins via next/font/google (weights: 300,400,500,600,700)
   Apply font to html element.
   Render: Header + {children} + Footer + AIChatBubble (stub import, build next)
   html lang="en-AU"
   metadata: title template `%s | ${SITE_FULL}`, description from SITE_TAGLINE

Run npm run build. Fix all errors. Tell me when layout is done.
```

### 1C — Home page

```
Layout done. Build the Home page. Match Stitch screen 440cbdfe432c47ea972eab802a5b5d93.

Build these components, then assemble in src/app/page.tsx:

1. src/components/sections/HeroSection.tsx
   Left col (60%):
     Small uppercase overline: "Australia's Multi-Service Experts" (text-brand-primary)
     h1: text-[80px] font-bold text-[#2d2d2c] — one word in text-brand-primary
     Paragraph: subheading, text-[17px] text-[#666666]
     Two buttons: "Get Free Quote" (dark variant, href="/contact"),
                  "Our Services" (outline variant, href="#services")
   Right col (40%):
     bg-brand-light (#8187fa) rounded-3xl min-h-[400px]
     Inside: grey placeholder box labeled "Hero Image" (will replace with real image)
   Full viewport height. Flex row desktop, stack mobile.

2. src/components/sections/ServicesGrid.tsx
   id="services" (for anchor link from hero)
   SectionTitle "OUR SERVICES" centered
   3-col grid (2-col tablet, 1-col mobile), gap-8
   Cards from services.ts. Each card: EXACT Zlymo cameras_text style from CODING_STYLE.md section 4.
   bg-brand-card (#f7f7f7) rounded-[80px] p-16 text-center
   group hover: bg-brand-primary, all text → white, button → white+dark
   transition-all duration-500 on everything
   Lucide icon (from iconName in services.ts), 60px
   Service name bold text-xl
   Short description text-sm
   "Learn More" button → service href

3. src/components/sections/AboutStrip.tsx
   Two col: left image placeholder, right text
   SectionTitle "ABOUT US" align="left"
   2 paragraphs about the business (from site.ts or placeholder)
   Button dark "Read More" → /about

4. src/components/sections/WhyChooseUs.tsx
   Full width bg-brand-primary (#7f85f7) section
   "WHY CHOOSE US" title in white 45px bold uppercase
   4 feature boxes: Licensed & Insured, Australia-Wide, Free Quote, 24/7 Support
   Each: white Lucide icon 48px + white bold title + white description

5. src/components/sections/TestimonialsStrip.tsx
   SectionTitle "WHAT OUR CLIENTS SAY" centered
   3 cards from testimonials.ts
   White cards, #7f85f7 star icons, customer name bold, suburb muted grey

6. src/components/sections/QuoteCTABanner.tsx
   Full width bg-brand-primary
   Bold white headline "GET YOUR FREE QUOTE TODAY"
   White subtext "Fast response. No obligation. Australia-wide."
   White outline Button → /contact

7. src/app/page.tsx
   metadata: title `${SITE_FULL} | ${SITE_TAGLINE}`
   Assemble: HeroSection → ServicesGrid → AboutStrip → WhyChooseUs
             → TestimonialsStrip → QuoteCTABanner

Check at 375px, 768px, 1280px. Run npm run build. Fix all errors.
Tell me when home page is done and I will move to the next step.
```

### 1D — AI Chat Bubble

```
Home page complete. Now build the AI chat agent. Read AI_AGENT.md fully first.

1. src/lib/mailer.ts
   Setup Nodemailer transporter using env vars (SMTP_HOST/PORT/USER/PASS/FROM)
   Export: sendEmail(to: string, subject: string, html: string): Promise<void>

2. src/lib/agent-prompt.ts
   buildSystemPrompt() function — import from all data files.
   Full dynamic prompt from AI_AGENT.md section 3.
   SITE_FULL used in prompt (not hard-coded name).

3. src/app/api/chat/route.ts
   Exact implementation from AI_AGENT.md section 4.
   POST handler, Anthropic SDK, claude-haiku-4-5-20251001, 300 tokens.
   Returns { reply, leadCollected }.

4. src/app/api/leads/route.ts
   POST: save lead to /data/leads.json (create file if not exists, append)
   GET: return all leads (for dashboard)

5. src/components/ui/AIChatBubble.tsx "use client"
   Full implementation from AI_AGENT.md section 6.
   - Floating #7f85f7 circle, 60px, bottom-right fixed
   - Pulse after 3s (CSS animation)
   - Panel 380×520px slides up on open
   - Header with SITE_FULL (from site.ts), dark bg
   - Message bubbles: agent left (#f7f7f7), user right (#7f85f7)
   - Three-dot loading animation
   - Auto-scroll to bottom on new message
   - On leadCollected: POST /api/leads

6. Add AIChatBubble to src/app/layout.tsx

Test: open chat, type "tell me about CCTV pricing", verify response mentions
real prices from cctv-products.ts.

Run npm run build. Fix all errors. Day 1 complete!
```

---

## DAY 2 — CCTV Landing + Products + Quote

### 2A — CCTV landing page

```
Day 2. Build CCTV Installation landing page.
Match Stitch screen bffc3718ddb74f6082c551a32b7f40a0.
Read PROJECT.md section 7 for CCTV-specific rules.

src/app/services/cctv-installation/page.tsx

Sections in order:

1. CCTV Hero
   h1: "PROFESSIONAL CCTV INSTALLATION" — one word in brand-primary
   Subheading about licensed installers, Australia-wide
   Two CTAs: "Get Free Quote" → /services/cctv-installation/quote
             "View Products" → /services/cctv-installation/products
   Right block: bg-brand-light with large ShieldCheck icon (white, 160px)

2. Benefits strip (bg-brand-section, pt-20)
   4 boxes in a row: Licensed Installers, Same Week Install,
   Free Site Assessment, 2 Year Warranty
   Each: brand-primary Lucide icon, bold title, description

3. Products preview
   SectionTitle "OUR CCTV CAMERAS" centered
   Show first 3 products from cctvProducts in cctv-products.ts
   EXACT Zlymo card style (CODING_STYLE.md section 4):
   - rounded-[80px] bg-brand-card, full hover fill to brand-primary
   - Camera icon, "Price" in brand-primary, amount in dark bold
   - Product name bold, "Buy Now" button dark, inverts on hover
   "See All Products" centered button below → /services/cctv-installation/products

4. How It Works (3 steps, brand-primary numbered circles)
   Step 1: Free Assessment → Step 2: Custom Plan → Step 3: Install

5. QuoteCTABanner (reuse component)

6. TestimonialsStrip (reuse component)

Metadata:
title: "CCTV Installation | ${SITE_FULL}"
description: "Professional CCTV installation across Australia..."

npm run build. Fix errors.
```

### 2B — CCTV Products page

```
Build src/app/services/cctv-installation/products/page.tsx

ALL 6 products from cctvProducts in cctv-products.ts.

Page structure:
- Hero strip: "OUR CCTV PRODUCTS" large uppercase, subheading
- 3-col product grid (2-col tablet, 1-col mobile)

Each product card — EXACT Zlymo cameras_text style:
- bg-brand-card rounded-[80px] py-[90px] px-8 text-center
- Camera icon placeholder (use different Lucide icons per product type)
  For variety: Camera, Video, Wifi, Shield, Sun, Eye
- "Price" text in brand-primary
- Price amount bold text-2xl dark
- Product name bold
- Short description muted
- "Get Quote" button dark → /services/cctv-installation/quote?product=[id]
- FULL hover effect: bg-brand-primary, all text white, button inverts

Below grid:
Info box: "All prices shown are per unit ex. GST.
           Installation from $150. Free site assessment available."

metadata: title "CCTV Products & Prices | ${SITE_FULL}"

npm run build. Fix errors.
```

### 2C — CCTV Quote wizard + email sending

```
Most important page. Read PROJECT.md section 7 fully first.
Source file: cctv_quote_form_template__1_.html (in project root) — read it before coding.

Build src/app/services/cctv-installation/quote/page.tsx ("use client")

Add at top of file:
// CCTV-SPECIFIC QUOTE WIZARD — do not reuse for other services
// Ported from cctv_quote_form_template__1_.html

QUOTE FORM THEME: GREEN (not purple)
Primary: #0F6E56, Accent: #5DCAA5, Tint: #E1F5EE
(The rest of the site is purple-blue but this form uses the original green)

PORT EXACTLY from the HTML template:

HEADER (replace "SecureVision Australia" with SITE_FULL from site.ts):
- Green #0F6E56 square logo box with ShieldCheck icon (white)
- SITE_NAME + SITE_SUFFIX text beside it
- This updates automatically when business name changes

5-SEGMENT PROGRESS BAR:
- Gray segments → green #5DCAA5 (done) / #0F6E56 (active)
- Transitions with 0.3s ease

STATE (useState):
const [step, setStep] = useState(0)
const [ptype, setPtype] = useState<string|null>(null)
const [solutions, setSolutions] = useState<string[]>([])
const [quantities, setQuantities] = useState({ cctv:1, alarm:1, access:1, intercom:1, perimeter:1, smoke:1 })
const [timing, setTiming] = useState<string|null>(null)
const [contact, setContact] = useState({ fname:"", lname:"", email:"", phone:"", suburb:"", source:"" })
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(false)

STEP 1 — Property type (4 option tiles, single select)
STEP 2 — Solutions (6 checkbox tiles, multi-select, show price hint)
STEP 3 — Quantities (+/- counters, show only selected solutions)
STEP 4 — Install timing (4 option tiles, single select)
STEP 5 — Contact form + live quote summary
  Fields: First name, Last name, Email, Phone, Suburb/Postcode, Source dropdown
  Live summary card (rebuilds on any quantity change):
    - Each selected item: label × qty = $amount
    - Installation & labour: $150
    - Subtotal ex GST: $X
    - GST (10%): $X
    - Total (AUD): $X (bold)
    - "Valid 30 days · GST included" green badge

PRICING — import from cctv-products.ts (shared source):
  { cctv:299, alarm:799, access:499, intercom:349, perimeter:599, smoke:149 }
  installFee=150, gstRate=0.10

VALIDATION (match template):
  Step 0: ptype required
  Step 1: at least one solution
  Step 3: timing required
  Step 4: fname, email, phone required

ON SUBMIT — send email to customer:
1. setIsSubmitting(true)
2. POST /api/quote/cctv with full form data
3. API route builds HTML email and sends via Nodemailer to customer's email
4. Show success screen (match template: green checkmark, "Quote sent successfully!")
5. setIsSubmitted(true)

BUILD THE API ROUTE: src/app/api/quote/cctv/route.ts
  - Receives: contact details + selections + quantities + calculated totals
  - Builds HTML email (table layout, itemised quote)
  - Sends to customer's email (contact.email) via mailer.ts
  - Also saves lead to leads store
  - Email subject: "Your CCTV Security Quote from ${SITE_FULL}"
  - Email body: professional HTML, includes all items, totals, "valid 30 days",
    team followup promise, SITE_PHONE + SITE_EMAIL at bottom

SUCCESS SCREEN (match template exactly):
  - Green circle with checkmark (#E1F5EE bg, #0F6E56 icon)
  - "Quote sent successfully!"
  - "Your personalised quote has been emailed to you."
  - "Our team will also follow up within 1 business day."
  - Green "Quote valid for 30 days" badge

metadata: title "Get a CCTV Quote | ${SITE_FULL}"

Test: complete all 5 steps and verify email arrives at test address.
npm run build. Fix all errors. Tell me when quote is working end-to-end.
```

---

## DAY 3 — Car Rental + IT Services

### 3A — Car Rental (Morning)

```
Day 3. Build Car Rental pages. Match Stitch screen 1d6a928075a34a59a731f2ee0916f2fa.

src/app/services/car-rental/page.tsx
  Hero: "FLEXIBLE CAR RENTAL ACROSS AUSTRALIA" — accent word brand-primary
  CTAs: "View Vehicles" + "Get a Quote"
  Right: bg-brand-light block with Car icon (white, large)
  Features strip: Unlimited KM, Free Cancellation, 24/7 Roadside, Clean Vehicles
  Vehicles preview: top 4 from car-rental.ts — Zlymo card style
    Show daily rate in brand-primary, weekly rate below, "Book Now" button
    Full hover fill effect
  How It Works: Choose → Pick Dates → Drive Away
  QuoteCTABanner + TestimonialsStrip

src/app/services/car-rental/vehicles/page.tsx
  All vehicles from car-rental.ts
  Show daily AND weekly rates
  "Book Now" → /services/car-rental/quote

src/app/services/car-rental/quote/page.tsx "use client"
  Add comment at top:
  // CAR RENTAL QUOTE — PLACEHOLDER LOGIC
  // Owner will provide full pricing rules (insurance, km, seasonal etc.)
  // Do not guess the logic — keep placeholder until owner provides it

  Clean booking form (React Hook Form):
  - Pick-up date (date input)
  - Return date (date input)  
  - Vehicle type (select from car-rental.ts)
  - Name, Phone, Email
  - Special requests (textarea)
  - Estimated total (placeholder calc: dailyRate × days, clearly labelled "Estimate only")
  
  On submit: show "Thanks! Our team will confirm your booking within 2 hours."
  (No email sending yet for car rental — waiting for owner's pricing logic)

npm run build. Fix errors.
```

### 3B — IT Services (Afternoon)

```
Build IT Services. Match Stitch screen bb18fa27c94c4652a6772bd216c94853.

src/app/services/it-services/page.tsx
  Hero: "TECHNOLOGY SOLUTIONS FOR YOUR BUSINESS"
  3 service cards: Web Development, App Development, AI Automation
  Same Zlymo card hover style
  Each card: large icon, name, 4-5 feature bullets, "Get Consultation" button
  AI Automation highlight: full-width two-column section
  Process: Discovery → Design → Build → Launch
  QuoteCTABanner + TestimonialsStrip

3 subpages (each with their own hero + features + contact CTA):
src/app/services/it-services/web-development/page.tsx
src/app/services/it-services/app-development/page.tsx
src/app/services/it-services/ai-automation/page.tsx

Each subpage:
  - Hero with service-specific headline
  - Detailed feature list or benefit cards
  - Process steps
  - Simple contact/enquiry form (name, email, project description)
  - On submit: show "We'll be in touch within 1 business day"
  - QuoteCTABanner

npm run build. Fix errors.
```

---

## DAY 4 — Contact, About, Dashboard, Polish

### 4A — Contact + About (Morning)

```
src/app/contact/page.tsx
Match Stitch screen dfb02fae12e3455697b33366eafd3983.

Two-column layout:
LEFT: Contact form (white card, shadow, 20px radius)
  React Hook Form: Name, Email, Phone, Service (select all services), Message
  On submit: POST /api/contact (save to leads, send confirmation email to user)
  Success: "Thanks! We'll be in touch within 1 business day."

RIGHT:
  SITE_PHONE, SITE_EMAIL, SITE_ADDRESS (all from site.ts)
  SITE_HOURS
  4 social icon links (placeholders)

Map placeholder: full-width grey div "Service Area: Australia Wide"

src/app/about/page.tsx
  Hero: "ABOUT US"
  Two col: image placeholder + company story
  Mission: full-width brand-primary banner white text
  Team: 3 placeholder cards (name, role, initials avatar circle)
  Values: 4 cards (Integrity, Quality, Speed, Support)
  QuoteCTABanner

npm run build. Fix errors.
```

### 4B — Dashboard (Late morning)

```
src/app/dashboard/page.tsx "use client"
Match Stitch screen 47e2f4daaefd4f51851aa58e48947d88.

PASSWORD GATE (client-side):
  If no auth in localStorage: show password input screen (centered card)
  Compare to process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD
  Correct: set localStorage "dash_auth"=true, show dashboard
  Wrong: show error "Incorrect password"

LAYOUT after auth:
  Sidebar: bg-brand-dark (#2d2d2c), 260px, logo + nav tabs
  Main: white/light grey content area

4 TABS:
1. Products — table of cctvProducts: Name | Price (editable input) | Save button
   // TODO(dashboard): wire Save to API route that writes to cctv-products.ts

2. Vehicles — table of vehicles: Name | Daily Rate (editable) | Weekly Rate | Save

3. Leads — table from GET /api/leads: Name | Phone | Email | Service | Date | Source
   Empty state: "No leads yet. They appear here when customers contact you."

4. Settings — display SITE_NAME, SITE_DOMAIN, SITE_EMAIL (read-only for now)
   "To update: edit src/data/site.ts or run the rename script"

metadata: { robots: "noindex, nofollow" }
title: "Dashboard | ${SITE_FULL}"

npm run build. Fix errors.
```

### 4C — Polish + README + Deploy (Afternoon)

```
Final polish pass.

1. MOBILE AUDIT (check every page at 375px):
   - h1 text-[40px] on mobile (80px desktop)
   - Section titles text-[28px] on mobile (45px desktop)
   - All grids: 1 column on mobile
   - SidePanel: touch-friendly
   - AI chat bubble: doesn't block content
   - Product cards: full width on mobile (remove 80px radius → 24px on mobile)

2. RESPONSIVE BREAKPOINTS:
   Add to all section grids:
   "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   Hero: "flex-col lg:flex-row"
   Footer: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

3. SEO — verify every page has:
   Unique title with SITE_FULL
   Unique meta description
   Add to root layout: og:title, og:description, og:site_name from site.ts

4. README.md — create/update with:
   ## What this is
   ## How to run locally (npm install && npm run dev)
   ## Changing the business name
     "Edit SITE_NAME in src/data/site.ts — the entire site updates automatically.
      Or use the rename script: npx ts-node scripts/rename.ts "Name" "domain.com.au""
   ## Updating prices
     "Edit src/data/cctv-products.ts or src/data/car-rental.ts"
   ## Setting up email (CCTV quotes)
     Step-by-step Gmail app password setup
   ## Setting up the AI agent
     Add ANTHROPIC_API_KEY to Vercel environment variables
   ## Deploying to Vercel
     Push to GitHub → import at vercel.com → add env vars → deploy
   ## Adding a new service
     "Add to src/data/services.ts and create src/app/services/[name]/page.tsx"

5. Final build:
   npm run build
   Fix ALL errors AND warnings

6. Commit:
   git add .
   git commit -m "Complete website — all pages, AI agent, CCTV email quotes, dashboard"

Tell me final build result and share any remaining warnings.
```

---

## After each session — short update prompt

After ANY session, when I say "it's done" or "move forward":
```
1. Confirm npm run build passes (zero errors)
2. Tell me what was built (one sentence per component/page)
3. Ask: "Ready to push to GitHub, or continue to next session?"
```

When I provide car rental quote logic later:
```
I have the car rental quote logic. Here it is: [paste logic]
Replace the placeholder in src/app/services/car-rental/quote/page.tsx
with this real logic. Keep the same form fields but update the calculation.
Also update the API route to send a confirmation email (same pattern as CCTV).
```
