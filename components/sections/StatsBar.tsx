import type { Stat } from "@/content/types";

// 2×2 grid on mobile, 4-across on desktop. Gold numbers (the key figure per
// section is where gold is allowed to shine).
export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <section className="w-full border-y border-hairline bg-white/[0.02] py-12">
      <div className="mx-auto grid max-w-container-wide grid-cols-2 gap-4 px-5 md:gap-8 text-center md:grid-cols-4 md:px-16">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <span className="text-4xl font-bold text-gold drop-shadow-[0_0_15px_rgba(197,163,107,0.4)] md:text-5xl">
              {stat.value}
            </span>
            <span className="text-sm uppercase tracking-wider text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
