import { cn } from "@/lib/cn";

/**
 * Faint radial gold glow behind a section (hero + final CTA band only, per
 * DESIGN.md §7). Purely decorative, pointer-events off, sits behind content.
 */
export function GlowContainer({
  children,
  className,
  glowClassName,
}: {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[300px] w-[600px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[100px] md:blur-[120px]",
          glowClassName,
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
