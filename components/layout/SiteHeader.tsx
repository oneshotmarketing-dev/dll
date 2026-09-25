"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { isPortalPath } from "@/lib/chrome";

// Marketing header. The promo bar (PromoBar + promoForPath) is hidden on all
// pages for now; render <PromoBar content={promoForPath(pathname)} /> above the
// Navbar to bring it back.
export function SiteHeader() {
  const pathname = usePathname() || "/";
  if (isPortalPath(pathname)) return null;
  return <Navbar />;
}
