"use client"

import Link from "next/link"
import type { ReactNode } from "react"

type Variant = "dark" | "outline" | "accent"

interface ButtonProps {
  variant: Variant
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
}

const base =
  "inline-flex items-center justify-center rounded-[5px] text-[17px] font-medium " +
  "h-[69px] px-10 transition-all duration-500"

const variants: Record<Variant, string> = {
  dark: "bg-brand-dark text-brand-text hover:bg-brand-primary hover:text-white",
  outline:
    "border-2 border-[#2d2d2c] text-[#2d2d2c] hover:bg-brand-dark hover:text-brand-text",
  accent: "bg-brand-primary text-white hover:opacity-90",
}

export default function Button({
  variant,
  href,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
