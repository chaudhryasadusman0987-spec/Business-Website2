# CODING_STYLE.md — Code Conventions

> Follow every rule here on every file. These are not suggestions.

---

## 1. Imports — always first in every component

```tsx
// External libraries
import { useState } from "react"
import { motion } from "framer-motion"
import { Camera } from "lucide-react"

// Internal — data (use named imports only)
import { SITE_FULL, SITE_NAME, SITE_SUFFIX, SITE_PHONE, SITE_EMAIL } from "@/data/site"
import { cctvProducts, installFee, gstRate } from "@/data/cctv-products"

// Internal — components
import Button from "@/components/ui/Button"
import SectionTitle from "@/components/ui/SectionTitle"
```

**RULE:** Never import SITE_FULL, SITE_NAME etc from anywhere except `@/data/site`.
**RULE:** Never use Anthropic SDK in client components — only in `src/app/api/*/route.ts`.

---

## 2. Business name — zero tolerance rule

```tsx
// ❌ NEVER — hard-coded name
<h1>AuzServ Australia</h1>
<p>Contact us at info@auzserv.com.au</p>
<title>AuzServ | CCTV Installation</title>

// ✅ ALWAYS — from site.ts
import { SITE_FULL, SITE_EMAIL } from "@/data/site"
<h1>{SITE_FULL}</h1>
<p>Contact us at {SITE_EMAIL}</p>
export const metadata = { title: `${SITE_FULL} | CCTV Installation` }
```

---

## 3. Tailwind color classes — use brand-* only

```tsx
// ❌ Never use default Tailwind purple/violet
<div className="bg-purple-500 text-violet-600">

// ✅ Always use brand-* from tailwind.config.ts
<div className="bg-brand-primary text-white">
<div className="bg-brand-card hover:bg-brand-primary">
<footer className="bg-brand-footer">
```

---

## 4. Card hover effect (Zlymo spec — exact implementation)

```tsx
// Every service/product card — copy this pattern exactly
<div className="group bg-brand-card rounded-[80px] p-16 text-center
                cursor-pointer transition-all duration-500
                hover:bg-brand-primary">

  {/* Icon — changes color on hover */}
  <div className="text-brand-primary group-hover:text-white
                  transition-colors duration-500 mb-4">
    <Camera size={80} />
  </div>

  {/* Price label */}
  <p className="text-brand-primary font-medium group-hover:text-white
                transition-colors duration-500">
    Price
  </p>

  {/* Price amount */}
  <p className="text-[#363636] font-bold text-2xl group-hover:text-white
                transition-colors duration-500">
    {formatAUD(product.price)}
  </p>

  {/* Unit label — NEW row below the price (e.g. "per camera", "per door") */}
  <p className="text-[12px] text-gray-400 group-hover:text-white/70 mt-1
                transition-colors duration-500">
    {product.unit}
  </p>

  {/* Product name */}
  <h3 className="text-[#363636] font-bold text-xl mt-2 group-hover:text-white
                 transition-colors duration-500">
    {product.name}
  </h3>

  {/* "Get Quote" — Link to the security quote, carrying solution + product */}
  <Link
    href={`/services/security-solutions/quote?solution=${solution.id}&product=${product.id}`}
    className="inline-block mt-6 bg-brand-dark text-brand-text px-8 h-[42px]
               leading-[42px] rounded-[5px] text-[14px]
               group-hover:bg-white group-hover:text-brand-dark
               transition-all duration-500">
    Get Quote
  </Link>
</div>
```

> The real implementation lives in `src/components/sections/SecurityProductCard.tsx`.
> The product-card href is ALWAYS `/services/security-solutions/quote?solution=X&product=Y`
> — never the old `/services/cctv-installation/...` URL.

---

## 4b. Dark hero pattern — REQUIRED for ALL service landing pages

Every service landing page (Security Solutions ✅, and future Car Rental + IT
Services) MUST use this dark hero treatment. Reference implementation:
`src/components/sections/SecuritySolutionsHero.tsx` (and the home `HeroSection.tsx`).

```tsx
<section className="relative overflow-hidden bg-[#0d0d1a]">
  {/* Layer 1 — dot grid */}
  <div className="absolute inset-0 z-0 pointer-events-none" style={{
    backgroundImage:
      "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
    backgroundSize: "36px 36px",
  }} />
  {/* Layer 2 — purple glow top-right */}
  <div className="absolute z-0 w-[500px] h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
       style={{ background: "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)" }} />
  {/* Layer 3 — teal glow bottom-left (home hero) */}
  <div className="absolute z-0 w-[300px] h-[300px] rounded-full bottom-[-60px] left-[-40px] pointer-events-none"
       style={{ background: "radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 65%)" }} />

  <div className="relative z-10 max-w-[1170px] mx-auto px-4 py-20 lg:py-28">
    {/* left: badge + h1 + sub + buttons   |   right: #8187fa block or hero.jpg */}
  </div>
</section>
```

Rules: bg `#0d0d1a`, dot grid + purple glow (+ teal glow on home), content in a
`max-w-[1170px]` container, `z-10` above the decorative layers.

---

## 4c. Solution card pattern — Security Solutions landing grid

DIFFERENT from the product card. Used on `/services/security-solutions`. Reference:
`src/components/sections/SolutionCard.tsx`. Note `rounded-[40px]` (NOT `[80px]`),
the lift-on-hover, and the data-driven icon colours passed as **CSS variables**
(so `group-hover` can still override them — plain inline `style` colour would win
over `group-hover` and break the effect).

```tsx
<Link
  href={`/services/security-solutions/${solution.slug}`}
  className="group relative block bg-[#f7f7f7] rounded-[40px] p-10 text-center
             cursor-pointer transition-all duration-500 hover:bg-[#7f85f7]
             hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(127,133,247,0.3)]">

  {/* Icon box — colour from data via --ibg / --ic CSS vars */}
  <div className="w-16 h-16 rounded-[16px] mx-auto mb-5 flex items-center justify-center
                  [background-color:var(--ibg)] group-hover:bg-white/20 transition-all duration-500"
       style={{ "--ibg": solution.iconBg } as React.CSSProperties}>
    <span className="flex [color:var(--ic)] group-hover:text-white transition-colors duration-500"
          style={{ "--ic": solution.iconColor } as React.CSSProperties}>
      <SolutionIcon name={solution.icon} size={32} />
    </span>
  </div>

  <h3 className="font-bold text-[20px] text-[#1a1a2e] group-hover:text-white
                 transition-colors duration-500 mt-2">{solution.name}</h3>
  <p className="text-brand-primary font-medium text-[13px] mt-1
                group-hover:text-white/80 transition-colors duration-500">{solution.tagline}</p>
  <p className="text-[14px] text-gray-500 mt-3 leading-relaxed
                group-hover:text-white/80 transition-colors duration-500">{solution.description}</p>

  {/* Product count badge */}
  <span className="mt-4 inline-flex items-center gap-1 bg-white/60 group-hover:bg-white/20
                   rounded-full px-3 py-1 text-[12px] text-gray-600 group-hover:text-white
                   transition-all duration-500">
    {solution.products.length} products available
  </span>

  {/* Arrow bottom-right */}
  <ArrowRight size={18} className="absolute bottom-6 right-6 text-gray-300
              group-hover:text-white/60 transition-colors duration-500" />
</Link>
```

---

## 4d. Navbar dropdown pattern (CSS group-hover, no JavaScript)

The top nav (`src/components/layout/Header.tsx`) is a purple bar
`bg-[rgba(127,133,247,0.95)]`, sticky, blur. The Services dropdown opens on hover
with `group` / `group-hover` — no state, no JS:

```tsx
<div className="relative group inline-block">
  <Link href="/#services" className="... flex items-center gap-1">
    Services
    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
  </Link>

  {/* Panel: hidden until hover */}
  <div className="absolute top-full left-0 mt-1 bg-white rounded-[12px] shadow-xl
                  border border-gray-100 py-2 min-w-[200px]
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 z-50">
    {/* 3 services, each an icon tile + title + sub: */}
    {/* Security Solutions → /services/security-solutions  (orange icon tile)  */}
    {/* Car Rental         → /services/car-rental          (green icon tile)   */}
    {/* IT & AI Services    → /services/it-services         (purple icon tile)  */}
  </div>
</div>
```

A separate **Plus (+) menu** on the right uses the same `group-hover` pattern for
Testimonials + Contact Us.

---

## 5. Typography (exact Zlymo values)

```tsx
// Section title (titlepage h2)
<h2 className="text-[45px] font-bold uppercase text-[#2f2f2f]
               leading-tight tracking-tight">
  OUR SERVICES
</h2>

// Hero h1
<h1 className="text-[80px] lg:text-[80px] text-[40px] font-bold
               leading-[90px] text-[#2d2d2c]">
  Securing <span className="text-brand-primary">Australia</span>
</h1>

// Body
<p className="text-[17px] leading-[28px] text-[#232222]">

// Muted
<p className="text-[14px] text-[#666666]">
```

---

## 6. Section wrapper pattern

```tsx
<section className="pt-[200px] bg-brand-section">
  <div className="max-w-[1170px] mx-auto px-4">
    {/* content */}
  </div>
</section>

{/* Wide section (1500px) */}
<section className="pt-[200px] bg-brand-section">
  <div className="max-w-[1500px] mx-auto px-4">
    {/* content */}
  </div>
</section>
```

---

## 7. Button component (src/components/ui/Button.tsx)

```tsx
type Variant = "dark" | "outline" | "accent"

// dark    → bg-brand-dark text-brand-text hover:bg-brand-primary hover:text-white
// outline → border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-brand-text
// accent  → bg-brand-primary text-white hover:opacity-90

// All: rounded-[5px] text-[17px] font-medium px-10 h-[69px] transition-all duration-500
// If href → render as Next.js <Link>
// If onClick → render as <button>
```

---

## 8. Page metadata (every page file)

```tsx
import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `CCTV Installation | ${SITE_FULL}`,
  description: "Professional CCTV installation across Australia. " +
               "Free site assessment. Licensed installers.",
}
```

---

## 9. Currency formatting

```ts
// src/lib/formatters.ts — use this everywhere, never inline
export function formatAUD(amount: number): string {
  return `$${amount.toLocaleString("en-AU")}`
}
// → "$1,234" (no decimal for whole numbers)
```

---

## 9b. QUOTE FORMS USE GREEN — NOT PURPLE

The whole site is purple-blue (`#7f85f7`). **Quote forms are the exception — they
use GREEN.** This applies to `/services/security-solutions/quote` and any future
service quote page.

```
GREEN palette (quote forms only):
  primary  #0F6E56
  accent   #5DCAA5
  tint     #E1F5EE   (selected tiles, success badge bg)
  dark     #085041   (hover / badge text)
```

Progress bar: done = `#5DCAA5`, active = `#0F6E56`. Continue/submit buttons:
`bg-[#0F6E56] hover:bg-[#085041]`. Do NOT use `brand-primary` purple inside a
quote form.

---

## 9c. AI chat route — Google Gemini (NOT Anthropic)

`src/app/api/chat/route.ts` uses `@google/generative-ai`. Key points:

```tsx
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: buildSystemPrompt(),
})

// Gemini uses role "model" (not "assistant"); history must START with a user turn
const history = messages.slice(0, -1).map((m) => ({
  role: m.role === "assistant" ? "model" : "user",
  parts: [{ text: m.content }],
}))
while (history.length && history[0].role === "model") history.shift()

const chat = model.startChat({ history })
const result = await chat.sendMessage(messages[messages.length - 1].content)
const reply = result.response.text()
// return { reply: cleanReply, leadCollected }
```

Never use `@anthropic-ai/sdk`, `claude-*` models, or `ANTHROPIC_API_KEY`.

---

## 10. What NEVER to do

```
❌ style={{ color: "#7f85f7" }}         → use className="text-brand-primary"
❌ import styles from "*.module.css"    → Tailwind only
❌ "AuzServ" anywhere in JSX           → import SITE_FULL from "@/data/site"
❌ price = 299 in component            → import from "@/data/cctv-products"
❌ import Anthropic in component       → only in API routes
❌ <img src="...">                     → use next/image <Image>
❌ type: any                           → define proper interface in src/types/
❌ component > 150 lines               → split into smaller components
❌ @import url() in CSS                → use next/font/google
❌ bg-purple-* or text-violet-*        → use bg-brand-primary etc
❌ process.env.ANTHROPIC_API_KEY      → use GEMINI_API_KEY (agent is Gemini)
❌ @anthropic-ai/sdk / claude-* model → use @google/generative-ai, gemini-2.5-flash
❌ /services/cctv-installation         → use /services/security-solutions
❌ rounded-[80px] on solution cards   → solution cards use rounded-[40px]
                                         (product cards still use rounded-[80px])
```
