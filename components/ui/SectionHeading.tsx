import { cn } from "@/lib/cn";
import type { AccentHeading } from "@/content/types";

/**
 * Bold-sans headline with exactly ONE Libre Caslon italic accent word that
 * glows in warm cream (DESIGN.md §3 + §7). The structural text stays solid white.
 */
export function AccentTitle({
  heading,
  className,
  serifWhole = false,
  accentStyle = "cream",
  as: Tag = "h2",
}: {
  heading: AccentHeading;
  className?: string;
  /** Renders the whole heading in serif (used by a specific export). */
  serifWhole?: boolean;
  /** 'cream' = solid cream glow; 'gradient' = white→gold clip glow. */
  accentStyle?: "cream" | "gradient";
  as?: "h1" | "h2" | "h3";
}) {
  const accentClass = accentStyle === "gradient" ? "accent-gradient" : "accent-glow";
  return (
    <Tag
      className={cn(
        "text-ink font-bold tracking-tight",
        serifWhole && "font-serif not-italic",
        className,
      )}
    >
      {heading.before}{" "}
      <span className={accentClass}>{heading.accent}</span>
      {heading.after ? <> {heading.after}</> : null}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  align = "center",
  className,
  accentStyle = "cream",
}: {
  eyebrow?: string;
  heading: AccentHeading;
  align?: "center" | "left" | "right";
  className?: string;
  accentStyle?: "cream" | "gradient";
}) {
  const alignClass =
    align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";
  return (
    <div className={cn("flex flex-col gap-4", alignClass, className)}>
      {eyebrow ? (
        <span className="text-eyebrow uppercase text-gold">{eyebrow}</span>
      ) : null}
      <AccentTitle heading={heading} accentStyle={accentStyle} className="text-3xl md:text-5xl" />
    </div>
  );
}
