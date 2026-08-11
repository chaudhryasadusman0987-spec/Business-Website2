"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

// The questions people actually ask on the first call. Answering them on the
// page removes the reason to bounce — especially the price one, since every
// number we publish is a range rather than a quote.
const FAQS: { q: string; a: string }[] = [
  {
    q: "Why do you show a price range instead of a price?",
    a: "Because two websites can be five pages each and still be a $2,000 job and an $8,000 job. The range tells you the order of magnitude so you're not wasting your time. After we've seen your brief and had a 30-minute call, you get one fixed number and a scope in writing — and that number doesn't move unless you ask for something new.",
  },
  {
    q: "What does the free consultation actually involve?",
    a: "Thirty minutes, on a video call, by phone, or in person around Brisbane. We ask what the business does, what's not working now, and what you want the technology to achieve. You leave with a recommendation — sometimes that recommendation is that you don't need what you thought you did. There's no charge and nothing to sign.",
  },
  {
    q: "Do I own the website or app when it's finished?",
    a: "Yes. You own the source code, the domain and every account we set up in your name. We hand over the lot at the end of the project. You're never locked into us to make changes later.",
  },
  {
    q: "How long does a project take?",
    a: "A straightforward business website is usually two to six weeks. AI automation runs one to eight weeks depending on how many systems it has to talk to. Mobile apps are the long ones — eight to twenty weeks for design, build and App Store approval. We agree the dates before we start and show you working software along the way, not just status updates.",
  },
  {
    q: "Do you work with businesses outside Brisbane?",
    a: "Yes. We're Brisbane based and happy to meet face to face across Southeast Queensland, but the work itself is done remotely, so we build for clients anywhere in Australia. Everything runs on email, video calls and demos you can click through yourself.",
  },
  {
    q: "How do payments work?",
    a: "A deposit to book the work in, then progress payments tied to milestones you can actually see — design approved, build complete, launched. Nothing is due upfront for the consultation or the estimate. All prices are quoted in AUD.",
  },
]

export default function ITFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={item.q}
            className={`rounded-[16px] border bg-white transition-all duration-300 ${
              isOpen
                ? "border-[#7f85f7] shadow-[0_8px_30px_rgba(127,133,247,0.12)]"
                : "border-[#e8e8f0] hover:border-[#c9ccfb]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span
                className={`text-[15px] font-semibold transition-colors ${
                  isOpen ? "text-[#534ab7]" : "text-[#1a1a2e]"
                }`}
              >
                {item.q}
              </span>
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isOpen ? "rotate-45 bg-[#7f85f7] text-white" : "bg-[#f0f0f8] text-[#666880]"
                }`}
              >
                <Plus size={15} />
              </span>
            </button>

            {/* Grid-rows trick: animates height without measuring the content. */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-[14px] leading-[1.8] text-[#555]">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
