"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Camera,
  ShieldCheck,
  Lock,
  Flame,
  Phone,
  AlertTriangle,
  Car,
  type LucideIcon,
} from "lucide-react"

const FALLBACK_ICONS: Record<string, LucideIcon> = {
  Camera,
  ShieldCheck,
  Lock,
  Flame,
  Phone,
  AlertTriangle,
  Car,
}

interface Props {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallbackIcon?: string // lucide icon name hint
  fallbackBg?: string // bg color (or gradient) for placeholder
  placeholderText?: string // text shown under the fallback icon
  fallbackInitial?: boolean // show first letter of alt instead of icon/text
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  className,
  fallbackIcon = "Camera",
  fallbackBg = "#f0f0ff",
  placeholderText = "Image Coming Soon",
  fallbackInitial = false,
  priority = false,
}: Props) {
  const [error, setError] = useState(false)

  if (error || !src) {
    // Initial-letter fallback (used for customer photos): shows the first
    // letter of the alt text on a coloured circle when no image is present.
    if (fallbackInitial) {
      const initial = alt ? alt.charAt(0).toUpperCase() : "?"
      return (
        <div
          className={`flex items-center justify-center ${
            fill ? "absolute inset-0" : ""
          } ${className ?? ""}`}
          style={{
            background: fallbackBg,
            ...(fill ? {} : { width: width ?? 400, height: height ?? 300 }),
          }}
        >
          <span
            className="font-bold text-[#7f85f7]"
            style={{ fontSize: "40%", lineHeight: 1 }}
          >
            {initial}
          </span>
        </div>
      )
    }

    const Icon = FALLBACK_ICONS[fallbackIcon] ?? Camera
    // When used as a `fill` image, cover the (relative) parent. Otherwise size
    // the placeholder to the requested width/height.
    return (
      <div
        className={`flex flex-col items-center justify-center ${
          fill ? "absolute inset-0" : ""
        } ${className ?? ""}`}
        style={{
          background: fallbackBg,
          ...(fill ? {} : { width: width ?? 400, height: height ?? 300 }),
        }}
      >
        <div className="opacity-30">
          <Icon size={48} color="#7f85f7" />
        </div>
        <p className="text-[11px] text-[#9496a8] mt-2 font-medium">
          {placeholderText}
        </p>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
