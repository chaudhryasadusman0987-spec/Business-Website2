import Image from "next/image"
import SectionTitle from "@/components/ui/SectionTitle"
import Button from "@/components/ui/Button"
import { SITE_FULL } from "@/data/site"

export default function AboutStrip() {
  return (
    <section className="pt-[200px] bg-brand-section">
      <div className="max-w-[1170px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left — image */}
          <div className="lg:w-[45%] w-full relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/about.jpg"
              alt={`The ${SITE_FULL} team at work`}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          {/* Right — text */}
          <div className="lg:w-[55%]">
            <SectionTitle title="About Us" align="left" />
            <p className="text-[17px] leading-[28px] text-[#666666] mt-5">
              {SITE_FULL} is an Australian multi-service company bringing
              security, mobility, and technology together under one roof. From
              complete security solutions to flexible car rental and custom
              software, we help homes and businesses across the country run
              safer and smarter.
            </p>
            <p className="text-[17px] leading-[28px] text-[#666666] mt-4">
              Our licensed, friendly team is focused on honest advice, quality
              workmanship, and support you can rely on — every step of the way.
            </p>
            <div className="mt-6">
              <Button variant="dark" href="/about">
                Read More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
