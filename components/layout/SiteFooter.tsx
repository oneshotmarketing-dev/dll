"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { complianceNoteForPath, isPortalPath } from "@/lib/chrome";

// One shared footer for every page (content from content/site.ts). Only the
// additive compliance note varies by route (/french-canada). Hidden in the
// authenticated portal, which renders its own shell.
export function SiteFooter() {
  const pathname = usePathname() || "/";
  if (isPortalPath(pathname)) return null;
  return <Footer complianceNote={complianceNoteForPath(pathname)} />;
}
