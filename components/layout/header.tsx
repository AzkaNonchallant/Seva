import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Level 2 elevation: blurred translucent background with a hairline edge, so
 * the header stays legible over content without a hard shadow.
 */
export function Header({
  breadcrumb,
  unreadCount,
}: {
  breadcrumb: Array<{ label: string; href?: string }>;
  unreadCount: number;
}) {
  return (
    <header className="glass sticky top-0 z-30 border-b border-outline-variant/20">
      <div className="flex h-16 items-center justify-between gap-md px-margin-mobile md:px-md">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1 text-caption text-tertiary">
            {breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {index > 0 ? (
                  <span
                    className="material-symbols-outlined text-[14px] text-outline-variant"
                    aria-hidden
                  >
                    chevron_right
                  </span>
                ) : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-on-surface">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/travel-admin/notifications"
            aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
            className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              notifications
            </span>
            {unreadCount > 0 ? (
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary-container",
                  "ring-2 ring-surface-container-lowest",
                )}
              />
            ) : null}
          </Link>
          <Link
            href="/travel-admin/profile"
            aria-label="Profil saya"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              help_outline
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Page title block with optional action buttons. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface md:text-headline-lg">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  );
}
