import {
  Video,
  ShieldAlert,
  Building2,
  Lock,
  Flame,
  Phone,
  type LucideIcon,
} from "lucide-react"

// Maps a SecuritySolution.icon name to its Lucide component.
// Used by the landing grid, the [slug] detail page, and the products overview.
const ICON_MAP: Record<string, LucideIcon> = {
  Video,
  ShieldAlert,
  Building2,
  Lock,
  Flame,
  Phone,
}

export function SolutionIcon({
  name,
  size,
  className,
  style,
}: {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = ICON_MAP[name] ?? Video
  return <Icon size={size} className={className} style={style} />
}
