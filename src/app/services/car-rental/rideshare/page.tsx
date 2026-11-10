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
  CarCards,
  CheckList,
  FleetCta,
  FLEET_HREF,
  PROSE_LINK,
} from "@/components/car-rental/LandingParts"
import { rideshareFaqs } from "@/data/car-rental-pages"
import { getSpoke, serviceCrumbs } from "@/data/internal-links"
import { RENTAL_BRAND, RENTAL_LOCALITY } from "@/data/site"
import { getFleetSummary, weeklyRange } from "@/lib/fleet-summary"

// Prices and the car list come from the live fleet, like the hub.
export const dynamic = "force-dynamic"

const PATH = "/services/car-rental/rideshare"
const spoke = getSpoke("rideshare")

export async function generateMetadata(): Promise<Metadata> {
  const fleet = await getFleetSummary()
  const from = fleet ? ` from $${fleet.minWeekly}/week` : ""
  return {
    title: { absolute: "Rideshare Car Rental Brisbane | Uber & DiDi Cars" },
    description:
      `Rideshare car rental in Brisbane for Uber and DiDi drivers${from}. ` +
      "Unlimited km, servicing and roadside included. 4-week minimum.",
    alternates: { canonical: PATH },
  }
}

export default async function RidesharePage() {
  const fleet = await getFleetSummary()
  const range = fleet ? weeklyRange(fleet) : null
  const cars = fleet?.rideshare ?? []

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Rideshare Car Rental Brisbane",
          serviceType: "Rideshare car rental",
          description:
            "Weekly car rental in Brisbane for Uber and DiDi drivers, with unlimited kilometres, servicing and roadside assistance included.",
          path: PATH,
        })}
      />

      <RentalHero
        crumbs={serviceCrumbs("car-rental", { name: "Rideshare", href: PATH })}
        eyebrow={`${RENTAL_BRAND} · Uber & DiDi`}
        title={
          <>
            Rideshare car rental <span className="text-[#7f85f7]">in Brisbane</span>
          </>
        }
        stats={[
          { value: range ? `${range}` : "Weekly", label: range ? "Per week" : "Payment cycle" },
          { value: "4", label: "Week minimum" },
          { value: "Unlimited", label: "Kilometres" },
        ]}
      >
        <p>
          Rideshare car rental in Brisbane for Uber and DiDi drivers who want to start earning without buying a
          car. Rent by the week, drive as many kilometres as you need, and leave the servicing and roadside
          assistance to us.
          <HubLink spoke={spoke} />
        </p>
      </RentalHero>

      <ProseSection eyebrow="Who it's for" heading="Drivers who'd rather not buy a car to drive for a living">
        <p>
          Buying a car to drive rideshare ties up thousands of dollars before you&apos;ve earned anything, and
          the car loses value with every shift. Renting by the week turns that into one fixed cost you can plan
          around. If the work doesn&apos;t suit you, you give notice after the minimum term instead of trying to
          sell a car.
        </p>
        <CheckList
          items={[
            "New drivers who want to try Uber or DiDi before committing to a car of their own.",
            "Experienced drivers whose own car is off the road for repairs, or has aged out of the apps' rules.",
            "International students and new arrivals with a valid licence who need income and transport at once.",
            "Part-time drivers who want one car for both the apps and everyday life.",
          ]}
        />
        <p>
          Use the same car for Uber and DiDi. Running both apps cuts the waiting time between trips, and once
          rideshare use is approved on your agreement it covers the car, not one platform.
        </p>
      </ProseSection>

      <ProseSection
        tone="grey"
        eyebrow="The cars"
        heading="Cars on the yard that suit rideshare"
        id="cars"
        wide={
          <>
            {cars.length > 0 ? (
              <CarCards cars={cars} />
            ) : (
              <p className="text-[15px] text-[#666]">
                The live list isn&apos;t available right now.{" "}
                <Link href={FLEET_HREF} className={PROSE_LINK}>
                  See every car on the yard
                </Link>{" "}
                instead.
              </p>
            )}
            <p className="mt-6 text-[14px] text-[#666]">
              Open a car in the{" "}
              <Link href={FLEET_HREF} className={PROSE_LINK}>
                full rental fleet
              </Link>{" "}
              for its photos, specs and bond, and to apply.
            </p>
          </>
        }
      >
        <p>
          These are the bookable sedans, hatchbacks and SUVs with five seats, cheapest first. Hybrids such as
          the Prius use noticeably less fuel in stop-start city driving, which adds up over a week of shifts.
          Utes are left off this list because the apps generally won&apos;t accept them for standard trips.
        </p>
        <p className="text-[14px] text-[#666]">
          Uber and DiDi each set a maximum vehicle age, and it varies by product (UberX, Comfort and so on) and
          changes over time. Check the year of the car against the app&apos;s current rules before you apply, or
          ask us which cars are cleared for rideshare right now.
        </p>
      </ProseSection>

      <ProseSection eyebrow="Price" heading={range ? `Weekly rent: ${range}` : "Weekly rent"}>
        <p>
          {range ? (
            <>
              Rideshare cars cost the same as any other rental: <strong>{range} per week</strong> at
              today&apos;s rates, depending on the car.{" "}
            </>
          ) : (
            <>Rideshare cars cost the same weekly rate as any other rental, shown on each car in the fleet. </>
          )}
          Older petrol hatchbacks sit at the bottom of the range; newer sedans and hybrids sit higher. Rent is
          charged weekly in advance, by card, direct debit or bank transfer, and a refundable bond is paid before
          you collect the car.
        </p>
        <p>
          What the weekly price includes: servicing and maintenance, comprehensive insurance (subject to the
          $1,300 excess), roadside assistance for breakdowns that aren&apos;t your fault, and unlimited
          kilometres under normal use. What it doesn&apos;t: fuel, tolls, fines, and any driver not named on the
          agreement.
        </p>
        <TermsSheet className="mt-6" />
      </ProseSection>

      <ProseSection tone="grey" eyebrow="Requirements" heading="What you need to rent a car for rideshare">
        <p>Our requirements, which apply to every rental:</p>
        <DriverRequirements />
        <p>
          On top of these, you need to meet Uber&apos;s or DiDi&apos;s own driver checks and the Queensland
          booked hire rules, which are separate from your rental. In Queensland, rideshare is regulated by the
          Department of Transport and Main Roads (TMR) as a booked hire service. Drivers generally need a driver
          authorisation, and the car needs the right registration and insurance for booked hire.
        </p>
        <p className="text-[14px] text-[#666]">
          Platform and government rules change. Always check the latest requirements with Uber, DiDi and TMR
          before you start driving. Our guide to{" "}
          <Link href="/blog/uber-didi-vehicle-requirements-brisbane" className={PROSE_LINK}>
            Uber and DiDi vehicle requirements in Brisbane
          </Link>{" "}
          is a good starting point.
        </p>
      </ProseSection>

      <ProseSection eyebrow="How to start" heading="From application to your first trip">
        <p>
          Most drivers are on the road within the same week. Tell us you plan to drive rideshare when we call:
          our terms only allow hire-or-reward use with written consent, so we record it on your agreement for the
          car you pick.
        </p>
        <HowToStart />
        <p className="pt-4">
          The yard is in {RENTAL_LOCALITY}, close to the Pacific and Gateway motorways, so you can be logged into
          the app and heading for the CBD or the airport soon after pickup. New to the apps? Read{" "}
          <Link href="/blog/start-driving-uber-brisbane-without-buying-a-car" className={PROSE_LINK}>
            how to start driving Uber in Brisbane without buying a car
          </Link>
          .
        </p>
      </ProseSection>

      <ProseSection tone="grey" eyebrow="Good to know" heading="Running costs and rules on the road">
        <CheckList
          items={[
            "Fuel: the car comes with a full tank and goes back full. Refuelling is charged at $2.50 a litre if it doesn't.",
            "Tolls and fines are yours. Each unpaid toll notice carries a $5 admin fee; each infringement nomination $10.",
            "Stay within 100 km of Brisbane unless we agree otherwise in writing. That covers the Gold Coast.",
            "Insurance covers Queensland only, and the $1,300 excess applies to at-fault claims.",
            "Roadside assistance is included for faults that aren't yours. A flat battery, lost keys or a puncture is charged to you.",
          ]}
        />
      </ProseSection>

      <FaqSection faqs={rideshareFaqs} heading="Rideshare rental questions" />

      <RelatedServices spoke={spoke} />

      <FleetCta hubAnchor="car rental in Brisbane" fleetAnchor="View our rental fleet" />
    </>
  )
}
