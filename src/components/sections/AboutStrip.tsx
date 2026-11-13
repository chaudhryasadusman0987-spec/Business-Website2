import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SITE_FULL } from "@/data/site"

// Homepage "About" — editorial two-column: image left, text right. On mobile
// the image comes first.
export default function AboutStrip() {
  return (
    <section className="section bg-surface">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-img">
            <Image
              src="/images/about-workspace.jpg"
              alt="Meeting table in a bright, modern office"
              fill
              sizes="(max-width: 1024px) 100vw, 568px"
              className="object-cover"
            />
          </div>

          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-ink">About Us</h2>
            <p className="mt-5 max-w-[65ch] text-muted">
              {SITE_FULL} is an Australian multi-service company bringing
              security, mobility, and technology together under one roof. From
              complete security solutions to flexible car rental and custom
              software, we help homes and businesses across Brisbane and
              Southeast QLD run safer and smarter.
            </p>
            <p className="mt-4 max-w-[65ch] text-muted">
              Our licensed, friendly team is focused on honest advice, quality
              workmanship, and support you can rely on — every step of the way.
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-accent"
            >
              <span className="underline-offset-4 group-hover:underline">Read our story</span>
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
