import { cn } from "@/lib/cn";

/**
 * Surface card: #0B1220 fill, 20px radius, hairline border, generous padding.
 * `featured` adds the gold-border + glow treatment (DESIGN.md §7) — only the
 * featured card glows; siblings stay flat.
 */
export function Card({
  children,
  className,
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface p-7 md:p-8",
        featured
          ? "border border-gold shadow-glow-card"
          : "border border-hairline",
        className,
      )}
    >
      {children}
    </div>
  );
}
