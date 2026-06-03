import { ClipboardCheck, PencilRuler, Wrench } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"

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
    <section className="bg-[#fefefd] pt-[80px] pb-[80px]">
      <div className="max-w-[1170px] mx-auto px-4">
        <SectionTitle
          title="How It Works"
          subtitle="From first call to fully installed — three simple steps."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl p-8 text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-[16px] mx-auto flex items-center justify-center bg-[rgba(127,133,247,0.12)]">
                <step.icon size={26} className="text-brand-primary" />
              </div>
              <p className="text-brand-primary font-bold text-[14px] mt-4">
                Step {i + 1}
              </p>
              <h3 className="font-bold text-[20px] text-[#1a1a2e] mt-1">
                {step.title}
              </h3>
              <p className="text-[14px] text-gray-500 mt-3 leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
