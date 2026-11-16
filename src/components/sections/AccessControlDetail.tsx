import {
  BatteryCharging,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Cctv,
  CreditCard,
  GraduationCap,
  History,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import HowItWorks, { type HowItWorksStep } from "@/components/sections/HowItWorks"
import FaqSection from "@/components/sections/FaqSection"
import ReviewsBlock from "@/components/reviews/ReviewsBlock"
import { getGoogleReviews } from "@/lib/googleReviews"
import { accessControlPrices, fromPrice, licenceLabel } from "@/data/security-offer"
import { accessControlFaqs } from "@/data/security-faqs"
import { SECURITY_BRAND, SECURITY_PAYMENT_TERMS, SECURITY_WARRANTY } from "@/data/site"

// Access-control-only sections for /services/security-solutions/access-control.
// Prices and the licence number are placeholders until filled in
// security-offer.ts / site.ts — see the notes there.

const audiences = [
  {
    title: "Homes",
    body:
      "A keypad or phone-controlled lock on the front or side door means no more hidden spare keys. " +
      "You can let a cleaner or tradie in for a set time, and add a video intercom if you want to see who's there before you open up.",
  },
  {
    title: "Offices & shops",
    body:
      "Key fobs or swipe cards suit most small businesses. Each staff member gets their own credential, " +
      "access can be limited to opening hours, and the log shows who opened which door and when.",
  },
  {
    title: "Apartment buildings",
    body:
      "Shared entries, car park gates and lifts are usually run on fobs plus a video intercom that calls each unit. " +
      "Building managers can add or cancel fobs without changing locks, which suits tenant turnover and body-corporate rules.",
  },
  {
    title: "Gates & car parks",
    body:
      "Driveway and car park gates can open by keypad, fob, remote, phone or intercom. " +
      "Where possible we connect to your existing gate motor, and we check the safety sensors so the gate won't close on a car or a person.",
  },
]

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: History,
    title: "Audit logs",
    body: "See who opened each door and when — useful for staff questions, insurance claims, or just knowing the shop was locked up on time.",
  },
  {
    icon: CalendarClock,
    title: "Time schedules",
    body: "Doors unlock for trading hours and lock themselves afterwards. Staff credentials can be limited to the days and hours they work.",
  },
  {
    icon: Smartphone,
    title: "Remote unlock",
    body: "Open a door or gate from your phone for a delivery, a tradie, or a family member who left their fob at home.",
  },
  {
    icon: CreditCard,
    title: "Lost card cancellation",
    body: "Cancel a lost card or fob in seconds instead of rekeying every lock, then issue a replacement on the spot.",
  },
  {
    icon: Cctv,
    title: "CCTV integration",
    body: "Link door events to your security cameras so you can pull up footage of each entry, and pair the front door with a video intercom.",
  },
  {
    icon: BatteryCharging,
    title: "Battery backup",
    body: "A backup battery keeps the controller and readers running through a typical power cut, so the building stays secure.",
  },
]

const steps: HowItWorksStep[] = [
  {
    icon: ClipboardCheck,
    title: "Free site visit",
    text: "We look at your doors, gates, frames and power supply, and talk through who needs access and when.",
  },
  {
    icon: ClipboardList,
    title: "Itemised quote",
    text: "You get a written quote listing every reader, lock, controller and the labour, so you can see where the money goes.",
  },
  {
    icon: Wrench,
    title: "Installation",
    text: "We fit and wire the hardware, set up your users and schedules, and test every door and gate before we leave.",
  },
  {
    icon: GraduationCap,
    title: "Training & support",
    text: "We show you how to add and remove users, read the logs and unlock remotely. After that, our local team is a phone call away.",
  },
]

/** Pricing guide + "Which system is right for you?" — sits above the products. */
export function AccessControlIntro() {
  return (
    <>
      <section id="pricing" className="bg-white on-light py-14 lg:py-20 scroll-mt-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Pricing guide"
            title="Access Control Prices in Brisbane"
            subtitle="Starting prices for a single door or gate with standard hardware. Extra doors, longer cable runs, new locks or links to existing systems add to the cost."
          />
          <div className="mt-10 overflow-hidden rounded-card border border-line on-light">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead className="bg-surface text-[13px] uppercase tracking-[0.06em] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-6">System</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">Suits</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold sm:px-6">Installed price</th>
                </tr>
              </thead>
              <tbody>
                {accessControlPrices.map((row) => (
                  <tr key={row.system} className="border-t border-line">
                    <th scope="row" className="px-4 py-4 font-semibold text-ink sm:px-6">
                      {row.system}
                      <span className="mt-1 block text-[13px] font-normal text-muted sm:hidden">{row.suits}</span>
                    </th>
                    <td className="hidden px-4 py-4 text-muted sm:table-cell sm:px-6">{row.suits}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-ink sm:px-6">
                      {fromPrice(row.from) ?? "Quote on request"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-[14px] text-muted">
            Installed prices, GST extra. Final price after a free site assessment.
          </p>
        </div>
      </section>

      <section className="bg-surface on-light py-14 lg:py-20">
        <div className="container-page">
          <SectionTitle
            title="Which System Is Right for You?"
            subtitle="The right setup depends on the building and who needs to get in."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {audiences.map((a) => (
              <div key={a.title} className="card p-6">
                <h3 className="text-ink">{a.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-muted">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/** Features, process, trust + reviews and FAQ — sits below the products. */
export async function AccessControlMore() {
  const summary = await getGoogleReviews()
  const licence = licenceLabel()
  const reasons: { icon: LucideIcon; title: string; body: string }[] = [
    ...(licence
      ? [{ icon: ShieldCheck, title: licence, body: "Ask to see it on the site visit — we're happy to show it." }]
      : []),
    {
      icon: ShieldCheck,
      title: SECURITY_WARRANTY.charAt(0).toUpperCase() + SECURITY_WARRANTY.slice(1),
      body: "On the equipment we supply and install. If a part fails in that time, we sort it out.",
    },
    {
      icon: MapPin,
      title: "Local Brisbane installers",
      body: "We're based in Brisbane and install and support systems across Southeast QLD.",
    },
    {
      icon: Wallet,
      title: SECURITY_PAYMENT_TERMS.charAt(0).toUpperCase() + SECURITY_PAYMENT_TERMS.slice(1),
      body: "You pay the balance only once the system is installed, tested and you're happy with it.",
    },
  ]

  return (
    <>
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="container-page">
          <SectionTitle
            eyebrow="Features"
            title="What Our Access Control Systems Do"
            subtitle="Every system is set up around how your building is actually used."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                  <f.icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks steps={steps} subtitle="From the first visit to a system your team knows how to use." />

      <section className="bg-white on-light py-14 lg:py-20">
        <div className="container-page">
          <SectionTitle title={`Why ${SECURITY_BRAND}`} />
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <li key={r.title} className="card p-6">
                <r.icon size={22} aria-hidden="true" className="text-[#0F6E56]" />
                <h3 className="mt-3 text-[17px] text-ink">{r.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ReviewsBlock summary={summary} limit={3} empty="hide" />

      <FaqSection
        faqs={accessControlFaqs()}
        title="Access Control FAQs"
        className="bg-surface on-light py-14 lg:py-20"
      />
    </>
  )
}
