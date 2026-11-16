import ServiceCard from "@/components/ui/ServiceCard"
import type { SecuritySolution } from "@/data/security-solutions"
import { solutionCards, fromPrice } from "@/data/security-offer"

// Security hub grid card — the shared ServiceCard, fed from a solution. The
// purple line is a concrete benefit (not the solution page's slogan) and a
// "Starting from" line shows once a price is set in security-offer.ts.
export default function SolutionCard({
  solution,
}: {
  solution: SecuritySolution
}) {
  const card = solutionCards[solution.id]
  const price = card ? fromPrice(card.from) : null
  return (
    <ServiceCard
      href={`/services/security-solutions/${solution.slug}`}
      title={solution.name}
      tagline={card?.benefit ?? solution.tagline}
      description={solution.description}
      linkTopic={solution.name}
      image={solution.heroImage}
      imageAlt={solution.heroImageAlt}
      imageFit={solution.heroImageFit !== "cover" ? "contain" : "cover"}
      fallbackBg={solution.iconBg}
    >
      {price && (
        <p className="mt-3 text-[14px] font-semibold text-ink">
          Starting from {price.replace(/^From /, "")}
        </p>
      )}
    </ServiceCard>
  )
}
