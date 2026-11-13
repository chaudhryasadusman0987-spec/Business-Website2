import { ClipboardCheck, PencilRuler, Wrench } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"

const steps = [
  {
    icon: ClipboardCheck,
    title: "Free Site Assessment",
    text: "We visit your property, assess your needs, and recommend the right mix of solutions — at no cost.",
  },
  {
    icon: PencilRuler,
    title: "Custom Design & Quote",
    text: "You receive a tailored design and a transparent, itemised quote with no hidden fees.",
  },
  {
    icon: Wrench,
    title: "Professional Installation",
    text: "Our licensed installers fit everything cleanly, test it, and show you how it all works.",
  },
]

export default function HowItWorks() {
  return (
    <section className="section bg-surface">
      <div className="container-page">
        <SectionTitle
          eyebrow="The process"
          title="How It Works"
          subtitle="From first call to fully installed — three simple steps."
        />

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex">
              <AnimateIn animation="fade-up" delay={i * 100} className="flex w-full">
                <div className="card w-full p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                    <step.icon size={22} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 text-ink">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-muted">{step.text}</p>
                </div>
              </AnimateIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
