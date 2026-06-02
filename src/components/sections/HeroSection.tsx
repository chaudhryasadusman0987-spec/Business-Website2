import { ShieldCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import { SITE_TAGLINE } from "@/data/site"

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center bg-brand-section">
      <div className="max-w-[1170px] mx-auto px-4 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
          {/* Left */}
          <div className="flex-1 lg:w-[60%]">
            <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-4">
              Australia&apos;s Multi-Service Experts
            </p>
            <h1 className="text-[40px] lg:text-[80px] font-bold leading-tight lg:leading-[90px] text-[#2d2d2c] mb-6">
              Securing <span className="text-brand-primary">Australia</span>
            </h1>
            <p className="text-[17px] leading-[28px] text-[#666666] mb-8 max-w-lg">
              {SITE_TAGLINE}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="dark" href="/contact">
                Get Free Quote
              </Button>
              <Button variant="outline" href="#services">
                Our Services
              </Button>
            </div>
          </div>

          {/* Right */}
          <div className="lg:w-[40%] w-full bg-brand-light rounded-3xl min-h-[400px] flex items-center justify-center">
            <div className="text-white text-center">
              <ShieldCheck size={120} className="mx-auto mb-4 opacity-80" />
              <p className="text-sm opacity-70">Hero Image</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
