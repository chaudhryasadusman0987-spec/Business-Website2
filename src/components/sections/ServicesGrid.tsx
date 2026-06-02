import Link from "next/link"
import { Shield, Car, Globe, Smartphone, Bot, Monitor } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import { services } from "@/data/services"

const icons: Record<string, LucideIcon> = {
  Shield,
  Car,
  Globe,
  Smartphone,
  Bot,
  Monitor,
}

export default function ServicesGrid() {
  return (
    <section id="services" className="py-[120px] bg-brand-section">
      <div className="max-w-[1170px] mx-auto px-4">
        <SectionTitle
          title="Our Services"
          subtitle="Everything your home or business needs — security, mobility, and technology under one roof."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {services.map((service) => {
            const Icon = icons[service.iconName] ?? Shield
            return (
              <div
                key={service.id}
                className="group bg-brand-card rounded-[80px] py-[90px] px-8 text-center cursor-pointer transition-all duration-500 hover:bg-brand-primary"
              >
                <div className="flex justify-center mb-6 text-brand-primary group-hover:text-white transition-all duration-500">
                  <Icon size={70} />
                </div>
                <h3 className="font-bold text-xl text-[#363636] group-hover:text-white transition-all duration-500">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-white/80 mt-2 transition-all duration-500">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="inline-block mt-6 bg-brand-dark text-brand-text px-8 h-[38px] leading-[38px] rounded-[5px] text-[15px] group-hover:bg-white group-hover:text-brand-dark transition-all duration-500"
                >
                  Learn More
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
