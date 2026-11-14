import ServiceCard from "@/components/ui/ServiceCard"
import type { SecuritySolution } from "@/data/security-solutions"

// Security hub grid card — the shared ServiceCard, fed from a solution.
export default function SolutionCard({
  solution,
}: {
  solution: SecuritySolution
}) {
  return (
    <ServiceCard
      href={`/services/security-solutions/${solution.slug}`}
      title={solution.name}
      tagline={solution.tagline}
      description={solution.description}
      linkTopic={solution.name}
      image={solution.heroImage}
      imageAlt={solution.heroImageAlt}
      imageFit={solution.heroImageFit !== "cover" ? "contain" : "cover"}
      fallbackBg={solution.iconBg}
    />
  )
}
