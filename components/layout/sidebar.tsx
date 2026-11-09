"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

/**
 * Floating icon rail from design/referensi.png: an 84px periwinkle tile that
 * sits 16px inside the window, rounded like a card instead of touching the
 * edge. Labels are carried by hover/focus tooltips and `aria-label`, so the
 * narrow shape never costs keyboard or screen-reader users the menu names.
 */
export function Sidebar({
  items,
  userName,
  userRole,
  userInitials,
  roleCaption,
  operationalPaths,
  homePath,
  logoutAction,
}: {
  items: NavItem[];
  userName: string;
  userRole: string;
  userInitials: string;
  /** Footer line naming the role and its area, e.g. "ADMIN • Booking & keberangkatan". */
  roleCaption?: string;
  /**
   * Hrefs that belong in the first group. The Admin Travel layout passes its
   * own operational routes; a shell that has no such split omits it and every
   * item lands in the single group below.
   */
  operationalPaths?: string[];
  /** The dashboard href, exempt from the prefix match so it never self-highlights. */
  homePath?: string;
  logoutAction: (formData: FormData) => void | Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMobileMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMobileClosing(false);
    setMobileVisible(true);
  };

  const closeMobileMenu = () => {
    setMobileClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMobileVisible(false);
      setMobileClosing(false);
    }, 180);
  };

  useEffect(() => {
    if (!mobileVisible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileVisible]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const groups: Array<[string, NavItem[]]> = operationalPaths?.length
    ? [
        ["Operasional", items.filter((item) => operationalPaths.includes(item.href))],
        ["Pendampingan", items.filter((item) => !operationalPaths.includes(item.href))],
      ]
    : [["Navigasi", items]];

  const visibleGroups = groups.filter(([, groupItems]) => groupItems.length > 0);
  const brandHref = homePath ?? items[0]?.href ?? "/";

  return (
    <>
      <button
        type="button"
        aria-label={mobileVisible && !mobileClosing ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={mobileVisible && !mobileClosing}
        onClick={mobileVisible && !mobileClosing ? closeMobileMenu : openMobileMenu}
        className="fixed left-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-nav transition-colors hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden>
          {mobileVisible && !mobileClosing ? "close" : "menu"}
        </span>
      </button>

      {mobileVisible ? (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={closeMobileMenu}
          className={cn(
            "fixed inset-0 z-30 bg-inverse-surface/45 lg:hidden",
            mobileClosing ? "mobile-menu-overlay-out" : "mobile-menu-overlay",
          )}
        />
      ) : null}

      <nav
        aria-label="Navigasi utama"
        className={cn(
          "fixed bottom-3 left-3 top-3 z-40 w-[84px] flex-col overflow-hidden rounded-[28px] bg-brand px-3 py-4 shadow-nav",
          mobileVisible ? "flex" : "hidden",
          mobileClosing ? "mobile-menu-drawer-out" : "mobile-menu-drawer",
          "lg:bottom-4 lg:left-4 lg:top-4 lg:flex lg:overflow-visible",
        )}
      >
        <Link
          href={brandHref}
          aria-label="Horizon Odyssey, buka dashboard"
          title="Horizon Odyssey"
          onClick={closeMobileMenu}
          className="mx-auto hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand transition-colors hover:bg-primary-fixed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:flex"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden>
            flight_takeoff
          </span>
        </Link>

        {/* The mobile trigger sits in the brand slot, so the tile is replaced
            by a spacer below `lg` instead of stacking two icons on each other. */}
        <div className="h-14 shrink-0 lg:hidden" aria-hidden />

        <div className="my-3 h-px w-full shrink-0 bg-white/15" aria-hidden />

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto lg:overflow-visible">
          {visibleGroups.map(([group, groupItems], groupIndex) => (
            <div key={group} className="contents">
              {groupIndex > 0 ? (
                <div className="my-2 h-px w-8 shrink-0 bg-white/15" aria-hidden />
              ) : null}
              <p className="sr-only">{group}</p>
              {groupItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== homePath && pathname.startsWith(item.href));
                const itemLabel = item.badge
                  ? `${item.label}, ${item.badge} menunggu`
                  : item.label;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={itemLabel}
                    title={itemLabel}
                    onClick={closeMobileMenu}
                    className={cn(
                      "group relative mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-colors",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                      active
                        ? "bg-primary text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 22 }}
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    {item.badge ? (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold leading-none text-white ring-2 ring-brand">
                        {item.badge}
                      </span>
                    ) : null}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 hidden -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-caption font-semibold text-inverse-on-surface shadow-float lg:group-hover:flex lg:group-focus-visible:flex"
                    >
                      {item.label}
                      {item.badge ? (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex shrink-0 flex-col items-center gap-2 border-t border-white/15 pt-3">
          <div
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white"
            title={`${userName} • ${userRole}`}
          >
            <span aria-hidden>{userInitials}</span>
            <span className="sr-only">
              {userName}, {userRole}
              {roleCaption ? `, ${roleCaption}` : ""}
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-left text-caption text-inverse-on-surface shadow-float lg:group-hover:block lg:group-focus-within:block"
            >
              <span className="block font-semibold">{userName}</span>
              <span className="block text-white/70">{userRole}</span>
              {roleCaption ? (
                <span className="block text-white/70">{roleCaption}</span>
              ) : null}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Keluar"
              title="Keluar"
              className="group relative flex h-11 w-11 items-center justify-center rounded-[14px] text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden>
                logout
              </span>
              <span
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-caption font-semibold text-inverse-on-surface shadow-float lg:group-hover:block lg:group-focus-visible:block"
              >
                Keluar
              </span>
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
