import type { ITService } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const itServices: ITService[] = [
  {
    id: "web-development",
    name: "Web Development",
    description:
      "Fast, modern, responsive websites built to convert visitors into customers.",
    features: [
      "Responsive design",
      "SEO optimised",
      "Next.js & React",
      "CMS integration",
      "Ongoing support",
    ],
    startingFrom: "$1,499",
    iconName: "Globe",
  },
  {
    id: "app-development",
    name: "App Development",
    description:
      "Native and cross-platform mobile apps designed and built end-to-end.",
    features: [
      "iOS & Android",
      "Cross-platform",
      "UI/UX design",
      "API integration",
      "App store deployment",
    ],
    startingFrom: "$4,999",
    iconName: "Smartphone",
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    description:
      "Custom AI agents and workflow automation that save time and cut costs.",
    features: [
      "AI chat agents",
      "Workflow automation",
      "Data processing",
      "Custom integrations",
      "Ongoing optimisation",
    ],
    startingFrom: "$2,499",
    iconName: "Bot",
  },
];
