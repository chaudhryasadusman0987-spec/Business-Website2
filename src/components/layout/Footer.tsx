import Link from "next/link"
import { Share2, Send, AtSign, Globe } from "lucide-react"
import { services } from "@/data/services"
import {
  SITE_NAME,
  SITE_FULL,
  SITE_TAGLINE,
  SITE_PHONE,
  SITE_EMAIL,
  SITE_ADDRESS,
} from "@/data/site"

// NOTE: lucide-react v1 removed brand glyphs (Facebook/Twitter/LinkedIn/Instagram).
// TODO(design): swap these generic placeholders for real brand icons
// (e.g. simple-icons / @icons-pack/react-simple-icons) once chosen.
const socials = [
  { label: "Facebook", Icon: Share2 },
  { label: "Twitter", Icon: Send },
  { label: "LinkedIn", Icon: AtSign },
  { label: "Instagram", Icon: Globe },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-footer pt-[130px] pb-16 text-[#999]">
      <div className="max-w-[1170px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1 — Brand */}
          <div>
            <h2 className="text-[50px] font-bold text-white leading-none">
              {SITE_NAME}
            </h2>
            <p className="text-brand-primary mt-3">{SITE_TAGLINE}</p>
            <p className="mt-4 text-[14px] leading-[24px]">
              Your trusted Australian multi-service partner for security,
              mobility, and technology.
            </p>
            <ul className="mt-5 space-y-2 text-[14px]">
              <li>
                <Link
                  href="/about"
                  className="text-[#999] hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[#999] hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-[#999] hover:text-white transition-colors"
                >
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h3 className="text-white font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-[14px]">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="text-[#999] hover:text-white transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a
                  href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="hover:text-white transition-colors"
                >
                  {SITE_EMAIL}
                </a>
              </li>
              <li>{SITE_ADDRESS}</li>
            </ul>
            <div className="flex gap-4 mt-5">
              {socials.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="hover:text-white transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4">Newsletter</h3>
            <p className="text-[14px] mb-4">
              Get updates and special offers straight to your inbox.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                className="bg-[#333] text-white px-4 h-[44px] rounded-[5px] outline-none placeholder:text-[#777]"
              />
              <button
                type="submit"
                className="bg-brand-primary text-white h-[44px] rounded-[5px] font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#444] mt-12 pt-6 text-[14px] text-center">
          © {year} {SITE_FULL}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
