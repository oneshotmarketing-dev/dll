"use client";

import { usePathname } from "next/navigation";
import { PromoBar } from "./PromoBar";
import { Navbar } from "./Navbar";
import { promoForPath, isPortalPath } from "@/lib/chrome";

// Promo bar sits ABOVE the sticky nav, so both live in one client wrapper that
// resolves the route-specific promo content.
export function SiteHeader() {
  const pathname = usePathname() || "/";
  if (isPortalPath(pathname)) return null;
  return (
    <>
      <PromoBar content={promoForPath(pathname)} />
      <Navbar />
    </>
  );
}
