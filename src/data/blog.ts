export interface BlogSection {
  heading?: string
  body: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  /** Drives the post's Related-services links (see blogServiceLinks). */
  tags?: string[]
  categoryColor: string
  author: string
  authorRole: string
  date: string
  readTime: string
  image: string
  featured?: boolean
  content: BlogSection[]
}

export const blogCategories = [
  "All",
  "Security",
  "Car Rental",
  "IT & AI",
  "Business Tips",
] as const

// author/authorRole are real people — keep them in sync with the team listed
// on the about page (src/app/about/page.tsx).
export const blogPosts: BlogPost[] = [
  {
    slug: "cctv-buying-guide-2025",
    tags: ["cctv", "packages", "security-cameras"],
    title: "The 2025 CCTV Buying Guide for Australian Homes & Businesses",
    excerpt:
      "Resolution, storage, night vision and remote access — everything you need to know before installing security cameras this year.",
    category: "Security",
    categoryColor: "#f57c00",
    author: "Ehtsham",
    authorRole: "Owner & Director",
    date: "May 28, 2025",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80",
    featured: true,
    content: [
      {
        body: [
          "Choosing the right CCTV system is one of the smartest investments you can make for your home or business. But with dozens of brands, resolutions and recording options on the market, it's easy to feel overwhelmed. This guide breaks down what actually matters in 2025.",
        ],
      },
      {
        heading: "Resolution: how much is enough?",
        body: [
          "For most Australian homes, 4MP (2K) cameras hit the sweet spot between clarity and storage cost. Businesses that need to read number plates or identify faces from a distance should step up to 8MP (4K) on key entry points.",
          "Higher resolution means larger files, so balance image quality against how long you want to retain footage.",
        ],
      },
      {
        heading: "Storage and retention",
        body: [
          "A network video recorder (NVR) with a dedicated surveillance-grade hard drive is the reliable choice. As a rule of thumb, plan for at least 14 days of continuous recording — most insurers and incident reviews need a fortnight of history.",
          "Motion-only recording can dramatically extend retention without upgrading your drive.",
        ],
      },
      {
        heading: "Night vision and remote access",
        body: [
          "Infrared night vision is standard, but colour night vision (using low-light sensors and a warm spotlight) is now affordable and far more useful for identifying intruders.",
          "Finally, make sure your system offers a secure mobile app so you can check live footage and receive motion alerts from anywhere — this is the feature our customers value most.",
        ],
      },
    ],
  },
  {
    slug: "start-driving-uber-brisbane-without-buying-a-car",
    tags: ["rideshare", "uber", "didi", "fleet"],
    title: "How to Start Driving Uber in Brisbane Without Buying a Car",
    excerpt:
      "You don't need to own a car to drive Uber or DiDi in Brisbane. How weekly rental works, what it costs, and the steps from sign-up to your first trip.",
    category: "Car Rental",
    categoryColor: "#4caf50",
    author: "Tayyab Iftikhar",
    authorRole: "Director & Operations",
    date: "November 10, 2026",
    readTime: "6 min read",
    image: "/images/vehicles/car-rental-keys.jpg",
    content: [
      {
        body: [
          "Most people who want to drive rideshare hit the same wall: the apps want a recent, well-kept car, and buying one means a loan, insurance, rego and depreciation before you've earned a dollar. Renting a car by the week gets around that. You pay one fixed weekly amount, drive as much as you like, and hand the car back if rideshare turns out not to suit you.",
          "This guide walks through how that works in Brisbane, what to check before you start, and where the costs really sit.",
        ],
      },
      {
        heading: "Why rent instead of buy?",
        body: [
          "A car you buy to drive Uber loses value every week, whether you drive it or not. Servicing, tyres and brakes come round faster when you're doing full shifts, and when something breaks, you're off the road and not earning until it's fixed.",
          "With a weekly rental, servicing and maintenance are the rental company's job, roadside assistance is usually included, and the weekly cost doesn't change. If you decide after a couple of months that rideshare isn't for you, you give notice instead of trying to sell a car. Our [rideshare car rental in Brisbane](/services/car-rental/rideshare) is set up exactly this way: four-week minimum, then week to week, with unlimited kilometres.",
        ],
      },
      {
        heading: "Step 1: Check you can drive for Uber or DiDi",
        body: [
          "Before you rent anything, make sure you can actually get onto the apps. Uber and DiDi each run their own checks, usually covering your licence history, a criminal history check and your right to work in Australia. In Queensland, rideshare is regulated as a booked hire service by the Department of Transport and Main Roads (TMR), so you'll generally also need a driver authorisation.",
          "These rules change, so check the current requirements on Uber's and DiDi's driver sites and with TMR rather than relying on a blog post, including this one.",
        ],
      },
      {
        heading: "Step 2: Pick a car that suits the apps",
        body: [
          "Uber and DiDi want four-door cars with room for four passengers, in good condition, and younger than a maximum vehicle age that differs by product. A hybrid such as a Toyota Prius or Camry Hybrid is the classic choice because it uses so little fuel in stop-start traffic. Over a week of full shifts, the fuel saving can easily cover part of the rent.",
          "Our guide to [Uber and DiDi vehicle requirements in Brisbane](/blog/uber-didi-vehicle-requirements-brisbane) goes into more detail. You can also see [the cars on our yard that suit rideshare](/services/car-rental/rideshare), with their weekly rates.",
        ],
      },
      {
        heading: "Step 3: Rent it and get it approved for rideshare",
        body: [
          "Rental agreements usually prohibit using the car for hire or reward unless the owner agrees in writing, and ours is no different. Tell the rental company you plan to drive rideshare before you sign, so it's recorded on the agreement. Driving Uber in a rental that isn't approved for it can leave you uninsured.",
          "With us, you choose a car in the [rental fleet](/services/car-rental/vehicles), apply online, and we call to confirm the details, including rideshare use. You then sign the agreement, pay a refundable bond plus the first week, and collect the car. Most drivers are on the road the same week.",
        ],
      },
      {
        heading: "Step 4: Work out your real weekly costs",
        body: [
          "Your weekly rent is the biggest fixed cost, but not the only one. Budget for fuel, tolls (Brisbane has plenty), car washes, phone data, and tax: rideshare income is taxable, and rideshare drivers have to register for GST regardless of turnover. Keep records from day one, because rent and fuel are typically deductible business expenses. Talk to an accountant about your own situation.",
          "A simple rule: add up rent, fuel and tolls for a week, then aim for net fares comfortably above that. The first few weeks are slower while you learn where and when demand is highest.",
        ],
      },
      {
        heading: "Step 5: Drive smart",
        body: [
          "Running Uber and DiDi side by side cuts the waiting time between trips. Airport runs, Friday and Saturday nights and big events at the Gabba or Suncorp Stadium are busy. Track your earnings per hour, not per trip, and you'll quickly see which shifts are worth it.",
        ],
      },
      {
        heading: "Ready to start?",
        body: [
          "If you'd rather test rideshare before buying a car, a weekly rental is the lowest-risk way in. See the cars, prices and requirements on our [rideshare car rental](/services/car-rental/rideshare) page, or call us and we'll talk you through it.",
        ],
      },
    ],
  },
  {
    slug: "uber-didi-vehicle-requirements-brisbane",
    tags: ["rideshare", "uber", "didi", "rental-terms"],
    title: "Uber and DiDi Vehicle Requirements in Brisbane (2026)",
    excerpt:
      "What Uber and DiDi expect from a car in Brisbane in 2026: size, age, condition, registration and insurance. A plain-English guide to the rules.",
    category: "Car Rental",
    categoryColor: "#4caf50",
    author: "Tayyab Iftikhar",
    authorRole: "Director & Operations",
    date: "November 10, 2026",
    readTime: "5 min read",
    image: "/images/vehicles/midsize.jpg",
    content: [
      {
        body: [
          "Before you buy or rent a car to drive rideshare in Brisbane, it pays to know what the apps will accept. Uber and DiDi publish their own vehicle standards, and Queensland adds rules of its own for booked hire. This is a general overview of what those requirements usually cover in 2026.",
          "Important: requirements change, and they differ between products such as UberX, Uber Comfort and Uber XL. Always check the latest vehicle requirements on Uber's and DiDi's driver websites and with the Department of Transport and Main Roads (TMR) before you commit to a car.",
        ],
      },
      {
        heading: "Size and seating",
        body: [
          "For the standard products, both apps generally want a four-door car that seats at least four passengers plus the driver. In practice that means sedans, hatchbacks, wagons and SUVs. Two-door cars and most utes and vans won't qualify for standard trips. Larger products such as Uber XL need six or more passenger seats.",
        ],
      },
      {
        heading: "Vehicle age",
        body: [
          "Each platform sets a maximum vehicle age, counted from the year of manufacture. The limit isn't the same for every product: premium options such as Comfort or Black want much newer cars than the entry-level product. Limits have been revised before and may change again, so check the exact number for the product you want to drive before choosing a car.",
        ],
      },
      {
        heading: "Condition",
        body: [
          "Expect the car to need to be clean, roadworthy and free of major body damage, with working air-conditioning and seatbelts for every seat. Commercial branding or taxi-style markings are usually not allowed. The apps can ask for photos or an inspection, and riders can report a car in poor condition.",
        ],
      },
      {
        heading: "Registration, insurance and Queensland rules",
        body: [
          "In Queensland, rideshare is a booked hire service regulated by TMR. The car generally needs to be licensed, registered and insured correctly for booked hire, and standard private-use insurance usually won't cover you while you're carrying paying passengers. Drivers typically need their own driver authorisation as well.",
          "If you rent rather than own, the rental company has to agree to rideshare use. Most agreements, including ours, prohibit hire-or-reward use without written consent, so ask before you sign. Our [rental terms and conditions](/rental-terms) set this out.",
        ],
      },
      {
        heading: "Choosing a car that will pass",
        body: [
          "The safest choices are mainstream sedans and hatchbacks with a good service history: Toyota Camry and Corolla, Toyota Prius, Honda Jazz and similar. Hybrids are popular because they use far less fuel in city driving, which matters when fuel is your biggest variable cost.",
          "If you'd rather not buy, you can rent a car by the week instead. Our [rideshare car rental in Brisbane](/services/car-rental/rideshare) page lists the bookable cars on our yard that suit rideshare, with their year and weekly rate, so you can check them against the apps' current rules. New to the apps? Start with [how to start driving Uber in Brisbane without buying a car](/blog/start-driving-uber-brisbane-without-buying-a-car).",
        ],
      },
      {
        heading: "Before you start: a quick checklist",
        body: [
          "Check the current vehicle requirements for your chosen product on Uber's and DiDi's driver sites. Confirm the TMR booked hire requirements for you and the car. Make sure the car's insurance covers rideshare. If you're renting, get rideshare use approved in writing on your agreement. Then upload your documents in the driver app and wait for approval before taking your first trip.",
          "This article is general information only, not legal or tax advice. Platform and government requirements change. Check the latest Uber, DiDi and TMR requirements before you start driving.",
        ],
      },
    ],
  },
  {
    slug: "long-term-car-rental-vs-buying",
    tags: ["car-rental", "fleet", "rental-terms"],
    title: "Long-Term Car Rental vs Buying: What Makes Sense in 2025?",
    excerpt:
      "Flexible mobility is changing how Australians think about owning a car. Here's how the numbers really stack up.",
    category: "Car Rental",
    categoryColor: "#4caf50",
    author: "Tayyab Iftikhar",
    authorRole: "Director & Operations",
    date: "May 12, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
    content: [
      {
        body: [
          "With vehicle prices and interest rates still high, more Australians are asking whether long-term rental beats outright ownership. The answer depends on how you actually use a car.",
        ],
      },
      {
        heading: "The hidden cost of ownership",
        body: [
          "When you buy, the sticker price is only the start. Registration, insurance, servicing, tyres and depreciation can add thousands per year. A new car can lose 15–20% of its value the moment you drive it off the lot.",
        ],
      },
      {
        heading: "When rental wins",
        body: [
          "If you need a vehicle for under a year, drive irregularly, or want predictable monthly costs with servicing and insurance bundled in, long-term rental is usually cheaper and far less hassle.",
          "It's also ideal for contractors, new arrivals to Australia, and businesses that want a flexible fleet without a balance-sheet commitment.",
        ],
      },
    ],
  },
  {
    slug: "ai-automation-small-business",
    tags: ["ai", "automation", "web-design"],
    title: "5 Ways Small Businesses Are Using AI Automation Right Now",
    excerpt:
      "AI isn't just for tech giants. Here are five practical automations Australian small businesses are deploying today.",
    category: "IT & AI",
    categoryColor: "#7f85f7",
    author: "Asad",
    authorRole: "IT & Digital",
    date: "April 30, 2025",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    featured: true,
    content: [
      {
        body: [
          "Artificial intelligence has moved from buzzword to bottom-line. The businesses winning with AI aren't building moon-shot projects — they're automating the small, repetitive tasks that quietly eat hours every week.",
        ],
      },
      {
        heading: "1. Customer support chatbots",
        body: [
          "A well-trained chatbot can answer 70% of routine enquiries instantly — pricing, hours, booking — and hand the rest to a human. Customers get answers at midnight; your team gets their afternoons back.",
        ],
      },
      {
        heading: "2. Automated quoting and lead capture",
        body: [
          "Smart forms that qualify leads, calculate estimates and route enquiries to the right person mean no enquiry slips through the cracks — even on weekends.",
        ],
      },
      {
        heading: "3. Invoice and document processing",
        body: [
          "AI can read invoices, extract the key fields and push them straight into your accounting software, eliminating manual data entry and the errors that come with it.",
        ],
      },
      {
        heading: "4. Content and marketing drafts",
        body: [
          "From social posts to product descriptions, AI handles the first draft so your team can focus on review and strategy rather than the blank page.",
        ],
      },
      {
        heading: "5. Smart scheduling",
        body: [
          "Automated booking systems handle reminders, rescheduling and follow-ups, cutting no-shows and freeing up admin time.",
        ],
      },
    ],
  },
  {
    slug: "alarm-systems-explained",
    tags: ["alarms", "deterrence", "smoke-alarms"],
    title: "Alarm Systems Explained: Monitored vs Self-Monitored",
    excerpt:
      "Should you pay for professional monitoring or watch your own alerts? We break down the trade-offs.",
    category: "Security",
    categoryColor: "#f57c00",
    author: "Ehtsham",
    authorRole: "Owner & Director",
    date: "April 18, 2025",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80",
    content: [
      {
        body: [
          "Modern alarm systems fall into two broad camps: professionally monitored and self-monitored. Both have a place — the right choice comes down to your budget and how quickly you need a response.",
        ],
      },
      {
        heading: "Professional monitoring",
        body: [
          "A monitoring centre watches your system 24/7 and dispatches a patrol or alerts the authorities when an alarm trips. It's the gold standard for businesses and anyone who can't always respond personally.",
        ],
      },
      {
        heading: "Self-monitoring",
        body: [
          "With self-monitoring, alerts come straight to your phone. There's no monthly fee, but you (or a trusted contact) need to act on alarms. It's a solid, affordable option for many homes.",
        ],
      },
    ],
  },
  {
    slug: "website-speed-conversions",
    tags: ["web-design", "seo", "portfolio"],
    title: "Why a Faster Website Means More Customers",
    excerpt:
      "A one-second delay can cut conversions by 7%. Here's how page speed quietly shapes your bottom line.",
    category: "IT & AI",
    categoryColor: "#7f85f7",
    author: "Asad",
    authorRole: "IT & Digital",
    date: "April 2, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    content: [
      {
        body: [
          "Your website's speed isn't just a technical detail — it's a business metric. Visitors form an opinion in milliseconds, and every extra second of load time costs you customers.",
        ],
      },
      {
        heading: "The conversion connection",
        body: [
          "Studies consistently show that even a one-second delay can reduce conversions by around 7%. For an online store, that's real revenue lost to a spinning loader.",
        ],
      },
      {
        heading: "Quick wins",
        body: [
          "Compress and lazy-load images, minimise unused scripts, and use a modern framework with server-side rendering. These changes often shave seconds off load times without a full rebuild.",
        ],
      },
    ],
  },
  {
    slug: "choosing-business-vehicle",
    tags: ["car-rental", "fleet", "business"],
    title: "Choosing the Right Vehicle for Your Business Needs",
    excerpt:
      "From compact runabouts to spacious vans — matching the vehicle to the job saves money and headaches.",
    category: "Business Tips",
    categoryColor: "#f5a623",
    author: "Tayyab Iftikhar",
    authorRole: "Director & Operations",
    date: "March 20, 2025",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
    content: [
      {
        body: [
          "The right business vehicle balances running costs, capability and image. Before you commit, think about how the vehicle will actually earn its keep.",
        ],
      },
      {
        heading: "Match the vehicle to the workload",
        body: [
          "A compact hatch is perfect for city sales calls and tight parking. Tradespeople and couriers need the cargo space and payload of a van. Client-facing roles may justify a premium sedan or SUV.",
        ],
      },
      {
        heading: "Stay flexible",
        body: [
          "Business needs change. Renting lets you scale your fleet up or down with demand and always have the right vehicle for the season — without locking up capital in depreciating assets.",
        ],
      },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .concat(blogPosts.filter((p) => p.slug !== post.slug && p.category !== post.category))
    .slice(0, limit)
}
