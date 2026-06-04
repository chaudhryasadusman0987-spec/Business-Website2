# CONTEXT.md — Project Quick Reference

Condensed summary. Replaces reading PROJECT.md, CODING_STYLE.md, SKILLS.md each
session. Australia-based multi-service business site (CCTV, car rental, web/app/AI).

## Business name rule
NEVER hard-code the name/domain/email — import `SITE_FULL`, `SITE_NAME`, `SITE_EMAIL`, `SITE_PHONE` from `@/data/site` (the one place to change it).

## Tech stack
Next.js 14 (App Router, `src/`, TS) · Tailwind v3 (`brand-*` colors) · Poppins (next/font) · Lucide · Nodemailer · React Hook Form · Vercel · data in `src/data/*.ts` (no DB).

## Brand colors
- `brand-primary` `#7f85f7` — accent, all hovers/highlights
- `brand-light` `#8187fa` — hero colored block
- `brand-dark` `#2d2d2c` — default button bg
- `brand-text` `#dee4fd` — default button text
- `brand-card` `#f7f7f7` — service/product cards
- `brand-footer` `#252525` — footer (section bg `#fefefd`, panel `#111`)

## Routes — DONE
- `/` Home
- `/services/security-solutions` + `/[slug]` (6) + `/products` + `/quote`
- `/services/car-rental` + `/vehicles` + `/quote`
- `/services/it-services` + `/web-development` + `/app-development` + `/ai-automation`
- `/dashboard` (admin)
- API: `/api/chat`, `/api/leads`, `/api/quote/security`, `/api/quote/car-rental`

## Routes — TODO
- `/about`
- `/contact` (CTAs already point here — currently 404)
- `/testimonials` (component exists, no page)
- `/blog`

## Card hover rule
`group` card: on hover bg fills `brand-primary`, ALL text/icons → white, button inverts to white bg + dark text; `transition-all duration-500`. Service/solution cards `rounded-[40px]`, product cards `rounded-[80px]`.

## Quote form colors (GREEN, not purple)
- primary `#0F6E56`
- accent `#5DCAA5`
- tint `#E1F5EE` (selected tiles, success badge)
- dark `#085041` (hover / badge text)

## AI model
Google Gemini `gemini-2.5-flash` via `@google/generative-ai`, server-only. Env: `GEMINI_API_KEY`. Role map `assistant→model`; history must start with a `user` turn.

## NEVER do
- Hard-code business name / domain / email / phone in JSX (use `@/data/site`).
- Use `@anthropic-ai/sdk`, `claude-*`, or `ANTHROPIC_API_KEY` (agent is Gemini).
- Use `bg-purple-*` / `text-violet-*` or inline `style` for brand color (use `brand-*` classes; data-driven colors via CSS vars).
- Use `<img>` (use next/image `<Image>`) or `type: any` (define interfaces).
- Link to `/services/cctv-installation` (use `/services/security-solutions`).
