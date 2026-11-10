import type { Metadata } from "next"
import Link from "next/link"
import JsonLd, { serviceJsonLd } from "@/components/seo/JsonLd"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import {
  RentalHero,
  ProseSection,
  TermsSheet,
  DriverRequirements,
  HowToStart,
  FaqSection,
  CheckList,
  FleetCta,
  FLEET_HREF,
  PROSE_LINK,
} from "@/components/car-rental/LandingParts"
import { longTermFaqs } from "@/data/car-rental-pages"
import { getSpoke, serviceCrumbs } from "@/data/internal-links"
import { RENTAL_BRAND, RENTAL_LOCALITY } from "@/data/site"
import { getFleetSummary, weeklyRange } from "@/lib/fleet-summary"

// The price range is read from the live fleet, like the hub.
export const dynamic = "force-dynamic"

const PATH = "/services/car-rental/long-term"
const spoke = getSpoke("long-term")

/** Average weeks in a month, for the "about $X a month" figure. */
const WEEKS_PER_MONTH = 52 / 12

export async function generateMetadata(): Promise<Metadata> {
  const fleet = await getFleetSummary()
  const from = fleet ? ` from $${fleet.minWeekly}/week` : ""
  return {
    title: { absolute: "Long Term Car Rental Brisbane | Weekly Car Hire" },
    description:
      `Long term car rental in Brisbane${from}. 4-week minimum, then week to week. ` +
      "Servicing, insurance and roadside assistance included.",
    alternates: { canonical: PATH },
  }
}

export default async function LongTermPage() {
  const fleet = await getFleetSummary()
  const range = fleet ? weeklyRange(fleet) : null
  const monthlyFrom = fleet ? Math.round((fleet.minWeekly * WEEKS_PER_MONTH) / 10) * 10 : null

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Long Term Car Rental Brisbane",
          serviceType: "Long-term car rental",
          description:
            "Weekly car rental in Brisbane with a four-week minimum, then week to week. Servicing, insurance and roadside assistance included.",
          path: PATH,
        })}
      />

      <RentalHero
        crumbs={serviceCrumbs("car-rental", { name: "Long-Term Rental", href: PATH })}
        eyebrow={`${RENTAL_BRAND} · Weekly hire`}
        title={
          <>
            Long term car rental <span className="text-[#7f85f7]">in Brisbane</span>
          </>
        }
        stats={[
          { value: range ?? "Weekly", label: range ? "Per week" : "Payment cycle" },
          { value: "4", label: "Week minimum" },
          { value: "1 week", label: "Notice after that" },
        ]}
      >
        <p>
          Long term car rental in Brisbane, paid by the week: keep a car for four weeks or for a year, with
          servicing, insurance and roadside assistance included in one weekly price. It&apos;s weekly car rental
          without the daily-hire prices, and without buying a car you might only need for a few months.
          <HubLink spoke={spoke} />
        </p>
      </RentalHero>

      <ProseSection eyebrow="How the term works" heading="Four weeks minimum, then week to week">
        <p>
          Every rental starts with a four-week minimum. After that it carries on week to week until either of us
          gives one week&apos;s written notice. There&apos;s no fixed end date to commit to and no lock-in contract:
          you keep the car for as long as it&apos;s useful and return it when it isn&apos;t.
        </p>
        <p>
          Rent is charged weekly, in advance. Pay by card or direct debit and it comes out automatically on the
          same weekday each week, or pay by bank transfer. If you return the car before the first four weeks are
          up, half of the remaining rent up to the four-week mark is still payable, unless we&apos;ve agreed
          otherwise in writing.
        </p>
      </ProseSection>

      <ProseSection tone="grey" eyebrow="What's included" heading="One weekly price, most of the running costs covered">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div>
            <h3 className="font-bold text-[17px] text-[#1a1a2e] mb-3">Included</h3>
            <CheckList
              items={[
                "Servicing and maintenance, booked and paid by us.",
                "Comprehensive insurance, subject to the $1,300 excess.",
                "Roadside assistance for breakdowns that aren't your fault.",
                "Unlimited kilometres under normal use.",
                "A full tank of fuel at pickup.",
              ]}
            />
          </div>
          <div>
            <h3 className="font-bold text-[17px] text-[#1a1a2e] mb-3">Not included</h3>
            <CheckList
              items={[
                "Fuel after the first tank. Return it full or refuelling is $2.50 a litre.",
                "Tolls, fines and parking charges during the rental.",
                "Drivers not named on the agreement.",
                "Roadside call-outs you cause: flat battery, lost keys, punctures.",
              ]}
            />
          </div>
        </div>
        <p>
          Because servicing is on us, there are no surprise repair bills. If something mechanical goes wrong
          that isn&apos;t your fault, we fix it. Insurance covers Queensland only, and the car should stay within
          100 km of Brisbane unless we agree otherwise.
        </p>
      </ProseSection>

      <ProseSection eyebrow="Price" heading={range ? `Weekly car rental: ${range} a week` : "Weekly car rental prices"}>
        <p>
          {range ? (
            <>
              Weekly rates on the yard today run <strong>{range} per week</strong>
              {monthlyFrom ? <>, which works out at roughly ${monthlyFrom.toLocaleString("en-AU")} a month at the low end</> : null}
              .{" "}
            </>
          ) : (
            <>Each car&apos;s weekly rate is shown in the fleet. </>
          )}
          Small petrol hatchbacks are the cheapest; newer sedans, SUVs and utes cost more. Each car has its own
          refundable bond, shown with the car, and paid together with the first week before pickup.
        </p>
        <p>
          Compared with buying, there&apos;s no deposit on a loan, no registration or insurance renewals and no
          depreciation. For a full comparison, read{" "}
          <Link href="/blog/long-term-car-rental-vs-buying" className={PROSE_LINK}>
            long-term car rental vs buying
          </Link>
          .
        </p>
        <TermsSheet className="mt-6" />
      </ProseSection>

      <ProseSection tone="grey" eyebrow="Who it suits" heading="When a weekly rental makes more sense than buying">
        <CheckList
          items={[
            "You've just moved to Brisbane and want to settle in before buying a car.",
            "You're an international student or on a working visa with a valid licence.",
            "Your own car is off the road for repairs or an insurance claim.",
            "You've started a new job and need transport before your first few pays come through.",
            "You need a second car for a few months: a new baby, a renovation, a family visitor.",
          ]}
        />
        <p>
          Driving for Uber or DiDi? The same weekly terms apply. See{" "}
          <Link href="/services/car-rental/rideshare" className={PROSE_LINK}>
            rideshare car rental in Brisbane
          </Link>{" "}
          for the cars that suit the apps and what the platforms require.
        </p>
      </ProseSection>

      <ProseSection eyebrow="Requirements" heading="Who can rent">
        <DriverRequirements />
      </ProseSection>

      <ProseSection tone="grey" eyebrow="How to start" heading="From application to pickup">
        <p>
          Choose a car in the{" "}
          <Link href={FLEET_HREF} className={PROSE_LINK}>
            rental fleet
          </Link>
          , apply online, and collect it from our yard in {RENTAL_LOCALITY}. Most customers drive away the same
          week.
        </p>
        <HowToStart />
      </ProseSection>

      <FaqSection faqs={longTermFaqs} heading="Long-term rental questions" />

      <RelatedServices spoke={spoke} />

      <FleetCta hubAnchor="Brisbane car rental service" fleetAnchor="View our rental fleet" />
    </>
  )
}
