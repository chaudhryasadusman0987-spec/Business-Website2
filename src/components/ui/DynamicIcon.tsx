import {
  Globe,
  Smartphone,
  Bot,
  Lightbulb,
  Monitor,
  Zap,
  Search,
  Shield,
  Layers,
  Bell,
  Cloud,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  type LucideIcon,
} from "lucide-react"

// Maps an icon name (string from data files) to a Lucide icon component.
// Explicit map keeps the bundle predictable and tree-shakeable.
const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Bot,
  Lightbulb,
  Monitor,
  Zap,
  Search,
  Shield,
  Layers,
  Bell,
  Cloud,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
}

interface Props {
  name: string
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export default function DynamicIcon({ name, size = 24, color, className, style }: Props) {
  const Icon = ICON_MAP[name] ?? Globe
  return <Icon size={size} color={color} className={className} style={style} />
}
