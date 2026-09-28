"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
}: {
  items: NavItem[];
  userName: string;
  userRole: string;
  userInitials: string;
}) {
  const pathname = usePathname();

  const OPERASIONAL = [
    "/travel-admin/dashboard",
    "/travel-admin/bookings/queue",
    "/travel-admin/bookings",
    "/travel-admin/departures",
  ];
  const groups: Array<[string, NavItem[]]> = [
    ["Operasional", items.filter((item) => OPERASIONAL.includes(item.href))],
    [
      "Pendampingan",
      items.filter((item) => !OPERASIONAL.includes(item.href)),
    ],
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-outline-variant/25 bg-surface-container-lowest shadow-ambient lg:flex"
    >
      <div className="flex items-center gap-3 border-b border-outline-variant/20 px-md py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            flight_takeoff
          </span>
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-bold tracking-tight text-on-surface">
            Horizon Odyssey
          </p>
          <p className="text-caption text-tertiary">Dinas Travel • PT Andrea</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-md py-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container">
          {userInitials}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-label-md font-semibold text-on-surface">
            {userName}
          </p>
          <p className="truncate text-caption text-tertiary">{userRole}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-md">
        {groups.map(([group, groupItems]) => {
          if (!groupItems.length) return null;
          return (
            <div key={group}>
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-outline">
                {group}
              </p>
              <ul className="space-y-1">
                {groupItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/travel-admin/dashboard" &&
                      pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-label-md transition-colors",
                          active
                            ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                        )}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {item.badge ? (
                          <span className="ml-auto rounded-full bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-secondary-container">
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

      <div className="space-y-1 border-t border-outline-variant/20 px-4 py-3">
        <p className="px-4 text-caption text-tertiary">
          Role <span className="font-semibold text-on-surface">ADMIN</span> •
          Booking &amp; keberangkatan
        </p>
      </div>
    </nav>
  );
}
