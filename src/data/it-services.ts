// TODO(dashboard): replace with API call when admin is live

export interface ITFeature {
  icon: string
  title: string
  description: string
}

export interface ITPackage {
  id: string
  name: string
  description: string
  startingFrom: string // display string, e.g. "From $2,500"
  startingFromValue: number // numeric value for quote calculation, e.g. 2500
  badge?: string
  features: string[]
}

export interface ITServiceItem {
  id: string
  name: string
  slug: string
  icon: string
  iconColor: string
  iconBg: string
  tagline: string
  description: string
  longDescription: string
  startingFrom: string
  badge?: string
  image: string
  imageAlt: string
  href: string
  packages: ITPackage[]
  features: ITFeature[]
  process: {
    step: string
    title: string
    description: string
  }[]
  technologies: string[]
}

// TODO(dashboard): admin updates startingFromValue here → quote form price
// tiles update automatically (the IT & AI quote wizard reads these values)
export const itServiceItems: ITServiceItem[] = [
  {
    id: "web-development",
    name: "Web Development",
    slug: "web-development",
    icon: "Globe",
    iconColor: "#1565c0",
    iconBg: "rgba(21,101,192,0.12)",
    tagline: "Websites that convert visitors into customers",
    description:
      "Fast, modern websites built for performance, SEO and conversions. From landing pages to full business websites.",
    longDescription:
      "We design and build professional websites that load fast, rank well on Google, and turn visitors into leads. Every site is mobile-first, SEO-optimised, and built with modern technology that lasts.",
    startingFrom: "From $2,500",
    image:
      "https://images.unsplash.com/photo-1744555270794-6d378b9e7cd3?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Professional web development Australia",
    href: "/services/it-services/web-development",
    packages: [
      {
        id: "web-starter",
        name: "Starter Website",
        description: "Perfect for small businesses and tradies",
        startingFrom: "From $2,500",
        startingFromValue: 2500,
        features: [
          "5-page professional website",
          "Mobile responsive design",
          "Contact form with email alerts",
          "Google Maps integration",
          "Basic SEO setup",
          "3 months support included",
        ],
      },
      {
        id: "web-business",
        name: "Business Website",
        description: "For growing businesses needing more",
        startingFrom: "From $5,500",
        startingFromValue: 5500,
        badge: "Most Popular",
        features: [
          "Up to 15 pages",
          "Custom design matching your brand",
          "Blog and news section",
          "Advanced SEO + Google Analytics",
          "Social media integration",
          "6 months support included",
        ],
      },
      {
        id: "web-ecommerce",
        name: "E-Commerce Store",
        description: "Sell online — Australia-wide or globally",
        startingFrom: "From $8,500",
        startingFromValue: 8500,
        features: [
          "Full online store",
          "Product management system",
          "Stripe and PayPal payments",
          "Inventory management",
          "Order tracking for customers",
          "12 months support included",
        ],
      },
    ],
    features: [
      { icon: "Zap", title: "Fast Loading", description: "Under 2 seconds page speed" },
      { icon: "Search", title: "SEO Optimised", description: "Built to rank on Google" },
      { icon: "Smartphone", title: "Mobile First", description: "Perfect on every device" },
      { icon: "Shield", title: "Secure by Default", description: "SSL and security hardening" },
    ],
    process: [
      { step: "01", title: "Discovery", description: "We learn your business goals and competitors" },
      { step: "02", title: "Design", description: "Mockups for your approval before we code" },
      { step: "03", title: "Build", description: "Coded fast with modern technology" },
      { step: "04", title: "Launch", description: "Tested, deployed and handed over to you" },
    ],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
  },
  {
    id: "app-development",
    name: "App Development",
    slug: "app-development",
    icon: "Smartphone",
    iconColor: "#6200ea",
    iconBg: "rgba(98,0,234,0.12)",
    tagline: "iOS and Android apps your customers will love",
    description:
      "Mobile apps built for Australian businesses. From concept to App Store — we handle everything.",
    longDescription:
      "We build mobile apps that solve real business problems. Customer-facing apps or internal business tools — we design, build and submit to the App Store for you.",
    startingFrom: "From $8,000",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Mobile app development Australia",
    href: "/services/it-services/app-development",
    packages: [
      {
        id: "app-mvp",
        name: "MVP App",
        description: "Test your idea fast on one platform",
        startingFrom: "From $8,000",
        startingFromValue: 8000,
        features: [
          "iOS or Android (one platform)",
          "Core features only — fast to market",
          "User login and authentication",
          "Basic admin dashboard",
          "App Store submission",
          "3 months support included",
        ],
      },
      {
        id: "app-full",
        name: "Full App",
        description: "iOS + Android with all features",
        startingFrom: "From $18,000",
        startingFromValue: 18000,
        badge: "Most Popular",
        features: [
          "iOS + Android both platforms",
          "Full feature set",
          "Push notifications",
          "In-app payments",
          "Web admin dashboard",
          "12 months support included",
        ],
      },
    ],
    features: [
      { icon: "Layers", title: "iOS + Android", description: "Both platforms from one build" },
      { icon: "Zap", title: "Fast and Smooth", description: "Native-like performance" },
      { icon: "Bell", title: "Push Notifications", description: "Re-engage your users anytime" },
      { icon: "Cloud", title: "Cloud Backend", description: "Scalable infrastructure" },
    ],
    process: [
      { step: "01", title: "Strategy", description: "Define features, flows and architecture" },
      { step: "02", title: "Design", description: "UI mockups for every screen" },
      { step: "03", title: "Develop", description: "Agile build with regular demos" },
      { step: "04", title: "Launch", description: "App Store submission and go-live" },
    ],
    technologies: ["React Native", "Expo", "TypeScript", "Node.js", "Firebase", "AWS"],
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    icon: "Bot",
    iconColor: "#0f6e56",
    iconBg: "rgba(15,110,86,0.12)",
    tagline: "Automate the repetitive. Focus on what matters.",
    description:
      "AI-powered tools that save your team hours every week. Chatbots, workflow automation and custom AI agents.",
    longDescription:
      "We build custom AI solutions that automate repetitive business tasks, answer customer enquiries 24/7, process documents and generate insights — built specifically for Australian businesses.",
    startingFrom: "From $1,500",
    badge: "Most Popular",
    image:
      "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "AI automation and chatbot development Australia",
    href: "/services/it-services/ai-automation",
    packages: [
      {
        id: "ai-chatbot",
        name: "AI Chat Agent",
        description: "Like the chat on this website",
        startingFrom: "From $1,500",
        startingFromValue: 1500,
        badge: "Best Value",
        features: [
          "Custom AI assistant for your website",
          "Trained on your business info and prices",
          "Collects leads automatically 24/7",
          "Answers FAQs without staff involvement",
          "Email and CRM integration",
          "30 days of tuning included",
        ],
      },
      {
        id: "ai-workflow",
        name: "Workflow Automation",
        description: "Automate your manual processes",
        startingFrom: "From $3,500",
        startingFromValue: 3500,
        features: [
          "Process mapping and analysis",
          "Custom automation scripts",
          "Email and document automation",
          "CRM and tool integrations",
          "Staff training included",
          "3 months support",
        ],
      },
      {
        id: "ai-custom",
        name: "Custom AI Solution",
        description: "Bespoke AI for your exact need",
        startingFrom: "Custom quote",
        startingFromValue: 0,
        features: [
          "Custom AI model or agent",
          "Data analysis and insights",
          "Document processing AI",
          "Predictive analytics",
          "API integrations",
          "Ongoing support plan",
        ],
      },
    ],
    features: [
      { icon: "Clock", title: "Save Hours Weekly", description: "Automate repetitive tasks instantly" },
      { icon: "TrendingUp", title: "More Leads", description: "AI collects leads while you sleep" },
      { icon: "Users", title: "Better Service", description: "24/7 AI-powered customer support" },
      { icon: "DollarSign", title: "Reduce Costs", description: "Less staff time on admin tasks" },
    ],
    process: [
      { step: "01", title: "Audit", description: "Map current processes and find automation wins" },
      { step: "02", title: "Design", description: "Build the automation architecture" },
      { step: "03", title: "Build", description: "Develop, test and refine the automation" },
      { step: "04", title: "Train", description: "Staff training and ongoing monitoring" },
    ],
    technologies: ["OpenAI", "Google Gemini", "Python", "n8n", "Make", "Zapier", "Node.js"],
  },
]

export const itConsulting = {
  name: "IT Consulting",
  icon: "Lightbulb",
  iconColor: "#f57c00",
  iconBg: "rgba(245,124,0,0.12)",
  tagline: "Expert technology advice for your business",
  description:
    "Not sure where to start with technology? We audit your current setup and give you a clear roadmap forward.",
  startingFrom: "From $150/hr",
  features: [
    "Technology audit and review",
    "Digital transformation roadmap",
    "Software selection advice",
    "Cybersecurity assessment",
    "Staff technology training",
    "IT infrastructure review",
  ],
}

export const itTechnologies = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "React Native",
  "Node.js",
  "Python",
  "PostgreSQL",
  "OpenAI",
  "Google Gemini",
  "n8n",
  "AWS",
  "Firebase",
  "Vercel",
  "Zapier",
]

export const itProcess = [
  {
    step: "01",
    title: "Free Consultation",
    description:
      "30-minute call to understand your goals, budget and timeline. No obligation.",
  },
  {
    step: "02",
    title: "Custom Proposal",
    description:
      "Detailed proposal with scope, timeline and fixed price. No surprises.",
  },
  {
    step: "03",
    title: "Build & Review",
    description:
      "Regular demos so you always know progress. We build it, you approve it.",
  },
  {
    step: "04",
    title: "Launch & Support",
    description:
      "Go live with confidence. Ongoing support available after every project.",
  },
]

// Backwards-compat: the AI agent prompt (src/lib/agent-prompt.ts) imports this.
// Derived from itServiceItems so there is still one source of truth.
export const itServices = itServiceItems.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  features: s.features.map((f) => f.title),
  startingFrom: s.startingFrom,
  iconName: s.icon,
}))
