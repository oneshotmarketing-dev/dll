// Instant loading placeholder shown (via each area's loading.tsx) the moment a
// portal link is clicked — the sidebar shell stays put while this shimmer fills
// the content slot, so navigation feels immediate even during a cold start or
// data fetch. Purely presentational.
export function PortalSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-10" aria-hidden>
      {/* Heading */}
      <div className="space-y-3">
        <div className="h-9 w-64 rounded-input bg-surface" />
        <div className="h-4 w-40 rounded-input bg-surface" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-card border border-hairline bg-surface" />
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <div className="h-6 w-40 rounded-input bg-surface" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-card border border-hairline bg-surface" />
          ))}
        </div>
        <div className="space-y-3 lg:col-span-2">
          <div className="h-6 w-40 rounded-input bg-surface" />
          {[0, 1].map((i) => (
            <div key={i} className="h-20 rounded-card border border-hairline bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
