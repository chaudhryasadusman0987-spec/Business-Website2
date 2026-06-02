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
    $299
  </p>

  {/* Product name */}
  <h3 className="text-[#363636] font-bold text-xl mt-2 group-hover:text-white
                 transition-colors duration-500">
    HD Camera
  </h3>

  {/* Button — inverts on hover */}
  <button className="mt-6 bg-brand-dark text-brand-text px-8 h-[38px]
                     rounded-[5px] text-[15px] font-normal
                     group-hover:bg-white group-hover:text-brand-dark
                     transition-all duration-500">
    Buy Now
  </button>
</div>
```

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
```
