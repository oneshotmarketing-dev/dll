"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CTAButton } from "@/components/ui/CTAButton";
import { Logo } from "./Logo";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/content/types";

// Full-screen slide-in drawer. Courses/Free Resources render as accordions;
// the CTA is pinned at the bottom. Locks body scroll while open.
export function MobileDrawer({
  open,
  onClose,
  currentPath,
}: {
  open: boolean;
  onClose: () => void;
  currentPath: string;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Login shows on every public page except the auth pages themselves.
  const showLogin = currentPath !== "/login" && currentPath !== "/forgot-password";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] md:hidden transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 flex flex-col bg-canvas transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-hairline px-5">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-icon text-gold focus-gold"
          >
            <Icon name="close" className="text-3xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <DrawerItem key={item.label} item={item} currentPath={currentPath} onNavigate={onClose} />
            ))}
          </ul>
        </nav>

        <div className="shrink-0 space-y-3 border-t border-hairline p-5">
          <CTAButton label={site.ctaLabel} fullWidth context="Mobile menu" onClickTrack={onClose} />
          {showLogin ? (
            <Link
              href="/login"
              onClick={onClose}
              className="flex min-h-[48px] w-full items-center justify-center rounded-pill border border-gold/50 bg-transparent px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gold transition-all hover:bg-gold/10 focus-gold"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DrawerItem({
  item,
  currentPath,
  onNavigate,
}: {
  item: NavItem;
  currentPath: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (item.dropdown) {
    return (
      <li>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex min-h-[44px] w-full items-center justify-between py-3 text-lg font-medium text-ink focus-gold"
        >
          {item.label}
          <Icon name={expanded ? "expand_less" : "expand_more"} className="text-gold" />
        </button>
        {expanded ? (
          <ul className="mb-2 flex flex-col gap-1 border-l border-hairline pl-4">
            {item.dropdown.map((sub) => (
              <li key={sub.label}>
                <Link
                  href={sub.href}
                  onClick={onNavigate}
                  className="block min-h-[44px] py-2.5 text-muted hover:text-gold focus-gold"
                >
                  {sub.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  const active = item.href === currentPath;
  return (
    <li>
      <Link
        href={item.href ?? "#"}
        onClick={onNavigate}
        className={cn(
          "block min-h-[44px] py-3 text-lg font-medium focus-gold",
          active ? "text-gold" : "text-ink hover:text-gold",
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}
