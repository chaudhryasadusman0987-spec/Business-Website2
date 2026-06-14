"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Phone } from "lucide-react"
import type { Message } from "@/types"
import { SITE_FULL, SITE_CALL_NUMBER } from "@/data/site"

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBadge, setShowBadge] = useState(true)
  const [showPulse, setShowPulse] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! 👋 I am the ${SITE_FULL} assistant. Are you looking for security solutions, car rental, or IT services today?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Pulse animation after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Auto-scroll after every new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  function openPanel() {
    setIsOpen(true)
    setShowBadge(false)
    setShowPulse(false)
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
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <div className="flex flex-col items-center gap-3">
          {/* Call button — uses the temporary SITE_CALL_NUMBER placeholder.
              Tapping it opens the device dialer (tel: link). */}
          <a
            href={`tel:${SITE_CALL_NUMBER.replace(/\s+/g, "")}`}
            aria-label={`Call us on ${SITE_CALL_NUMBER}`}
            title={`Call us: ${SITE_CALL_NUMBER}`}
            className="group relative w-[60px] h-[60px] rounded-full bg-[#22c55e] text-white flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-transform hover:scale-105"
          >
            <span className="animate-ping absolute inset-0 rounded-full bg-[#22c55e] opacity-25" />
            <Phone size={26} className="relative" fill="white" />
          </a>

          <button
            onClick={openPanel}
            aria-label="Open chat"
            className="relative w-[60px] h-[60px] rounded-full bg-brand-primary text-white flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(127,133,247,0.4)]"
          >
          {showPulse && (
            <span className="animate-ping absolute inset-0 rounded-full bg-brand-primary opacity-30" />
          )}
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Chat bubble base */}
            <path
              d="M16 3C9.373 3 4 7.925 4 14c0 2.607.96 5.002 2.556 6.88L4.5 26.5l6.316-2.105A13.144 13.144 0 0016 25c6.627 0 12-4.925 12-11S22.627 3 16 3z"
              fill="white"
              fillOpacity="0.95"
            />
            {/* AI brain dots — 3 dots suggesting intelligence */}
            <circle cx="11" cy="14" r="1.8" fill="#7f85f7" />
            <circle cx="16" cy="14" r="1.8" fill="#7f85f7" />
            <circle cx="21" cy="14" r="1.8" fill="#7f85f7" />
          </svg>
          {showBadge && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
          </button>
        </div>
      ) : (
        <div className="w-[380px] max-w-[calc(100vw-48px)] h-[520px] bg-white rounded-[16px] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark rounded-t-[16px] px-4 py-3 flex items-center justify-between">
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
                    ? "self-start bg-[#f7f7f7] text-[#2f2f2f] rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                    : "self-end bg-brand-primary text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-[#f7f7f7] rounded-2xl px-4 py-3">
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
              className="bg-brand-primary text-white rounded-full w-9 h-9 flex items-center justify-center hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
