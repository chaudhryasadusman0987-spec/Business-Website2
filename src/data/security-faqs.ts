// FAQ copy for the security hub and the access control page. Prices and the
// licence number come from security-offer.ts / site.ts, so an unset value
// shows its placeholder on previews and is left out of the sentence in
// production — never a made-up figure.

import type { Faq } from "@/components/sections/FaqSection"
import { SECURITY_WARRANTY, SECURITY_LICENCE_NO, SITE_HOURS } from "@/data/site"
import {
  solutionCards,
  accessControlPrices,
  fromPrice,
  filled,
  LICENCE_PLACEHOLDER,
} from "@/data/security-offer"

/** " Most … start from $X." when a price (or its placeholder) is available. */
function priceSentence(lead: string, value: string): string {
  const p = fromPrice(value)
  return p ? ` ${lead} ${p.replace(/^From /, "from ")}.` : ""
}

export function securityHubFaqs(): Faq[] {
  const licenceNo = filled(SECURITY_LICENCE_NO, LICENCE_PLACEHOLDER)
  return [
    {
      q: "How much does CCTV installation cost in Brisbane?",
      a:
        "It depends on how many cameras you need, the cable runs and how much recording storage you want." +
        priceSentence("Our installed CCTV systems start", solutionCards.surveillance.from) +
        " After a free site assessment you get an itemised quote, so you can see exactly what each part costs. GST is extra.",
    },
    {
      q: "How many cameras does a house need?",
      a:
        "Most homes are well covered with four cameras: the front door, the driveway, the back yard and a side gate. " +
        "Larger blocks, sheds or a second street frontage may need more. We work out the right number on the site visit rather than selling a fixed kit.",
    },
    {
      q: "Can I watch my cameras on my phone?",
      a:
        "Yes. Every system we install can be set up for live and recorded viewing on iPhone and Android. " +
        "We set the app up with you on the day and show you how to find and save footage.",
    },
    {
      q: "How many days of footage will I have?",
      a:
        "That depends on the number of cameras, the resolution and the size of the recorder's hard drive. " +
        "We size the recorder so a typical home system keeps around 30 days of footage, and can add storage if you need longer.",
    },
    {
      q: "What licences should a security installer have in Queensland?",
      a:
        "When you compare installers, ask which licences and insurance they hold and check them before work starts." +
        (licenceNo ? ` Our Queensland security licence number is ${licenceNo}.` : "") +
        " Any 240V hardwired work, such as mains-powered smoke alarms, must also be done by an electrician who holds a current Queensland electrical licence.",
    },
    {
      q: "What warranty do you give?",
      a: `Equipment we supply and install comes with a ${SECURITY_WARRANTY}. If a part fails within that time, contact us and we'll arrange a repair or replacement.`,
    },
    {
      q: "How do I pay?",
      a:
        "We take a 75% deposit to book your installation and the remaining 25% when the job is finished and you're happy with it. " +
        "Your quote lists every item, so there are no surprise extras on the day.",
    },
    {
      q: "Can you install this week?",
      a:
        "For standard home installs in Brisbane we can often install the same week, subject to availability. " +
        `Larger and commercial jobs are booked in after the site assessment. Call us during business hours (${SITE_HOURS}) to check the next free slot.`,
    },
  ]
}

export function accessControlFaqs(): Faq[] {
  const keypad = accessControlPrices[0].from
  return [
    {
      q: "How much does access control cost in Brisbane?",
      a:
        "A single keypad door is the cheapest option; multi-door systems with cards, phone access or a video intercom cost more." +
        priceSentence("Keypad entry starts", keypad) +
        " See the pricing guide above for each type. Prices are installed, GST extra, and confirmed after a free site assessment.",
    },
    {
      q: "Can I unlock the door from my phone?",
      a:
        "Yes, with a phone or app-based system. You can unlock doors remotely, send temporary access to a tradie or guest, and get a notification when someone comes in.",
    },
    {
      q: "What happens in a power cut?",
      a:
        "We fit a backup battery so the controller and readers keep working through a typical outage. " +
        "Each door is also set up as fail-safe (unlocks without power, used on exit routes) or fail-secure (stays locked), depending on its role and fire-safety needs.",
    },
    {
      q: "Can access control work with my CCTV cameras?",
      a:
        "Yes. Entries can be linked to your CCTV so you can see footage of who opened a door, and a video intercom lets you see and talk to visitors before you let them in.",
    },
    {
      q: "How long does installation take?",
      a:
        "A single keypad or fob door is usually done in a day. Multi-door systems, gates and apartment entries take longer, and we give you a timeframe with your quote.",
    },
    {
      q: "Will it work with my existing doors and locks?",
      a:
        "Usually, yes. Most standard doors can take an electric strike or magnetic lock, and many gates can be fitted with an access controller. " +
        "We check the door, frame and existing hardware on the site visit and tell you if anything needs replacing.",
    },
    {
      q: "Who adds and removes users, and do you offer support?",
      a:
        "You do. We show you how to add and remove users, change PINs and cancel lost cards or fobs straight away. " +
        `After installation you can call our local team for help, and hardware is covered by our ${SECURITY_WARRANTY}.`,
    },
  ]
}
