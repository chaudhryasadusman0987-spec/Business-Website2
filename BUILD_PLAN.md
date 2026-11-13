# BUILD_PLAN.md — Current State & Remaining Work

> Single source of truth for "what's done / what's next".
> Each work session ends with `npm run build` (zero errors) before moving on.
> Last updated: 2026-11-07.

---

## ✅ COMPLETED (live on pakozsolutions.com.au)

**Foundation**
- ✅ Next.js 14 + TypeScript + Tailwind v3, `src/` dir, Poppins, brand colours
- ✅ Business name system — everything reads from `src/data/site.ts` (Pak Oz Solutions)
- ✅ Logo (BrandLogo) in navbar, footer, favicon; mobile menu redesign
- ✅ Neon Postgres (products, packages, vehicles, rentals), KV (leads, promos)

**Home, About, Contact, Testimonials, Blog**
- ✅ `/`, `/about`, `/contact` (→ `/api/contact`), `/testimonials`, `/blog`, `/blog/[slug]`
- ✅ Google reviews integration (inactive until GBP + API key are set)

**AI agent** (every page)
- ✅ Gemini `gemini-2.5-flash` chat, lead capture, offers IT WhatsApp for IT enquiries

**Security Solutions (Pak Oz CCTV)**
- ✅ Landing, 6 solution pages, suburb area pages, products catalog (DB)
- ✅ Security packages (dashboard bundle builder, auto image collage)
- ✅ 5-step quote wizard (solution + package mode), honours dashboard promos

**Car Rental (Pak Oz Rentals)**
- ✅ Landing with live "available now" badges, fleet in Postgres (available / coming soon / hidden)
- ✅ Vehicle modal + 3-step rental application, price negotiation / counter-offers
- ✅ Stripe card + BECS direct debit (preferred), subscriptions, optional bond,
  bank transfer / PayID, weekly reminder cron, return + pro-rated refund
- ✅ Lease agreements: terms checkbox, full terms page, admin generator, e-signature, signed PDF
- ✅ Chargeback protection: pending_payment flow, rental_files, evidence PDF, Stripe dispute submit

**IT Services (Pak Oz Technologies)**
- ✅ Landing, web / app / AI automation pages, portfolio ("Our Work"), project brief quote + estimate

**Admin**
- ✅ `/dashboard` (server-side auth) — products, packages, vehicles, offers, active rentals,
  IT services, discounts, leads, enquiries
- ✅ `/rental-admin` — vehicles, rentals, price offers, agreements, disputes, leads

**SEO + security**
- ✅ Sitemap, robots, canonicals, JSON-LD (LocalBusiness, Service, Breadcrumb, FAQ, BlogPosting), OG image
- ✅ Rate limits, email HTML escaping, server-side admin sessions

---

## 🚧 IN PROGRESS

- **Lead finder** (`/lead-finder`, separate password `LEAD_FINDER_PASSWORD`) on branch `lead-finder` — prospect search,
  AI scoring, saved prospects in separate Neon db (`LEADS_URL`). Test, then merge to `master`.

## ⏳ REMAINING / BUSINESS-SIDE

- ABN registered (53 700 444 695) → `COMPANY_ABN` in `site.ts`
- Verify Google Business Profile → set `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`
  in Vercel, swap the temp Google review link
- Enable BECS on the Stripe account → `STRIPE_BECS_ENABLED=true`

---

## ORIENTATION PROMPT (paste at the start of any new session)

```
Read all docs in the project root before writing code:
PROJECT.md, BUILD_PLAN.md, CODING_STYLE.md, AI_AGENT.md, SKILLS.md

Key facts to confirm back to me:
1. Business name lives ONLY in src/data/site.ts (never hard-code it).
2. AI agent = Google Gemini (gemini-2.5-flash, GEMINI_API_KEY) — NOT Anthropic.
3. Data: Neon Postgres (DATABASE_URL) for catalog/fleet/rentals, KV for leads/promos,
   LEADS_URL only for lead finder. Vercel FS is read-only.
4. .env.local DATABASE_URL is the LIVE db — clean up any test rows.
5. New admin API routes go in PROTECTED in middleware.ts.
6. Service landing pages use the dark #0d0d1a hero; quote forms use GREEN #0F6E56.
End every session with `npm run build` and report the result.
```

---

## PUSH TO GITHUB (Vercel auto-deploys)

```bash
git add .
git commit -m "<what changed>"
git push origin master
```
Vercel redeploys automatically in ~60 seconds. Confirm the deployment shows
**Ready**, then hard-refresh (Ctrl+Shift+R). Env vars are not in git — set them in
Vercel and redeploy after any change.
