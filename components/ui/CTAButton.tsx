"use client";

import Link from "next/link";
import { resolveCta, type CtaContext } from "@/lib/cta";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outlined" | "inverted";
type Size = "md" | "lg";

interface CTAButtonProps extends CtaContext {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  /** Fires an analytics event name on click (optional). */
  onClickTrack?: () => void;
}

const base =
  "inline-flex items-center justify-center rounded-pill font-semibold uppercase tracking-widest text-center transition-all duration-300 focus-gold";

const sizes: Record<Size, string> = {
  md: "px-8 py-3 text-xs",
  lg: "px-10 py-4 text-sm",
};

const variants: Record<Variant, string> = {
  // Gold pill with vertical gradient + outer halo (DESIGN.md §7 glowing button).
  primary:
    "bg-cta-gradient text-canvas border border-gold/20 shadow-glow-btn glow-btn-responsive hover:shadow-glow-btn-hover hover:scale-[1.03]",
  outlined:
    "bg-transparent text-gold border border-gold/50 hover:bg-gold/10",
  inverted: "bg-ink text-canvas hover:opacity-90",
};

/**
 * The single CTA component. Its destination always comes from resolveCta(),
 * so 'form' vs 'whatsapp' mode is decided in one config place.
 */
export function CTAButton({
  label,
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  onClickTrack,
  ...ctx
}: CTAButtonProps) {
  const { href, external } = resolveCta(ctx);
  const classes = cn(base, sizes[size], variants[variant], fullWidth && "w-full", className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={onClickTrack}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClickTrack}>
      {label}
    </Link>
  );
}
