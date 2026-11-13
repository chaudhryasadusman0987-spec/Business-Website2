import Link from "next/link"
import type { ReactNode } from "react"

// The one button on the site: 48px tall, 10px radius, Inter 600.
//   primary   — brand purple, white text
//   secondary — outline; pass tone="dark" on navy/hero backgrounds
//   ghost     — text only, for low-emphasis actions
//   quote     — the green used only by the quote forms' main action
type Variant = "primary" | "secondary" | "ghost" | "quote"
type Tone = "light" | "dark"

export const buttonBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-btn px-6 " +
  "text-[15px] font-semibold leading-none whitespace-nowrap " +
  "transition-[color,background-color,border-color,transform] duration-200 " +
  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 " +
  "disabled:cursor-not-allowed disabled:opacity-60"

const styles: Record<Variant, Record<Tone, string>> = {
  primary: {
    light: "bg-brand-primary text-white hover:bg-brand-hover",
    dark: "bg-brand-primary text-white hover:bg-brand-hover",
  },
  secondary: {
    light: "border border-line bg-white text-ink hover:border-ink",
    dark: "border border-white/40 text-white hover:border-white hover:bg-white/10",
  },
  ghost: {
    light: "text-accent hover:bg-brand-tint",
    dark: "text-white hover:bg-white/10",
  },
  quote: {
    light: "bg-brand-quote text-white hover:bg-[#0c5a46]",
    dark: "bg-brand-quote text-white hover:bg-[#0c5a46]",
  },
}

/** Class string for places that can't render <Button> (e.g. a styled <a>). */
export function buttonClass(variant: Variant = "primary", tone: Tone = "light", className = "") {
  return `${buttonBase} ${styles[variant][tone]} ${className}`.trim()
}

interface ButtonProps {
  variant?: Variant
  tone?: Tone
  /** Internal route, or tel:/mailto:/https:/#anchor — the right element is picked. */
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  children: ReactNode
  className?: string
  "aria-label"?: string
}

export default function Button({
  variant = "primary",
  tone = "light",
  href,
  onClick,
  type = "button",
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = buttonClass(variant, tone, className)

  if (href) {
    const external = /^(tel:|mailto:|https?:|#)/.test(href)
    if (external) {
      const newTab = href.startsWith("http")
      return (
        <a
          href={href}
          className={classes}
          onClick={onClick}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  )
}
