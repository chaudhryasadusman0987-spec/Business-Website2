import Link from "next/link"

export default function QuoteCTABanner() {
  return (
    <section className="bg-brand-primary py-[80px] text-center">
      <div className="max-w-[1170px] mx-auto px-4">
        <h2 className="text-[45px] font-bold text-white uppercase leading-tight">
          Get Your Free Quote Today
        </h2>
        <p className="text-white/80 text-lg mt-4">
          Fast response. No obligation. Australia-wide.
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-brand-primary rounded-[5px] text-[17px] font-medium h-[69px] px-10 transition-all duration-500"
          >
            Get Free Quote
          </Link>
        </div>
      </div>
    </section>
  )
}
