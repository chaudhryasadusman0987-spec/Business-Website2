import { ShieldCheck, Globe, Star, Clock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"

interface Feature {
  Icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    Icon: ShieldCheck,
    title: "Licensed & Insured",
    description: "Fully accredited installers and operators you can trust.",
  },
  {
    Icon: Globe,
    title: "Brisbane & Southeast QLD",
    description: "Service and support across Brisbane and Southeast QLD.",
  },
  {
    Icon: Star,
    title: "Quality Guaranteed",
    description: "Every job done right the first time — no shortcuts.",
  },
  {
    Icon: Clock,
    title: "Fast & Flexible",
    description: "Quick quotes and same-week service to fit your schedule.",
  },
]

// Plain items on the page background — no cards. Sits between two surface
// sections, so it stays white to keep the alternating rhythm.
export default function WhyChooseUs() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionTitle eyebrow="Why us" title="Why Choose Us" />

        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, description }) => (
            <li key={title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-ink">{title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
