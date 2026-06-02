"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/data/navigation"
import { SITE_FULL } from "@/data/site"

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="bg-brand-primary shadow-sm w-full px-[15px] py-[28px] relative z-10">
        <div className="max-w-[1170px] mx-auto flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-2xl font-bold text-white shrink-0"
          >
            {SITE_FULL}
          </Link>

          {/* Desktop navigation bar */}
          <nav className="hidden lg:flex items-center gap-x-5 xl:gap-x-7">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] whitespace-nowrap transition-colors ${
                    active
                      ? "text-white font-semibold underline underline-offset-4"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden text-white hover:text-white/70 transition-colors"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Overlay (mobile slide-out) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out panel (mobile) */}
      <nav
        className={`fixed top-0 right-0 h-full w-[280px] bg-brand-panel z-[9999] pt-[60px] transition-transform duration-500 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-6 text-white hover:text-brand-primary transition-colors"
        >
          <X size={28} />
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="block px-8 py-3 text-white text-xl hover:text-brand-primary transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
