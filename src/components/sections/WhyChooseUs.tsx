import { ShieldCheck, Globe } from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
    description: "Service and support right across the country.",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="pt-[200px] pb-[100px] bg-brand-primary">
      <div className="max-w-[1170px] mx-auto px-4">
        <h2 className="text-[45px] font-bold uppercase text-white text-center mb-16">
          Why Choose Us
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {features.map(({ Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="flex justify-center mb-5 text-white">
                <Icon size={48} />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
              <p className="text-white/80 text-[15px] leading-[24px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
