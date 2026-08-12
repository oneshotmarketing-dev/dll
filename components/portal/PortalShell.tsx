"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabaseClient";
import { site } from "@/content/site";
import type { PortalUser } from "@/lib/portal";
import { TimezoneDialog } from "@/components/portal/TimezoneDialog";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// Short "EST · Toronto"-style label from an IANA timezone.
function tzLabel(tz: string | null): string {
  if (!tz) return "Set timezone";
  try {
    const abbr = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value;
    const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
    return abbr ? `${abbr} · ${city}` : city;
  } catch {
    return tz;
  }
}

function initials(user: PortalUser): string {
  const base = user.fullName || user.email || "U";
  return base.trim().charAt(0).toUpperCase();
}

// The one authenticated shell, reused across portals via the nav/homeHref props
// (student, admin, later tutor). Fixed sidebar + top bar; off-canvas drawer on
// mobile. Pure Hanken (no serif).
export function PortalShell({
  user,
  nav,
  homeHref,
  profileHref,
  children,
}: {
  user: PortalUser;
  nav: NavItem[];
  homeHref: string;
  profileHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || homeHref;
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === homeHref ? pathname === homeHref : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <Link href={homeHref} className="mb-10 flex items-center justify-center px-2 focus-gold rounded-icon">
        <Image src="/images/logo_280x134.png" alt={site.name} width={280} height={134} className="h-20 w-auto" />
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-input px-4 py-3 text-sm font-medium transition-all focus-gold",
                active ? "bg-gold text-canvas shadow-glow-btn" : "text-muted hover:bg-white/5 hover:text-gold",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={cn(
          "fixed left-0 top-0 z-[70] h-screen w-64 border-r border-hairline bg-surface transition-transform duration-300 lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
        />
      ) : null}

      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-hairline bg-canvas/80 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-icon text-gold focus-gold lg:hidden"
            >
              <Icon name="menu" className="text-2xl" />
            </button>
            <button
              type="button"
              onClick={() => setTzOpen(true)}
              title="Change your timezone"
              className={cn(
                "hidden items-center gap-2 rounded-pill border bg-surface px-3 py-1.5 transition-colors hover:border-gold/50 focus-gold sm:flex",
                user.timezone ? "border-hairline" : "border-gold/40",
              )}
            >
              <Icon name="schedule" className="text-sm text-gold" />
              <span className="text-xs font-medium tracking-widest text-muted">{tzLabel(user.timezone)}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-muted" aria-hidden="true">
              <Icon name="notifications" />
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 focus-gold rounded-pill"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold leading-none text-ink">{user.fullName || "User"}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-gold">{user.role}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-gold/30 bg-surface font-bold text-gold">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(user)
                  )}
                </span>
                <Icon name="expand_more" className="text-muted" />
              </button>

              {menuOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Close"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-card border border-hairline bg-surface shadow-glow-card"
                  >
                    <div className="border-b border-hairline p-4">
                      <p className="text-sm font-bold text-ink">{user.fullName || "User"}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gold">{user.role}</p>
                    </div>
                    <div className="p-2">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-input px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-gold focus-gold"
                          role="menuitem"
                        >
                          <Icon name="manage_accounts" className="text-lg" /> Profile &amp; Settings
                        </Link>
                      ) : null}
                      <Link
                        href="/change-password"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-input px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-gold focus-gold"
                        role="menuitem"
                      >
                        <Icon name="lock" className="text-lg" /> Change password
                      </Link>
                      <div className="my-1 h-px bg-hairline" />
                      <button
                        type="button"
                        onClick={signOut}
                        className="flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors hover:bg-white/5 focus-gold"
                        style={{ color: "#ffb4ab" }}
                        role="menuitem"
                      >
                        <Icon name="logout" className="text-lg" /> Log out
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>

      {tzOpen ? (
        <TimezoneDialog userId={user.id} currentTz={user.timezone} onClose={() => setTzOpen(false)} />
      ) : null}
    </div>
  );
}
