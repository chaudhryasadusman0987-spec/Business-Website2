import Image from "next/image"
import { Star } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import { testimonials } from "@/data/testimonials"

export default function TestimonialsStrip() {
  return (
    <section className="pt-[200px] pb-[100px] bg-brand-section">
      <div className="max-w-[1170px] mx-auto px-4">
        <SectionTitle
          title="What Our Clients Say"
          subtitle="Real feedback from homes and businesses we've helped across Australia."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 text-brand-primary">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-[#666] mt-4 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-[#2f2f2f]">{t.name}</p>
                  <p className="text-sm text-gray-400">
                    {t.suburb}, {t.state}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
