import Link from "next/link";
import { cn } from "@/lib/cn";

export interface StatusTab {
  key: string;
  label: string;
  count: number;
}

// Top tab bar for admin list pages (Active / Inactive, Open / Completed). URL-driven
// (?tab=…) so the server page filters its rows and the selected tab survives a
// refresh. The first tab is the default and links to the bare path.
export function StatusTabs({ tabs, active, basePath }: { tabs: StatusTab[]; active: string; basePath: string }) {
  return (
    <div className="flex gap-8 border-b border-hairline">
      {tabs.map((t, i) => {
        const selected = t.key === active;
        return (
          <Link
            key={t.key}
            href={i === 0 ? basePath : `${basePath}?tab=${t.key}`}
            scroll={false}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "pb-3 text-lg font-bold transition-colors focus-gold",
              selected ? "border-b-2 border-gold text-gold" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            <span className="ml-2 text-sm font-medium opacity-70">{t.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
