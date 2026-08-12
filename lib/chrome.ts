import { homePromo } from "@/content/home";
import { fcPromo, fcComplianceNote } from "@/content/frenchCanada";
import type { PromoBarContent } from "@/content/types";

// Resolves route-specific chrome. The footer is now ONE shared component with
// identical content everywhere (content/site.ts); the only per-route difference
// is the additive compliance note on /french-canada.

export function promoForPath(path: string): PromoBarContent {
  if (path.startsWith("/french-canada")) return fcPromo;
  return homePromo;
}

export function complianceNoteForPath(path: string): string | undefined {
  if (path.startsWith("/french-canada")) return fcComplianceNote;
  return undefined;
}

// The authenticated portal renders its own shell (sidebar + top bar), so the
// marketing chrome (promo bar, nav, footer, WhatsApp widget) must not appear on
// these routes.
export function isPortalPath(path: string): boolean {
  return (
    path === "/dashboard" ||
    path.startsWith("/student") ||
    path.startsWith("/admin") ||
    path.startsWith("/tutor")
  );
}
