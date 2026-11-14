import SectionTitle from "@/components/ui/SectionTitle"
import ServiceCard from "@/components/ui/ServiceCard"
import AnimateIn from "@/components/ui/AnimateIn"
import FleetCountBadge from "@/components/car-rental/FleetCountBadge"
import { services } from "@/data/services"
import { cardAnchors } from "@/data/internal-links"
import { HomeHubLinks } from "@/components/seo/InternalLinks"

export default function ServicesGrid() {
  return (
    <section id="services" className="section scroll-mt-20 bg-white">
      <div className="container-page">
        <SectionTitle
          eyebrow="What we do"
          title="Our Services"
          subtitle="Everything your home or business needs — security, mobility, and technology under one roof."
        />
        <HomeHubLinks className="mx-auto mt-4 max-w-[65ch] text-center text-[15px] leading-[1.7] text-muted" />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <AnimateIn
              key={service.id}
              animation="fade-up"
              delay={(index % 3) * 100}
              className="flex"
            >
              <ServiceCard
                href={service.href}
                title={service.name}
                description={service.description}
                // Keyword anchor text from the internal-linking map.
                linkTopic={cardAnchors[service.href] ?? service.name}
                image={service.image}
                imageAlt={service.imageAlt}
                fallbackIcon={service.iconName}
                hoverFill
              >
                {service.id === "car-rental" && <FleetCountBadge />}
              </ServiceCard>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
