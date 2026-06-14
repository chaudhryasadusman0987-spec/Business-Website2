export interface BlogSection {
  heading?: string
  body: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
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

export const blogPosts: BlogPost[] = [
  {
    slug: "cctv-buying-guide-2025",
    title: "The 2025 CCTV Buying Guide for Australian Homes & Businesses",
    excerpt:
      "Resolution, storage, night vision and remote access — everything you need to know before installing security cameras this year.",
    category: "Security",
    categoryColor: "#f57c00",
    author: "James D.",
    authorRole: "Head of Security",
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
    slug: "long-term-car-rental-vs-buying",
    title: "Long-Term Car Rental vs Buying: What Makes Sense in 2025?",
    excerpt:
      "Flexible mobility is changing how Australians think about owning a car. Here's how the numbers really stack up.",
    category: "Car Rental",
    categoryColor: "#4caf50",
    author: "Kevin L.",
    authorRole: "Operations Manager",
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
    title: "5 Ways Small Businesses Are Using AI Automation Right Now",
    excerpt:
      "AI isn't just for tech giants. Here are five practical automations Australian small businesses are deploying today.",
    category: "IT & AI",
    categoryColor: "#7f85f7",
    author: "Sarah M.",
    authorRole: "Lead Developer",
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
    title: "Alarm Systems Explained: Monitored vs Self-Monitored",
    excerpt:
      "Should you pay for professional monitoring or watch your own alerts? We break down the trade-offs.",
    category: "Security",
    categoryColor: "#f57c00",
    author: "James D.",
    authorRole: "Head of Security",
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
    title: "Why a Faster Website Means More Customers",
    excerpt:
      "A one-second delay can cut conversions by 7%. Here's how page speed quietly shapes your bottom line.",
    category: "IT & AI",
    categoryColor: "#7f85f7",
    author: "Sarah M.",
    authorRole: "Lead Developer",
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
    title: "Choosing the Right Vehicle for Your Business Needs",
    excerpt:
      "From compact runabouts to spacious vans — matching the vehicle to the job saves money and headaches.",
    category: "Business Tips",
    categoryColor: "#f5a623",
    author: "Kevin L.",
    authorRole: "Operations Manager",
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
