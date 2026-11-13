import { ShieldCheck, Globe, Star, Clock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"

interface Feature {
  Icon: LucideIcon
  title: string
  description: string
}

// Kept short so each item fits a half-width column on a phone.
const features: Feature[] = [
  {
    Icon: ShieldCheck,
    title: "Licensed & Insured",
    description: "Accredited installers you can trust.",
  },
  {
    Icon: Globe,
    title: "Brisbane & SE QLD",
    description: "Local service and support.",
  },
  {
    Icon: Star,
    title: "Quality Guaranteed",
    description: "Done right the first time.",
  },
  {
    Icon: Clock,
    title: "Fast & Flexible",
    description: "Quick quotes, same-week service.",
  },
]

// Plain items on the page background — no cards. 2×2 on mobile, 4 across on
// desktop.
export default function WhyChooseUs() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionTitle eyebrow="Why us" title="Why Choose Us" />

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-8">
          {features.map(({ Icon, title, description }) => (
            <li key={title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-[1.0625rem] text-ink lg:mt-4 lg:text-[1.25rem]">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-muted lg:mt-2 lg:text-[15px] lg:leading-[1.6]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
