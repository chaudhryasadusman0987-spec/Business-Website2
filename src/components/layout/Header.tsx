"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Phone, Mail, ArrowRight } from "lucide-react"
import { buttonClass } from "@/components/ui/Button"
import {
  SITE_EMAIL,
  SITE_FULL,
  SITE_HOURS,
  SITE_NAME,
  SITE_PHONE_HREF,
  SITE_PHONE_LOCAL,
  SITE_SUFFIX,
} from "@/data/site"

/* Custom service SVGs — same shapes/colors as the hero cards */
function CctvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      <circle cx="6" cy="12" r="1.5" fill="#f57c00" stroke="none" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M9 9l2 2 4-4" strokeWidth="2.5" />
    </svg>
  )
}

// `action` is each service's own next step, shown beside it in the mobile
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
  return { label: "Get a Free Quote", href: "/quote" }
}

/**
 * Navbar logo. The bar is solid navy, and the supplied light artwork has a
 * dark navy wordmark that would disappear on it — so the whole mark is
 * rendered white with a CSS filter (brightness-0 flattens it to black, invert
 * flips that to white). No second image file to keep in sync.
 */
function NavLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${SITE_FULL} home`}
      className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pak-oz-logo-light.webp"
        alt={SITE_FULL}
        width={110}
        height={52}
        className="h-[44px] w-auto object-contain brightness-0 invert lg:h-[50px]"
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = "none"
          const fallback = img.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = "flex"
        }}
      />
      {/* Text fallback — only revealed if the artwork fails to load. */}
      <span className="hidden flex-col leading-none">
        <span className="font-heading text-[18px] font-bold uppercase tracking-[-0.01em] text-white">
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

  // Navigating always closes the menu, including via the browser back button.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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

  // Desktop link: purple underline on hover and for the current page — no
  // background blocks.
  const navLink = (active: boolean) =>
    `relative inline-flex h-10 items-center text-[15px] font-medium text-white transition-colors ` +
    `after:absolute after:inset-x-0 after:bottom-1 after:h-[2px] after:origin-left after:bg-brand-primary ` +
    `after:transition-transform after:duration-200 hover:after:scale-x-100 ` +
    (active ? "after:scale-x-100" : "after:scale-x-0")

  // Mobile row: full width, 48px touch target.
  const mobileRow = (active: boolean) =>
    `flex min-h-[48px] w-full items-center px-4 sm:px-6 text-[16px] font-medium transition-colors ` +
    (active ? "text-white bg-white/[0.06]" : "text-white/90 active:bg-white/[0.06]")

  const servicesActive = pathname.startsWith("/services")

  return (
    <>
      <header className="on-dark sticky top-0 z-[60] h-16 w-full border-b border-white/10 bg-brand-navy lg:h-[72px]">
        <div className="container-page flex h-full items-center justify-between gap-6">
          <NavLogo onClick={close} />

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            <Link href="/" className={navLink(pathname === "/")}>
              Home
            </Link>
            <Link href="/about" className={navLink(pathname === "/about")}>
              About
            </Link>

            {/* Services dropdown — opens on hover and on keyboard focus */}
            <div className="group relative">
              <Link
                href="/#services"
                aria-haspopup="true"
                className={`${navLink(servicesActive)} gap-1`}
              >
                Services
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                />
              </Link>

              <div className="on-light invisible absolute left-1/2 top-full z-50 w-[300px] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="overflow-hidden rounded-card border border-line bg-white py-2 shadow-card-hover">
                  {serviceItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                    >
                      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                        {item.icon}
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold text-ink">{item.title}</span>
                        <span className="mt-0.5 block text-[12px] text-muted">{item.sub}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials intentionally not linked here until there are real
                reviews to show. The /testimonials page still exists. */}
            <Link href="/blog" className={navLink(pathname.startsWith("/blog"))}>
              Blog
            </Link>
            <Link href="/contact" className={navLink(pathname.startsWith("/contact"))}>
              Contact
            </Link>
          </nav>

          {/* Right — phone + CTA (desktop), menu button (mobile) */}
          <div className="flex shrink-0 items-center gap-5">
            <a
              href={SITE_PHONE_HREF}
              className="hidden items-center gap-2 text-[15px] font-semibold text-white transition-colors hover:text-on-dark-muted lg:inline-flex"
            >
              <Phone size={16} aria-hidden="true" className="text-brand-primary" />
              {SITE_PHONE_LOCAL}
            </a>
            <Link href="/quote" className={buttonClass("primary", "dark", "hidden h-11 px-5 lg:inline-flex")}>
              Get a Free Quote
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-mr-2 flex h-12 w-12 items-center justify-center rounded-btn text-white lg:hidden"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — slides down from under the bar and fills the screen. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={`on-dark fixed inset-x-0 bottom-0 top-16 z-[9998] flex flex-col bg-brand-navy transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain py-3">
          <Link href="/" onClick={close} className={mobileRow(pathname === "/")}>
            Home
          </Link>
          <Link href="/about" onClick={close} className={mobileRow(pathname === "/about")}>
            About
          </Link>

          <p className="mt-4 px-4 pb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-on-dark-muted sm:px-6">
            Services
          </p>
          {serviceItems.map((item) => (
            <div key={item.href} className="flex items-stretch">
              <Link
                href={item.href}
                onClick={close}
                className={`${mobileRow(pathname.startsWith(item.href))} flex-1 gap-3`}
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  {item.icon}
                </span>
                {item.title}
              </Link>
              <Link
                href={item.action.href}
                onClick={close}
                className="flex min-h-[48px] flex-shrink-0 items-center gap-1 px-4 text-[14px] font-semibold text-accent sm:px-6"
              >
                {item.action.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          ))}

          <div className="mx-4 my-3 border-t border-white/10 sm:mx-6" />

          <Link href="/blog" onClick={close} className={mobileRow(pathname.startsWith("/blog"))}>
            Blog
          </Link>
          <Link href="/contact" onClick={close} className={mobileRow(pathname.startsWith("/contact"))}>
            Contact
          </Link>
          <a href={SITE_PHONE_HREF} className={`${mobileRow(false)} gap-3`}>
            <Phone size={18} aria-hidden="true" className="text-brand-primary" />
            Call {SITE_PHONE_LOCAL}
          </a>
          <a href={`mailto:${SITE_EMAIL}`} className={`${mobileRow(false)} gap-3`}>
            <Mail size={18} aria-hidden="true" className="text-brand-primary" />
            {SITE_EMAIL}
          </a>
          <p className="px-4 pt-2 text-[13px] text-on-dark-muted sm:px-6">{SITE_HOURS}</p>
        </nav>

        {/* CTA — follows the section the visitor is in (see primaryCta) */}
        <div className="flex-shrink-0 border-t border-white/10 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <Link href={cta.href} onClick={close} className={buttonClass("primary", "dark", "w-full")}>
            {cta.label}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  )
}
