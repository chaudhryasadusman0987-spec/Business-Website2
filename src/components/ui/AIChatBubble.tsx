"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { X, Send, Phone, MessageCircle } from "lucide-react"
import type { Message } from "@/types"
import { usePathname } from "next/navigation"
import { IT_WHATSAPP_LINK, SITE_WHATSAPP_LINK, SITE_FULL, SITE_PHONE_HREF } from "@/data/site"

// "Get Quote" in the mobile bar goes to the quote page for the section the
// visitor is in (car rental has no quote form — it goes to the fleet).
function quoteHref(pathname: string): string {
  if (pathname.startsWith("/services/car-rental")) return "/services/car-rental/vehicles"
  if (pathname.startsWith("/services/security-solutions")) return "/services/security-solutions/quote"
  if (pathname.startsWith("/services/it-services")) return "/services/it-services/quote"
  return "/quote"
}
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton"

export default function AIChatBubble() {
  const pathname = usePathname() ?? "/"
  // WhatsApp: the IT number and "Pak Oz Technologies" message on IT pages,
  // the main number and "Pak Oz Solutions" message everywhere else.
  const isITPage = pathname.startsWith("/services/it-services")
  const whatsappHref = isITPage ? IT_WHATSAPP_LINK : SITE_WHATSAPP_LINK
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! 👋 I am the ${SITE_FULL} assistant. Are you looking for security solutions, car rental, or IT services today?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll after every new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  function openPanel() {
    setIsOpen(true)
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = { role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])

      if (data.leadCollected) {
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Date.now().toString(),
            name: "Via Chat",
            phone: "",
            email: "",
            service: "unknown",
            message: "Lead collected via AI chat",
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            source: "ai_chat",
          }),
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble right now. Please call us directly.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Mobile: one slim bar instead of stacked floating circles. Hidden
          while the mobile menu is open (see globals.css). */}
      <nav
        aria-label="Quick actions"
        className="mobile-bar on-dark fixed inset-x-0 bottom-0 z-50 box-content grid h-14 grid-cols-[1fr_1fr_1fr_56px] border-t border-white/10 bg-brand-navy pb-[env(safe-area-inset-bottom)] text-[14px] font-semibold text-white md:hidden"
      >
        <a href={SITE_PHONE_HREF} className="flex items-center justify-center gap-2 active:bg-white/10">
          <Phone size={17} aria-hidden="true" />
          Call
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border-l border-white/10 active:bg-white/10"
        >
          <WhatsAppIcon size={17} className="text-[#25D366]" />
          WhatsApp
        </a>
        <Link
          href={quoteHref(pathname)}
          className="flex items-center justify-center bg-brand-primary active:bg-brand-hover"
        >
          Get Quote
        </Link>
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          aria-expanded={isOpen}
          className="flex items-center justify-center active:bg-white/10"
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
        </button>
      </nav>

      {/* Desktop: one small chat button. */}
      {!isOpen && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 hidden h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-card-hover transition-colors duration-200 hover:bg-brand-hover md:flex"
        >
          <MessageCircle size={22} aria-hidden="true" />
        </button>
      )}

      {isOpen && (
      <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] right-3 z-[70] md:bottom-6 md:right-6">
        <div className="w-[380px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100dvh-160px)] bg-white rounded-card shadow-card-hover flex flex-col overflow-hidden on-light">
          {/* Header */}
          <div className="bg-brand-dark rounded-t-card px-4 py-3 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">{SITE_FULL}</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "assistant"
                    ? "self-start bg-surface text-[#2f2f2f] rounded-card rounded-tl-none px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap on-light"
                    : "self-end bg-brand-primary text-white rounded-card rounded-tr-none px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-surface rounded-card px-4 py-3 on-light">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="bg-brand-primary text-white rounded-full w-11 h-11 flex-shrink-0 flex items-center justify-center hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
