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
 * Sidebar follows the Stitch admin dashboard: white surface, 1px divider,
 * brand block, then grouped links. Level 2 elevation (ambient shadow) keeps it
 * readable when a page scrolls underneath.
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

  return (
    <>
      <button
        type="button"
        aria-label={mobileVisible && !mobileClosing ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={mobileVisible && !mobileClosing}
        onClick={mobileVisible && !mobileClosing ? closeMobileMenu : openMobileMenu}
        className="fixed left-3 top-1.5 z-50 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
          {mobileVisible && !mobileClosing ? "close" : "menu"}
        </span>
      </button>
      {mobileVisible ? (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={closeMobileMenu}
          className={cn(
            "fixed inset-0 z-30 bg-black/45 lg:hidden",
            mobileClosing ? "mobile-menu-overlay-out" : "mobile-menu-overlay",
          )}
        />
      ) : null}
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-white/10 bg-primary",
          mobileVisible ? "flex" : "hidden",
          mobileClosing ? "mobile-menu-drawer-out" : "mobile-menu-drawer",
          "lg:flex",
        )}
      >
      <div className="flex items-center gap-3 border-b border-white/10 px-md py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            flight_takeoff
          </span>
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-[19px] font-semibold text-white">
            Horizon Odyssey
          </p>
          <p className="text-caption text-white/65">Dinas Travel • PT Andrea</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-md py-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-white">
          {userInitials}
        </span>
        <div className="min-w-0 leading-tight">
            <p className="truncate text-label-md font-semibold text-white">
            {userName}
          </p>
          <p className="truncate text-caption text-white/65">{userRole}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-md">
        {groups.map(([group, groupItems]) => {
          if (!groupItems.length) return null;
          return (
            <div key={group}>
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                {group}
              </p>
              <ul className="space-y-1">
                {groupItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== homePath && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-label-md transition-colors",
                          active
                            ? "bg-primary-container font-semibold text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {item.badge ? (
                           <span className="ml-auto rounded-full bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        {roleCaption ? <p className="px-4 pb-2 text-caption text-white/60">{roleCaption}</p> : null}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 text-label-md font-semibold text-white transition-colors hover:bg-white/10"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              logout
            </span>
            <span>Keluar</span>
          </button>
        </form>
      </div>
      </nav>
    </>
  );
}
