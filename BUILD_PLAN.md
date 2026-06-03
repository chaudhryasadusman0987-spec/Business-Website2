# BUILD_PLAN.md — Current State & Remaining Work

> Single source of truth for "what's done / what's next".
> Each work session ends with `npm run build` (zero errors) before moving on.

---

## ✅ COMPLETED (verified in `src/app/`)

**Foundation**
- ✅ Next.js 14 + TypeScript + Tailwind v3 scaffold, `src/` dir
- ✅ Brand colours in `tailwind.config.ts` (brand.primary `#7f85f7`, etc.)
- ✅ Poppins via `next/font/google`, applied in `src/app/layout.tsx`
- ✅ Data layer: `site.ts`, `services.ts`, `security-solutions.ts`,
  `cctv-products.ts` (shim), `car-rental.ts`, `it-services.ts`,
  `testimonials.ts`, `navigation.ts`
- ✅ `src/types/index.ts`, `src/lib/formatters.ts` (`formatAUD`, `calcCCTVQuote`),
  `src/lib/mailer.ts`, `src/lib/agent-prompt.ts`, `src/lib/solution-icons.tsx`

**Home page** (`/`)
- ✅ Dark hero (`HeroSection.tsx`) — `#0d0d1a`, Brisbane `hero.jpg`, 3 service pills
- ✅ `ServicesGrid`, `AboutStrip`, `WhyChooseUs`, `TestimonialsStrip`, `QuoteCTABanner`
- ✅ Top navbar (`Header.tsx`) — purple bar, Services dropdown, Plus menu, mobile slide-out
- ✅ `Footer.tsx`

**AI agent** (every page)
- ✅ `AIChatBubble.tsx` floating widget
- ✅ `/api/chat` — Google **Gemini** `gemini-2.5-flash` (`GEMINI_API_KEY`)
- ✅ `/api/leads` — saves to `data/leads.json` (GET returns all)

**Security Solutions hub** (renamed from CCTV Installation)
- ✅ `/services/security-solutions` — dark hero + 6 solution cards + How It Works + CTA + testimonials
- ✅ `/services/security-solutions/[slug]` — dynamic detail, 6 SSG pages
  (surveillance-evidence, deterrence, commercial-security, access-control, smoke-alarms, intercoms)
- ✅ `/services/security-solutions/products` — all products grouped by solution
- ✅ `/services/security-solutions/quote` (+ `layout.tsx`) — 5-step GREEN wizard
- ✅ `/api/quote/security` — emails customer + logs lead
- ✅ `next.config.mjs` redirect: `/services/cctv-installation*` → `/services/security-solutions*`
- ✅ Shared components: `SolutionCard`, `SecurityProductCard`, `SecuritySolutionsHero`, `HowItWorks`

---

## ⏳ REMAINING

### Day 3A — Car Rental
Data already exists in `car-rental.ts`. Build:
- `/services/car-rental` — dark hero (REQUIRED pattern), features, vehicle preview (Zlymo cards), How It Works, CTA + testimonials
- `/services/car-rental/vehicles` — all vehicles, daily + weekly rates
- `/services/car-rental/quote` (`"use client"`) — **PLACEHOLDER** booking form only
  (no email yet). Show "We'll be in touch within 2 hours." Do NOT guess pricing logic.

### Day 3B — IT Services
Data in `it-services.ts`. Build:
- `/services/it-services` — dark hero, 3 service cards, process steps, CTA
- `/services/it-services/web-development`
- `/services/it-services/app-development`
- `/services/it-services/ai-automation`
  (each: hero + features + process + simple enquiry form)

### Day 4A — Contact + About
- `/contact` — form (Name, Email, Phone, Service, Message) → `/api/contact` (save lead + confirm email); contact details from `site.ts`
- `/about` — story, mission banner, team, values, CTA
- (Also still missing: `/testimonials` page, `/blog` placeholder)

### Day 4B — Dashboard
- `/dashboard` (`"use client"`) — password gate (`NEXT_PUBLIC_DASHBOARD_PASSWORD`)
- **Products tab = 6-solution tabs** (Surveillance, Deterrence, Commercial,
  Access Control, Smoke Alarms, Intercoms). Each tab → table:
  `Product | Price (editable) | Unit | In Stock toggle | Save`
  `// TODO(dashboard): wire Save to an API route that updates security-solutions.ts`
- Tabs: Products | Car Rental rates | Leads (`GET /api/leads`) | Settings (read-only site.ts)
- `metadata: { robots: "noindex, nofollow" }`

### Day 4C — Polish + README + Deploy
- Mobile audit at 375 / 768 / 1280px
- SEO: unique title + description per page; OG tags in root layout
- Update `README.md`: run locally, rename business, update prices, SMTP (Gmail app
  password), **Gemini key setup**, Vercel deploy + env vars
- Final `npm run build` (zero errors AND warnings), then commit + push

---

## ORIENTATION PROMPT (paste at the start of any new session)

```
Read all docs in the project root before writing code:
PROJECT.md, BUILD_PLAN.md, CODING_STYLE.md, AI_AGENT.md, SKILLS.md

Key facts to confirm back to me:
1. Business name lives ONLY in src/data/site.ts (never hard-code it).
2. AI agent = Google Gemini (gemini-2.5-flash, GEMINI_API_KEY) — NOT Anthropic.
3. Security section = "Security Solutions" hub with 6 solutions
   (data in src/data/security-solutions.ts; cctv-products.ts is a shim).
4. Service landing pages use the dark #0d0d1a hero; quote forms use GREEN #0F6E56.
5. Product cards link to /services/security-solutions/quote?solution=X&product=Y.
6. What is the next ❌ item in BUILD_PLAN.md? Start there. Do not skip ahead.
End every session with `npm run build` and report the result.
```

---

## WHEN OWNER PROVIDES CAR RENTAL LOGIC (paste when ready)

```
I have the car rental quote logic. Here it is: [paste pricing rules]
Replace the placeholder in src/app/services/car-rental/quote/page.tsx with this
real logic. Keep the same form fields but update the calculation. Add an
/api/quote/car-rental route that emails a confirmation (same pattern as
/api/quote/security, but car-rental wording). Run npm run build.
```

---

## PUSH TO GITHUB (Vercel auto-deploys)

```bash
git add .
git commit -m "<what changed>"
git push origin master
```
Vercel redeploys automatically in ~60 seconds. Confirm the new deployment shows
**Ready** in the Vercel dashboard, then hard-refresh (Ctrl+Shift+R) to bypass cache.
Remember to set env vars in Vercel (GEMINI_API_KEY + SMTP_*) — they are not in git.
