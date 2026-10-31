"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Mail,
  Newspaper,
  Phone,
  Clock,
  Home,
  Info,
  ArrowRight,
} from "lucide-react"
import {
  SITE_EMAIL,
  SITE_FULL,
  SITE_HOURS,
  SITE_NAME,
  SITE_PHONE,
  SITE_SUFFIX,
} from "@/data/site"

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

// `action` is each service's own next step, shown as a chip in the mobile
// menu: security and IT have quote wizards, car rental has a fleet to browse.
const serviceItems = [
  {
    href: "/services/security-solutions",
    iconBg: "bg-[rgba(245,124,0,0.12)]",
    icon: <CctvIcon />,
    title: "Security Solutions",
    sub: "Surveillance, alarms, access & more",
    action: { label: "Free quote", href: "/services/security-solutions/quote" },
  },
  {
    href: "/services/car-rental",
    iconBg: "bg-[rgba(76,175,80,0.12)]",
    icon: <CarIcon />,
    title: "Car Rental",
    sub: "Long-term weekly hire, Brisbane",
    action: { label: "View cars", href: "/services/car-rental/vehicles" },
  },
  {
    href: "/services/it-services",
    iconBg: "bg-[rgba(127,133,247,0.12)]",
    icon: <MonitorIcon />,
    title: "IT & AI Services",
    sub: "Web, App & AI automation",
    action: { label: "Free quote", href: "/services/it-services/quote" },
  },
]

const tel = `tel:${SITE_PHONE.replace(/s/g, "")}`

/**
 * The mobile menu's main button follows the section the visitor is in, so it
 * is always the next step for what they are looking at — not a generic
 * contact link.
 */
function primaryCta(pathname: string): { label: string; href: string } {
  if (pathname.startsWith("/services/car-rental"))
    return { label: "Browse available cars", href: "/services/car-rental/vehicles" }
  if (pathname.startsWith("/services/security-solutions"))
    return { label: "Get a free security quote", href: "/services/security-solutions/quote" }
  if (pathname.startsWith("/services/it-services"))
    return { label: "Get a free IT & AI quote", href: "/services/it-services/quote" }
  return { label: "Get a free quote", href: "/quote" }
}

const centerLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
]

/**
 * The logo for the purple surfaces: the navbar and the mobile slide-out panel
 * header, which share the same #7f85f7 background.
 *
 * Uses the light artwork directly, with no white chip behind it. That works
 * here specifically because #7f85f7 is a mid-tone: the white ibex and kangaroo
 * bodies read against it, and so does the dark navy wordmark. It does NOT hold
 * up on the genuinely dark footer (#252525) or heroes (#0f0f18), where that
 * navy wordmark disappears — those keep the BrandLogo lockup instead.
 *
 * Renders pak-oz-logo-light.webp, the trimmed build of the supplied file. The
 * original 1024x1024 canvas is ~21% transparent padding, which would have made
 * the artwork render at roughly half the height it was asked for.
 *
 * Height is capped at 52px inside the 65px bar. The wordmark is stacked three
 * lines deep plus a tagline, so pushing it toward the full bar height leaves no
 * breathing room and turns the tagline to mush.
 */
function NavLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pak-oz-logo-light.webp"
        alt={SITE_FULL}
        className="h-[46px] w-auto object-contain lg:h-[52px]"
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = "none"
          const fallback = img.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = "flex"
        }}
      />
      {/* Text fallback — only revealed if the artwork fails to load. */}
      <span className="hidden flex-col leading-none">
        <span className="text-[18px] font-extrabold uppercase tracking-[-0.01em] text-white">
          {SITE_NAME}
        </span>
        <span className="mt-[3px] text-[9.5px] font-semibold uppercase tracking-[0.225em] text-white/70">
          {SITE_SUFFIX}
        </span>
      </span>
    </Link>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cta = primaryCta(pathname)
  const close = () => setOpen(false)

  // While the menu is open the page behind it must not scroll, and Escape
  // closes it like any other dialog.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const rowClass = (active: boolean) =>
    `flex items-center gap-3 px-4 h-[52px] text-[15px] transition-colors ${
      active ? "text-[#534ab7] font-semibold bg-[#f4f4ff]" : "text-[#1a1a2e] font-medium active:bg-[#f4f4ff]"
    }`

  const navLinkClass = (active: boolean) =>
    `text-white text-[14px] font-medium px-4 py-2 rounded-md transition-all duration-200 ${
      active ? "bg-white/20 font-semibold" : "hover:bg-white/15"
    }`

  return (
    <>
      <header className="bg-[rgba(127,133,247,0.95)] backdrop-blur-md sticky top-0 z-50 w-full px-6 py-0 h-[65px] flex items-center">
        <div className="w-full flex items-center justify-between gap-6">
          {/* LEFT — logo */}
          <NavLogo />

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
                {/* Testimonials intentionally not linked here until there are
                    real reviews to show. The /testimonials page still exists. */}
                <Link
                  href="/blog"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f4f4ff] transition-colors"
                >
                  <Newspaper size={14} className="text-[#7f85f7]" />
                  <span className="text-[13px] font-medium text-[#1a1a2e]">Blog</span>
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
        onClick={close}
        className={`fixed inset-0 bg-[#0d0d1a]/60 backdrop-blur-[2px] z-[9998] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out panel (mobile). Purple header to match the bar, light body
          so the services read as cards rather than one long purple list. */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-[100dvh] w-[340px] max-w-[88vw] bg-[#f7f7fb] shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header — matches the navbar bar */}
        <div className="flex items-center justify-between pl-5 pr-4 h-[65px] bg-[#7f85f7] flex-shrink-0">
          <NavLogo onClick={close} />
          <button
            onClick={close}
            aria-label="Close menu"
            className="w-10 h-10 rounded-full bg-white/15 active:bg-white/25 flex items-center justify-center text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          {/* Primary pages */}
          <div className="bg-white rounded-[14px] border border-[#ececf4] overflow-hidden divide-y divide-[#f0f0f6]">
            {[
              { label: "Home", href: "/", Icon: Home },
              { label: "About us", href: "/about", Icon: Info },
            ].map(({ label, href, Icon }) => (
              <Link key={href} href={href} onClick={close} className={rowClass(pathname === href)}>
                <Icon size={18} className="text-[#7f85f7] flex-shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={16} className="text-[#c4c6d6]" />
              </Link>
            ))}
          </div>

          {/* Services — each card goes to the service, the chip to its next step */}
          <p className="mt-6 mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9496a8]">
            Our services
          </p>
          <div className="flex flex-col gap-2.5">
            {serviceItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <div
                  key={item.href}
                  className={`bg-white rounded-[14px] border p-3.5 ${
                    active ? "border-[#7f85f7] shadow-[0_0_0_3px_rgba(127,133,247,0.12)]" : "border-[#ececf4]"
                  }`}
                >
                  <Link href={item.href} onClick={close} className="flex items-center gap-3">
                    <span className={`w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold text-[#1a1a2e] leading-tight">
                        {item.title}
                      </span>
                      <span className="block text-[12px] text-[#9496a8] mt-0.5 truncate">{item.sub}</span>
                    </span>
                    <ChevronRight size={16} className="text-[#c4c6d6] flex-shrink-0" />
                  </Link>
                  <Link
                    href={item.action.href}
                    onClick={close}
                    className="mt-3 ml-14 inline-flex items-center gap-1 text-[12px] font-semibold text-[#534ab7] bg-[#eeedfe] rounded-full px-3 py-1.5 active:bg-[#e2e0fd]"
                  >
                    {item.action.label}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Secondary pages */}
          <p className="mt-6 mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9496a8]">
            More
          </p>
          <div className="bg-white rounded-[14px] border border-[#ececf4] overflow-hidden divide-y divide-[#f0f0f6]">
            {[
              { label: "Blog", href: "/blog", Icon: Newspaper },
              { label: "Contact us", href: "/contact", Icon: Mail },
            ].map(({ label, href, Icon }) => (
              <Link key={href} href={href} onClick={close} className={rowClass(pathname.startsWith(href))}>
                <Icon size={18} className="text-[#7f85f7] flex-shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={16} className="text-[#c4c6d6]" />
              </Link>
            ))}
          </div>

          {/* Talk to us — the fastest route for most visitors on a phone */}
          <div className="mt-6 bg-[#1a1a2e] rounded-[14px] p-4">
            <p className="text-white font-semibold text-[15px]">Talk to a real person</p>
            <p className="flex items-center gap-1.5 text-[12px] text-[#9496a8] mt-1">
              <Clock size={12} /> {SITE_HOURS}
            </p>
            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <a
                href={tel}
                className="flex items-center justify-center gap-2 h-[44px] rounded-[10px] bg-[#5dcaa5] text-[#0d2a20] text-[14px] font-bold active:opacity-90"
              >
                <Phone size={16} /> Call
              </a>
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="flex items-center justify-center gap-2 h-[44px] rounded-[10px] bg-white/10 text-white text-[14px] font-semibold active:bg-white/15"
              >
                <Mail size={16} /> Email
              </a>
            </div>
            <p className="text-[12px] text-[#767892] mt-3 text-center">{SITE_PHONE}</p>
          </div>
        </div>

        {/* CTA — follows the section the visitor is in (see primaryCta) */}
        <div className="flex-shrink-0 bg-white border-t border-[#ececf4] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Link
            href={cta.href}
            onClick={close}
            className="flex items-center justify-center gap-2 h-[50px] rounded-[12px] bg-[#7f85f7] text-white font-bold text-[15px] shadow-[0_6px_18px_rgba(127,133,247,0.35)] active:bg-[#6b71f0]"
          >
            {cta.label}
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>
    </>
  )
}
