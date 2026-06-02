# AI_AGENT.md — Floating Chat Agent Specification

> Read this before building any chat component or API route.

---

## 1. What it is

A floating customer service AI on every page. It represents the business,
answers questions, collects leads, and books quote requests on the owner's behalf.

It knows the business name from SITE_FULL (site.ts) — never hard-coded.

---

## 2. Visual spec

```
CLOSED STATE:
  - Fixed bottom-right, 24px from edges
  - 60px circular button, bg #7f85f7 (brand-primary)
  - White MessageCircle icon (Lucide), 28px
  - box-shadow: 0 4px 20px rgba(127,133,247,0.4)
  - Pulse animation triggers after 3 seconds on page load
  - Red dot badge (top-right of button) = unread indicator

OPEN STATE:
  - Panel slides up from bottom-right
  - Width: 380px (full width on mobile)
  - Height: 520px
  - bg white, border-radius 16px top, box-shadow
  - Header: bg #2d2d2c, SITE_FULL text white, X close button
  - Messages area: scrollable flex-col gap-3
    * Agent messages: left-aligned, #f7f7f7 bg, #2f2f2f text, rounded-2xl
    * User messages: right-aligned, #7f85f7 bg, white text, rounded-2xl
  - Loading: three dots bouncing animation (CSS keyframes)
  - Input row: text input + send button (bg #7f85f7, white icon)
  - Auto-scroll to latest message after each response
```

---

## 3. System prompt (built dynamically)

Location: `src/lib/agent-prompt.ts`

```ts
import { SITE_FULL, SITE_PHONE, SITE_EMAIL, SITE_HOURS } from "@/data/site"
import { cctvProducts, installFee } from "@/data/cctv-products"
import { vehicles } from "@/data/car-rental"
import { itServices } from "@/data/it-services"

export function buildSystemPrompt(): string {
  const cctvPrices = cctvProducts
    .map(p => `${p.name}: $${p.price}`)
    .join(", ")

  const rentalRates = vehicles
    .map(v => `${v.name}: $${v.dailyRate}/day`)
    .join(", ")

  return `You are a friendly customer service assistant for ${SITE_FULL}, 
an Australian multi-service business. You speak concisely in Australian English.

SERVICES:
1. CCTV Installation — ${cctvPrices}, plus $${installFee} installation fee. Free site assessment.
2. Car Rental — ${rentalRates}. Free cancellation available.
3. IT Services — Web development, app development, AI automation. Free consultation.

CONTACT: Phone ${SITE_PHONE} | Email ${SITE_EMAIL} | Hours: ${SITE_HOURS}

YOUR ROLE:
- Answer questions about services and pricing clearly and concisely
- Direct customers to quote pages when they want a price
- Collect name + phone + email for callback requests
- Be warm, helpful, and professional

RULES:
- Max 2-3 sentences per reply
- Australian English (colour, organise, authorise)
- Never invent services or prices not listed above
- Never promise specific timeframes beyond what's listed
- If unsure: "Great question — I'll have our team call you. Can I get your name and number?"
- When someone provides contact details, confirm them and say the team will be in touch

LEAD COLLECTION: When you have collected name + phone + email from a customer,
end your message with the exact text: [LEAD_COLLECTED]
This triggers the system to save their details.`
}
```

---

## 4. API route

`src/app/api/chat/route.ts`

```ts
import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "@/lib/agent-prompt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Cap at 40 messages to control costs
    if (messages.length > 40) {
      return NextResponse.json({
        reply: "This chat session has ended. Please call us or email us directly."
      })
    }

    const client = new Anthropic()
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: buildSystemPrompt(),
      messages,
    })

    const reply = response.content[0].type === "text"
      ? response.content[0].text
      : ""

    // Check if agent collected a lead
    const leadCollected = reply.includes("[LEAD_COLLECTED]")
    const cleanReply = reply.replace("[LEAD_COLLECTED]", "").trim()

    return NextResponse.json({ reply: cleanReply, leadCollected })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
```

---

## 5. Lead saving route

`src/app/api/leads/route.ts`

```ts
// Saves leads to /data/leads.json (prototype storage)
// TODO(backend): replace with real CRM/database when backend is live
export async function POST(req: Request) {
  const lead = await req.json()
  // append to leads.json
  // return { success: true }
}
```

---

## 6. Component structure

`src/components/ui/AIChatBubble.tsx` — "use client"

State:
```ts
const [isOpen, setIsOpen]     = useState(false)
const [showBadge, setShowBadge] = useState(true)
const [messages, setMessages] = useState<Message[]>([{
  role: "assistant",
  content: `Hi! 👋 I'm the ${SITE_FULL} assistant. Are you looking for CCTV installation, car rental, or IT services today?`
}])
const [input, setInput]       = useState("")
const [isLoading, setIsLoading] = useState(false)
const messagesEndRef           = useRef<HTMLDivElement>(null)
```

On send:
1. Add user message to messages state
2. setIsLoading(true)
3. POST /api/chat with messages array
4. Add reply to messages
5. If leadCollected: POST /api/leads with extracted details
6. setIsLoading(false)
7. Auto-scroll to messagesEndRef

---

## 7. Add to root layout

`src/app/layout.tsx`:
```tsx
import AIChatBubble from "@/components/ui/AIChatBubble"

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <AIChatBubble />   {/* ← appears on every page */}
      </body>
    </html>
  )
}
```
