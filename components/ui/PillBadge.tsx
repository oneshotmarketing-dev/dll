import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Eyebrow highlight pill (DESIGN.md §4): rounded-full, subtle dark fill,
// 1px border, tiny leading dot/icon.
export function PillBadge({
  children,
  icon,
  dot = true,
  className,
}: {
  children: React.ReactNode;
  icon?: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface px-4 py-1.5 text-eyebrow uppercase text-muted",
        className,
      )}
    >
      {icon ? <Icon name={icon} className="text-[14px] text-gold" /> : null}
      {dot && !icon ? <span className="h-1.5 w-1.5 rounded-full bg-gold" /> : null}
      {children}
    </span>
  );
}

// Small chip for tags/credentials.
export function Chip({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: "gold" | "neutral";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-pill px-3 py-1 text-eyebrow uppercase",
        tone === "gold" ? "bg-gold/10 text-gold border border-gold/30" : "bg-white/5 text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
