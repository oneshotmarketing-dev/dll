import { cn } from "@/lib/cn";

// Material Symbols Outlined — matches the icon set used across the Stitch exports.
// The font is loaded once in the root layout via a <link>.
export function Icon({
  name,
  className,
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      translate="no"
      className={cn("material-symbols-outlined leading-none select-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
