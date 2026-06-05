"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Plus, Star, Mail } from "lucide-react"
import { navLinks } from "@/data/navigation"
import { SITE_FULL } from "@/data/site"

/* Custom service SVGs — same shapes/colors as the hero cards */
function CctvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      <circle cx="6" cy="12" r="1.5" fill="#f57c00" stroke="none" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M9 9l2 2 4-4" strokeWidth="2.5" />
    </svg>
  )
}

const serviceItems = [
  {
    href: "/services/security-solutions",
    iconBg: "bg-[rgba(245,124,0,0.12)]",
    icon: <CctvIcon />,
    title: "Security Solutions",
    sub: "Surveillance, alarms, access & more",
  },
  {
    href: "/services/car-rental",
    iconBg: "bg-[rgba(76,175,80,0.12)]",
    icon: <CarIcon />,
    title: "Car Rental",
    sub: "Daily & weekly vehicle hire",
  },
  {
    href: "/services/it-services",
    iconBg: "bg-[rgba(127,133,247,0.12)]",
    icon: <MonitorIcon />,
    title: "IT & AI Services",
    sub: "Web, App & AI automation",
  },
]

const centerLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navLinkClass = (active: boolean) =>
    `text-white text-[14px] font-medium px-4 py-2 rounded-md transition-all duration-200 ${
      active ? "bg-white/20 font-semibold" : "hover:bg-white/15"
    }`

  return (
    <>
      <header className="bg-[rgba(127,133,247,0.95)] backdrop-blur-md sticky top-0 z-50 w-full px-6 py-0 h-[65px] flex items-center">
        <div className="w-full flex items-center justify-between gap-6">
          {/* LEFT — logo */}
          <Link
            href="/"
            className="text-white font-bold text-[20px] hover:opacity-80 transition-opacity shrink-0"
          >
            {SITE_FULL}
          </Link>

          {/* CENTER — nav links (desktop only) */}
          <nav className="hidden lg:flex items-center gap-1">
            {centerLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href)}>
                {link.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <div className="relative group inline-block">
              <Link
                href="/#services"
                className={`${navLinkClass(pathname.startsWith("/services"))} flex items-center gap-1`}
              >
                Services
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 mt-1 bg-white rounded-[12px] shadow-xl border border-gray-100 py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {serviceItems.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f4f4ff] transition-colors duration-150 cursor-pointer group/item ${
                      i < serviceItems.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-[#1a1a2e]">{item.title}</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* RIGHT — plus menu + Get Quote + mobile hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Plus icon menu (desktop only) */}
            <div className="relative group hidden lg:inline-block">
              <button
                aria-label="More links"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 transition-all flex items-center justify-center"
              >
                <Plus size={18} className="text-white" />
              </button>

              <div className="absolute top-full right-0 mt-1 bg-white rounded-[12px] shadow-xl border border-gray-100 py-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href="/testimonials"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f4f4ff] transition-colors"
                >
                  <Star size={14} className="text-[#f5a623]" />
                  <span className="text-[13px] font-medium text-[#1a1a2e]">Testimonials</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f4f4ff] transition-colors"
                >
                  <Mail size={14} className="text-[#7f85f7]" />
                  <span className="text-[13px] font-medium text-[#1a1a2e]">Contact Us</span>
                </Link>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden text-white hover:text-white/70 transition-colors"
            >
              <Menu size={28} />
            </button>
          </div>
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
