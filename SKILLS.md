# SKILLS.md — Code Patterns & Snippets

> Copy these patterns exactly. Don't invent alternatives.

---

## 1. TypeScript interfaces (src/types/index.ts)

```ts
export interface Service {
  id: string; name: string; description: string
  href: string; iconName: string; comingSoon: boolean
}
export interface CCTVProduct {
  id: string; name: string; description: string
  price: number; category: string; inStock: boolean
}
export interface Vehicle {
  id: string; name: string; description: string
  dailyRate: number; weeklyRate: number
  passengers: number; features: string[]
}
export interface ITService {
  id: string; name: string; description: string
  features: string[]; startingFrom: string; iconName: string
}
export interface Testimonial {
  id: string; name: string; suburb: string; state: string
  rating: number; text: string; service: string; date: string
}
export interface Lead {
  id: string; name: string; phone: string; email: string
  service: string; message: string; timestamp: string
  page: string; source: "ai_chat"|"quote_form"|"contact_form"
}
export interface Message {
  role: "user"|"assistant"; content: string
}
export interface NavLink {
  label: string; href: string
}
```

---

## 2. Zlymo card pattern (copy exactly)

```tsx
<div className="group bg-brand-card rounded-[80px] py-[90px] px-8 text-center
                cursor-pointer transition-all duration-500 hover:bg-brand-primary">
  <div className="flex justify-center mb-6 text-brand-primary
                  group-hover:text-white transition-colors duration-500">
    <Camera size={80} />
  </div>
  <p className="text-brand-primary font-medium group-hover:text-white
                transition-colors duration-500 leading-tight">
    Price<br/>
    <span className="text-[#363636] font-bold text-2xl
                     group-hover:text-white transition-colors duration-500">
      {formatAUD(product.price)}
    </span>
  </p>
  <h3 className="text-[#363636] font-bold text-xl mt-3 group-hover:text-white
                 transition-colors duration-500">
    {product.name}
  </h3>
  <p className="text-gray-500 text-sm mt-2 group-hover:text-white/80
                transition-colors duration-500">
    {product.description}
  </p>
  <Link href={`/services/cctv-installation/quote?product=${product.id}`}
    className="inline-block mt-6 bg-brand-dark text-brand-text px-8 h-[38px]
               leading-[38px] rounded-[5px] text-[15px]
               group-hover:bg-white group-hover:text-brand-dark
               transition-all duration-500">
    Buy Now
  </Link>
</div>
```

---

## 3. Hero section pattern

```tsx
<section className="min-h-screen flex items-center bg-brand-section">
  <div className="max-w-[1170px] mx-auto px-4 w-full">
    <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
      {/* Left */}
      <div className="flex-1 lg:w-[60%]">
        <p className="text-brand-primary text-sm font-semibold uppercase
                      tracking-widest mb-4">
          Australia's Multi-Service Experts
        </p>
        <h1 className="text-[40px] lg:text-[80px] font-bold
                       leading-tight lg:leading-[90px] text-[#2d2d2c] mb-6">
          Securing <span className="text-brand-primary">Australia</span>
        </h1>
        <p className="text-[17px] leading-[28px] text-[#666666] mb-8 max-w-lg">
          {SITE_TAGLINE}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="dark" href="/contact">Get Free Quote</Button>
          <Button variant="outline" href="#services">Our Services</Button>
        </div>
      </div>
      {/* Right */}
      <div className="lg:w-[40%] w-full bg-brand-light rounded-3xl
                      min-h-[400px] flex items-center justify-center">
        <div className="bg-white/20 rounded-2xl p-8 text-white text-center">
          <ShieldCheck size={120} className="mx-auto mb-4 opacity-80" />
          <p className="text-sm opacity-70">Hero Image</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 4. Sidepanel pattern

```tsx
"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/data/navigation"
import { SITE_FULL } from "@/data/site"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="bg-transparent w-full px-[15px] py-[35px] z-10 relative">
        <div className="max-w-[1170px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#2d2d2c]">
            {SITE_FULL}
          </Link>
          <button onClick={() => setOpen(true)} aria-label="Open menu"
            className="text-[#2d2d2c] hover:text-brand-primary transition-colors">
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-500
                    ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Panel */}
      <nav className={`fixed top-0 right-0 h-full w-[280px] bg-brand-panel z-[9999]
                       pt-[60px] transition-transform duration-500
                       ${open ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setOpen(false)}
          className="absolute top-4 right-6 text-white text-3xl"
          aria-label="Close menu">
          <X size={28} />
        </button>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href}
            onClick={() => setOpen(false)}
            className="block px-8 py-3 text-white text-xl
                       hover:text-brand-primary transition-colors duration-300">
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
```

---

## 5. Quote email HTML template

```ts
// src/lib/email-templates/cctv-quote.ts
import { SITE_FULL, SITE_PHONE, SITE_EMAIL } from "@/data/site"

export function buildCCTVQuoteEmail(data: {
  fname: string; lname: string; ptype: string; timing: string
  items: { label: string; qty: number; unitPrice: number; lineTotal: number }[]
  installFee: number; subtotal: number; gst: number; total: number
}): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.label}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.unitPrice}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.lineTotal}</td>
    </tr>`).join("")

  return `
  <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto">
    <div style="background:#0F6E56;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:24px">${SITE_FULL}</h1>
      <p style="color:#5DCAA5;margin:4px 0 0">CCTV Security Quote</p>
    </div>
    <div style="padding:32px">
      <p>Hi ${data.fname},</p>
      <p>Thank you for requesting a CCTV security quote. Here is your personalised estimate:</p>
      <p><strong>Property type:</strong> ${data.ptype} &nbsp;|&nbsp;
         <strong>Timeline:</strong> ${data.timing}</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <thead>
          <tr style="background:#f7f7f7">
            <th style="padding:10px;text-align:left">Item</th>
            <th style="padding:10px;text-align:center">Qty</th>
            <th style="padding:10px;text-align:right">Unit Price</th>
            <th style="padding:10px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee" colspan="3">Installation & Labour</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${data.installFee}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr><td colspan="3" style="padding:6px;text-align:right;color:#666">Subtotal (ex GST)</td>
              <td style="padding:6px;text-align:right;color:#666">$${data.subtotal}</td></tr>
          <tr><td colspan="3" style="padding:6px;text-align:right;color:#666">GST (10%)</td>
              <td style="padding:6px;text-align:right;color:#666">$${Math.round(data.gst)}</td></tr>
          <tr style="background:#E1F5EE">
            <td colspan="3" style="padding:10px;text-align:right;font-weight:bold">Total (AUD)</td>
            <td style="padding:10px;text-align:right;font-weight:bold;color:#0F6E56">
              $${Math.round(data.total)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background:#E1F5EE;border-radius:8px;padding:16px;text-align:center;margin:24px 0">
        <p style="color:#085041;font-weight:bold;margin:0">✓ Quote valid for 30 days</p>
        <p style="color:#085041;margin:4px 0 0">Our team will follow up within 1 business day.</p>
      </div>
      <p>Questions? Contact us:<br>
         📞 ${SITE_PHONE}<br>
         ✉️ ${SITE_EMAIL}</p>
      <p>Thank you for choosing ${SITE_FULL}.</p>
    </div>
  </body></html>`
}
```

---

## 6. Nodemailer setup

```ts
// src/lib/mailer.ts
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(
  to: string, subject: string, html: string
): Promise<void> {
  await transporter.sendMail({
    from: `"${SITE_FULL}" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  })
}
```

---

## 7. Formatters

```ts
// src/lib/formatters.ts
export function formatAUD(amount: number): string {
  return `$${amount.toLocaleString("en-AU")}`
}

export function calcCCTVQuote(
  solutions: string[],
  quantities: Record<string, number>,
  prices: Record<string, number>,
  installFee: number,
  gstRate: number
) {
  const items = solutions.map(s => ({
    key: s,
    qty: quantities[s] || 1,
    unitPrice: prices[s],
    lineTotal: prices[s] * (quantities[s] || 1),
  }))
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0) + installFee
  const gst = subtotal * gstRate
  const total = subtotal + gst
  return { items, subtotal, gst, total }
}
```

---

## 8. Three-dot loading animation (CSS)

```tsx
// In globals.css
@keyframes bounce-dot {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
.dot { display: inline-block; width: 8px; height: 8px;
       border-radius: 50%; background: #7f85f7; margin: 0 2px;
       animation: bounce-dot 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

// In component
<div className="flex items-center gap-1 p-3">
  <span className="dot"/>
  <span className="dot"/>
  <span className="dot"/>
</div>
```

---

## 9. Next.js metadata with SITE_FULL

```ts
// For static metadata
import { SITE_FULL } from "@/data/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Page Title | ${SITE_FULL}`,
  description: "Description here.",
}

// For root layout template
export const metadata: Metadata = {
  title: { template: `%s | ${SITE_FULL}`, default: SITE_FULL },
  description: SITE_TAGLINE,
}
```

---

## 10. Common errors and fixes

```
Error: Cannot use import statement outside a module
Fix: Check tsconfig.json has "module": "esnext"

Error: SITE_FULL is not exported
Fix: Check src/data/site.ts has "export const SITE_FULL = ..."

Error: Cannot find module nodemailer
Fix: npm install nodemailer && npm install --save-dev @types/nodemailer

Error: API route not found
Fix: File must be at src/app/api/[name]/route.ts with export async function POST()

Error: Hydration mismatch
Fix: Move useState/useEffect to "use client" components only

Error: Image not optimized
Fix: Use next/image <Image> instead of <img>
```
