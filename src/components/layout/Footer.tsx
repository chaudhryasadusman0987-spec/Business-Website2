import Link from "next/link"
import NewsletterForm from "@/components/layout/NewsletterForm"
import FooterWhatsApp from "@/components/layout/FooterWhatsApp"
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
} from "@/data/site"

// NOTE: social icons removed — they pointed at "#" with no real profiles behind
// them. Add them back with real URLs once the accounts exist.

const LINK = "inline-block py-1 text-on-dark-muted transition-colors hover:text-white"
const HEADING = "mb-4 font-body text-[14px] font-semibold uppercase tracking-[0.08em] text-white"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="on-dark bg-brand-navy pb-8 pt-16 text-[14px] leading-[1.6] text-on-dark-muted">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.3fr_1.5fr] lg:gap-8">
          {/* Col 1 — Company */}
          <div>
            <Link
              href="/"
              aria-label={`${SITE_FULL} home`}
              className="inline-block transition-opacity hover:opacity-80"
            >
              {/* Same white rendering as the navbar logo (see Header.tsx). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pak-oz-logo-light.webp"
                alt={SITE_FULL}
                width={118}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-[56px] w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-4 font-semibold text-white">{SITE_TAGLINE}</p>
            <p className="mt-2 max-w-[32ch]">
              Your trusted Australian multi-service partner for security,
              mobility, and technology.
            </p>
            <h3 className={`${HEADING} mt-6`}>Company</h3>
            <ul className="space-y-1">
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

          {/* Col 2 — Services */}
          <div>
            <h3 className={HEADING}>Services</h3>
            <ul className="space-y-1">
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
          <div>
            <h3 className={HEADING}>Contact</h3>
            <ul className="space-y-1">
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
                <FooterWhatsApp className={LINK} />
              </li>
              <li className="py-1">{SITE_ADDRESS}</li>
              <li>
                <a href={SITE_DOMAIN} className={LINK}>
                  {SITE_DOMAIN.replace(/^https?:\/\//, "")}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h3 className={HEADING}>Newsletter</h3>
            <p className="mb-4">Get updates and special offers straight to your inbox.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {COMPANY_LEGAL_NAME} · ABN {COMPANY_ABN}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="/rental-terms" className={LINK}>
                Rental terms
              </Link>
            </li>
            <li>
              <Link href="/contact" className={LINK}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
