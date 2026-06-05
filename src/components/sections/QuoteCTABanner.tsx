import Link from "next/link"

interface QuoteCTABannerProps {
  href?: string
  title?: string
  subtitle?: string
}

export default function QuoteCTABanner({
  href = "/quote",
  title = "Get Your Free Quote Today",
  subtitle = "Fast response. No obligation. Australia-wide.",
}: QuoteCTABannerProps) {
  return (
    <section className="bg-brand-primary py-[80px] text-center">
      <div className="max-w-[1170px] mx-auto px-4">
        <h2 className="text-[45px] font-bold text-white uppercase leading-tight">
          {title}
        </h2>
        <p className="text-white/80 text-lg mt-4">{subtitle}</p>
        <div className="mt-8">
          <Link
            href={href}
            className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-brand-primary rounded-[5px] text-[17px] font-medium h-[69px] px-10 transition-all duration-500"
          >
            Get Free Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
