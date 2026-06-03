// TODO(dashboard): replace with API call when admin is live
export interface SecurityProduct {
  id: string
  name: string
  description: string
  price: number
  unit: string // e.g. "per camera", "per door", "per device"
  inStock: boolean
}

export interface SecuritySolution {
  id: string
  name: string
  slug: string // used in URL
  tagline: string
  description: string
  longDescription: string
  icon: string // lucide icon name
  iconColor: string // e.g. "#f57c00"
  iconBg: string // e.g. "rgba(245,124,0,0.15)"
  products: SecurityProduct[]
}

export const securitySolutions: SecuritySolution[] = [
  {
    id: "surveillance",
    name: "Surveillance & Evidence",
    slug: "surveillance-evidence",
    tagline: "See everything. Miss nothing.",
    description:
      "Professional CCTV and video surveillance systems for homes and businesses across Australia.",
    longDescription:
      "Our surveillance systems provide 24/7 monitoring with HD recording, remote access via smartphone, motion detection alerts, and cloud or local storage. Ideal for evidence collection and real-time monitoring.",
    icon: "Video",
    iconColor: "#f57c00",
    iconBg: "rgba(245,124,0,0.12)",
    products: [
      {
        id: "hd-bullet-cam",
        name: "HD Bullet Camera",
        description: "1080p outdoor camera, night vision, weatherproof",
        price: 299,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "dome-cam",
        name: "Dome Camera",
        description: "4K indoor/outdoor dome, wide angle 110°",
        price: 349,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "ptz-cam",
        name: "PTZ Camera",
        description: "Pan-tilt-zoom, 360° coverage, auto-tracking",
        price: 599,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "nvr-system",
        name: "NVR Recording System",
        description: "8-channel 4K NVR with 2TB storage",
        price: 799,
        unit: "per unit",
        inStock: true,
      },
      {
        id: "solar-cam",
        name: "Solar Wireless Camera",
        description: "No wiring needed, solar powered, 2K resolution",
        price: 449,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "doorbell-cam",
        name: "Video Doorbell",
        description: "Smart doorbell with two-way audio and motion alerts",
        price: 249,
        unit: "per unit",
        inStock: true,
      },
    ],
  },
  {
    id: "deterrence",
    name: "Deterrence",
    slug: "deterrence",
    tagline: "Stop threats before they happen.",
    description:
      "Alarm systems and deterrence technology that prevent incidents before they occur.",
    longDescription:
      "Visible security measures and alarm systems are proven to deter 60% of would-be intruders. Our deterrence solutions include alarm panels, sirens, security lighting, and signage packages.",
    icon: "ShieldAlert",
    iconColor: "#e53935",
    iconBg: "rgba(229,57,53,0.12)",
    products: [
      {
        id: "alarm-panel",
        name: "Alarm Panel System",
        description: "8-zone alarm panel with keypad and siren",
        price: 799,
        unit: "per system",
        inStock: true,
      },
      {
        id: "outdoor-siren",
        name: "Outdoor Siren & Strobe",
        description: "Loud alarm siren with flashing strobe light",
        price: 199,
        unit: "per unit",
        inStock: true,
      },
      {
        id: "motion-sensor",
        name: "PIR Motion Sensor",
        description: "Passive infrared sensor, pet-immune option",
        price: 89,
        unit: "per sensor",
        inStock: true,
      },
      {
        id: "security-light",
        name: "Security Floodlight",
        description: "2000 lumen LED with motion activation",
        price: 149,
        unit: "per light",
        inStock: true,
      },
      {
        id: "glass-break",
        name: "Glass Break Detector",
        description: "Detects glass shattering up to 9 metres",
        price: 119,
        unit: "per detector",
        inStock: true,
      },
    ],
  },
  {
    id: "commercial",
    name: "Commercial Security",
    slug: "commercial-security",
    tagline: "Enterprise-grade protection.",
    description:
      "Complete security solutions for offices, retail, warehouses, and industrial facilities.",
    longDescription:
      "We design and install comprehensive commercial security systems tailored to your business. Integrated CCTV, access control, alarm monitoring and 24/7 remote management in one solution.",
    icon: "Building2",
    iconColor: "#1565c0",
    iconBg: "rgba(21,101,192,0.12)",
    products: [
      {
        id: "commercial-nvr",
        name: "Commercial NVR 16-Channel",
        description: "16-channel 4K NVR with 8TB RAID storage",
        price: 1499,
        unit: "per unit",
        inStock: true,
      },
      {
        id: "commercial-cam",
        name: "Commercial PTZ Camera",
        description: "30x optical zoom, IR 150m, vandal-proof",
        price: 899,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "thermal-cam",
        name: "Thermal Detection Camera",
        description: "Heat signature detection, perimeter alerts",
        price: 1299,
        unit: "per camera",
        inStock: true,
      },
      {
        id: "monitoring",
        name: "24/7 Remote Monitoring",
        description: "Professional monitoring centre, annual plan",
        price: 599,
        unit: "per year",
        inStock: true,
      },
    ],
  },
  {
    id: "access-control",
    name: "Access Control",
    slug: "access-control",
    tagline: "Control who goes where.",
    description:
      "Smart access control systems for doors, gates, and restricted areas.",
    longDescription:
      "From key cards to biometric scanners, we install access control systems that give you complete control over who enters your property. Audit trails, time restrictions, remote management.",
    icon: "Lock",
    iconColor: "#6200ea",
    iconBg: "rgba(98,0,234,0.12)",
    products: [
      {
        id: "keypad-access",
        name: "Keypad Door Controller",
        description: "PIN + RFID card access, weatherproof",
        price: 349,
        unit: "per door",
        inStock: true,
      },
      {
        id: "biometric",
        name: "Biometric Fingerprint Reader",
        description: "Fingerprint + card dual authentication",
        price: 499,
        unit: "per door",
        inStock: true,
      },
      {
        id: "electric-strike",
        name: "Electric Strike Lock",
        description: "Fail-safe electric strike for standard doors",
        price: 199,
        unit: "per door",
        inStock: true,
      },
      {
        id: "magnetic-lock",
        name: "Magnetic Lock 600lb",
        description: "Heavy duty magnetic lock for commercial doors",
        price: 249,
        unit: "per door",
        inStock: true,
      },
      {
        id: "gate-controller",
        name: "Gate Access Controller",
        description: "Remote gate control with RFID and app access",
        price: 699,
        unit: "per gate",
        inStock: true,
      },
    ],
  },
  {
    id: "smoke-alarms",
    name: "Smoke Alarms",
    slug: "smoke-alarms",
    tagline: "Protect lives. Stay compliant.",
    description:
      "Interconnected smoke alarm systems that meet Australian standards AS3786.",
    longDescription:
      "We supply and install photoelectric smoke alarms compliant with Australian regulations. Interconnected systems, hardwired or wireless, for residential and commercial properties.",
    icon: "Flame",
    iconColor: "#e65100",
    iconBg: "rgba(230,81,0,0.12)",
    products: [
      {
        id: "photoelectric",
        name: "Photoelectric Smoke Alarm",
        description: "AS3786 compliant, 10-year sealed battery",
        price: 89,
        unit: "per alarm",
        inStock: true,
      },
      {
        id: "hardwired-alarm",
        name: "Hardwired Smoke Alarm",
        description: "240V hardwired with battery backup",
        price: 129,
        unit: "per alarm",
        inStock: true,
      },
      {
        id: "heat-detector",
        name: "Heat Detector",
        description:
          "For kitchens and garages where smoke alarms cause false triggers",
        price: 99,
        unit: "per detector",
        inStock: true,
      },
      {
        id: "wireless-system",
        name: "Wireless Interconnected System",
        description: "6-alarm wireless interconnected pack",
        price: 449,
        unit: "per pack",
        inStock: true,
      },
    ],
  },
  {
    id: "intercoms",
    name: "Intercoms",
    slug: "intercoms",
    tagline: "See and speak before you open.",
    description:
      "Video and audio intercom systems for homes, apartments, and commercial buildings.",
    longDescription:
      "Modern intercom systems let you see and speak with visitors before granting access. We install wired and wireless intercoms with smartphone integration, video recording, and remote unlock.",
    icon: "Phone",
    iconColor: "#2e7d32",
    iconBg: "rgba(46,125,50,0.12)",
    products: [
      {
        id: "video-intercom",
        name: "Video Intercom System",
        description: "7-inch colour screen, camera + doorbell unit",
        price: 549,
        unit: "per system",
        inStock: true,
      },
      {
        id: "apartment-intercom",
        name: "Apartment Intercom",
        description: "Multi-tenant panel, up to 50 units",
        price: 1299,
        unit: "per building",
        inStock: true,
      },
      {
        id: "wifi-intercom",
        name: "WiFi Smart Intercom",
        description: "App-controlled, works with iPhone and Android",
        price: 349,
        unit: "per unit",
        inStock: true,
      },
      {
        id: "audio-intercom",
        name: "Audio-Only Intercom",
        description: "Simple 2-wire audio intercom, commercial grade",
        price: 199,
        unit: "per unit",
        inStock: true,
      },
    ],
  },
]

// Keep old cctv-products.ts exports for backwards compatibility
// Quote form still uses these price keys
export const installFee = 150
export const gstRate = 0.10
