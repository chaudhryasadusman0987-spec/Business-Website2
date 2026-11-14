import Link from "next/link"
import NewsletterForm from "@/components/layout/NewsletterForm"
import { services } from "@/data/services"
import {
  SITE_FULL,
  SITE_TAGLINE,
  SITE_PHONE,
  SITE_PHONE_HREF,
  SITE_EMAIL,
  SITE_ADDRESS,
  SITE_DOMAIN,
  COMPANY_LEGAL_NAME,
  COMPANY_ABN,
  IT_WHATSAPP_LINK,
  IT_WHATSAPP_LOCAL,
} from "@/data/site"

// NOTE: social icons removed — they pointed at "#" with no real profiles behind
// them. Add them back with real URLs once the accounts exist.

// 44px tall on phones for touch; compact rows on desktop.
const LINK =
  "inline-flex min-h-[44px] min-w-[44px] items-center text-on-dark-muted transition-colors hover:text-white md:min-h-0 md:min-w-0 md:py-1"
const HEADING = "mb-3 font-body text-[14px] font-semibold uppercase tracking-[0.08em] text-white"

// Legal pages for the bottom bar. Add an entry when the page exists — the bar
// shows only links that lead somewhere real. (Rental terms are linked from the
// car rental pages, not from here.)
const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="on-dark bg-brand-navy pb-8 pt-14 text-[14px] leading-[1.6] text-on-dark-muted lg:pt-16">
      <div className="container-page">
        {/* Mobile: brand, then Company | Services side by side, then Contact
            and Newsletter full width. Desktop: four columns. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.2fr_1fr_1.3fr_1.5fr] lg:gap-8">
          {/* Col 1 — brand + Company. `contents` on mobile lets the two parts
              sit in the grid separately; on desktop they stack in one column. */}
          <div className="contents lg:block">
            <div className="col-span-2">
              <Link
                href="/"
                aria-label={`${SITE_FULL} home`}
                className="inline-flex min-h-[44px] items-center transition-opacity hover:opacity-80"
              >
                {/* White rendering of the logo without its small tagline — the
                    tagline is unreadable at this size and is printed below. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pak-oz-logo-light-notag.webp"
                  alt={SITE_FULL}
                  width={124}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="h-[48px] w-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="mt-4 font-semibold text-white">{SITE_TAGLINE}</p>
              <p className="mt-2 max-w-[36ch]">
                Your trusted Australian multi-service partner for security,
                mobility, and technology.
              </p>
            </div>

            <div className="lg:mt-6">
              <h3 className={HEADING}>Company</h3>
              <ul className="md:space-y-1">
                <li>
                  <Link href="/about" className={LINK}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={LINK}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className={LINK}>
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h3 className={HEADING}>Services</h3>
            <ul className="md:space-y-1">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={s.href} className={LINK}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className={HEADING}>Contact</h3>
            <ul className="md:space-y-1">
              <li>
                <a href={SITE_PHONE_HREF} className={LINK}>
                  {SITE_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE_EMAIL}`} className={`${LINK} break-all`}>
                  {SITE_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={IT_WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  IT &amp; AI: WhatsApp {IT_WHATSAPP_LOCAL}
                </a>
              </li>
              <li className="py-1">{SITE_ADDRESS}</li>
              <li>
                <a href={SITE_DOMAIN} className={LINK}>
                  {SITE_DOMAIN.replace(/^https?:\/\//, "")}
                </a>
              </li>
              <li>
                <Link href="/contact" className={LINK}>
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className={HEADING}>Newsletter</h3>
            <p className="mb-4">Get updates and special offers straight to your inbox.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar — company line, plus legal links once those pages exist. */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {COMPANY_LEGAL_NAME} · ABN {COMPANY_ABN}
          </p>
          {LEGAL_LINKS.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
