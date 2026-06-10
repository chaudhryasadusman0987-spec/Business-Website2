import Link from "next/link"
import { Shield, Car, Globe, Smartphone, Bot, Monitor } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
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
                className="group flex flex-col bg-brand-card rounded-[40px] overflow-hidden text-center cursor-pointer transition-all duration-500 hover:bg-brand-primary hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(127,133,247,0.25)]"
              >
                {/* Hero image strip — mirrors the service's landing-page hero.
                    Services without a dedicated hero (e.g. IT Consulting) skip it. */}
                {service.image && (
                  <div className="h-[200px] relative overflow-hidden">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.imageAlt ?? service.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      fallbackIcon={service.iconName}
                    />
                    <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/30 transition duration-500" />
                  </div>
                )}

                <div
                  className={`px-8 ${
                    service.image ? "pt-10 pb-12" : "py-[90px]"
                  }`}
                >
                  <div className="flex justify-center mb-6 text-brand-primary group-hover:text-white transition-all duration-500">
                    <Icon size={service.image ? 48 : 70} />
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
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
