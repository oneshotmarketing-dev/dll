"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { CTAButton } from "@/components/ui/CTAButton";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/content/types";

// Sticky top bar on canvas color. Desktop: centered text nav with hover
// dropdowns + active-link underline; right-side gold CTA. Mobile: hamburger →
// full-screen drawer. Subtle shrink on scroll.
export function Navbar() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The Login button shows on every public page except the auth pages themselves.
  const showLogin = pathname !== "/login" && pathname !== "/forgot-password";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 shadow-glow-nav backdrop-blur-xl"
        id="main-nav"
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-container-wide items-center justify-between px-5 transition-all duration-300 md:px-16",
            scrolled ? "h-16 md:h-28" : "h-20 md:h-28",
          )}
        >
          <Logo />

          <ul className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {nav.map((item) => (
              <DesktopItem key={item.label} item={item} pathname={pathname} />
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            {showLogin ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-pill border border-gold/50 bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-gold transition-all hover:bg-gold/10 focus-gold"
              >
                Login
              </Link>
            ) : null}
            <CTAButton
              label={site.ctaLabel}
              size="md"
              waMessage="Hi! I'd like to know more about your language courses."
            />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-icon text-gold focus-gold md:hidden"
          >
            <Icon name="menu" className="text-3xl" />
          </button>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} currentPath={pathname} />
    </>
  );
}

function DesktopItem({ item, pathname }: { item: NavItem; pathname: string }) {
  if (item.dropdown) {
    const active = item.dropdown.some((d) => d.href === pathname);
    return (
      <li className="group relative">
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 py-2 font-medium transition-colors focus-gold",
            active ? "text-gold" : "text-muted hover:text-gold",
          )}
          aria-haspopup="true"
        >
          {item.label}
          <Icon name="expand_more" className="text-[16px]" />
        </button>
        {/* Hover/focus-within dropdown; keyboard accessible via focus-within. */}
        <div className="invisible absolute left-1/2 top-full z-50 min-w-[220px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <ul className="overflow-hidden rounded-card border border-hairline bg-surface p-2 shadow-glow-nav">
            {item.dropdown.map((sub) => (
              <li key={sub.label}>
                <Link
                  href={sub.href}
                  className={cn(
                    "block rounded-input px-4 py-2.5 text-sm transition-colors focus-gold",
                    sub.href === pathname ? "text-gold" : "text-muted hover:bg-white/5 hover:text-gold",
                  )}
                >
                  {sub.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  const active = item.href === pathname;
  return (
    <li>
      <Link
        href={item.href ?? "#"}
        className={cn(
          "py-2 font-medium transition-colors focus-gold",
          active ? "border-b-2 border-gold pb-1 text-gold" : "text-muted hover:text-gold",
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}
