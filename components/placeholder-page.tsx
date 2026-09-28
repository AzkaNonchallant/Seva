import Link from "next/link";

import { logoutAction } from "@/app/actions/auth-actions";
import { requireSession } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { initials } from "@/lib/utils";

/**
 * Stand-in for scaffold routes that are not part of the current scope.
 *
 * The repository arrived with ~55 zero-byte page files across the (admin),
 * (approver), (employee) and (finance) groups. Empty `.tsx` files are not
 * modules, so they break `next typegen` and `tsc`. Rather than delete routes
 * someone deliberately scaffolded, each one renders this notice until its
 * screen is implemented.
 *
 * The session is read here rather than in each page so every scaffolded
 * route is authenticated and offers a working sign-out, not just the
 * dashboard that happens to be linked from the login screen.
 */
export async function PlaceholderPage({
  title,
  description,
  role,
}: {
  title: string;
  description: string;
  role: string;
}) {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 bg-surface-container-lowest px-margin-mobile py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              flight_takeoff
            </span>
          </span>
          <div className="leading-tight">
            <p className="text-label-md font-bold text-on-surface">
              Horizon Odyssey
            </p>
            <p className="text-caption text-tertiary">
              Dinas Travel • PT Andrea
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-caption font-bold text-on-primary-fixed">
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-caption font-semibold text-on-surface">
                {user.name}
              </p>
              <p className="text-caption text-tertiary">
                {ROLE_LABEL[user.role]}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-primary px-3 py-1.5 text-caption font-semibold text-primary transition-colors hover:bg-primary-fixed/30"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                logout
              </span>
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-lg text-center shadow-ambient">
          <span className="mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <span className="material-symbols-outlined text-[28px]">construction</span>
          </span>
          <p className="mb-1 font-caption text-caption font-bold uppercase tracking-widest text-outline">
            {role}
          </p>
          <h1 className="mb-2 text-headline-md text-on-surface">{title}</h1>
          <p className="mb-md text-balance text-body-md text-on-surface-variant">
            {description}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-xs rounded-lg bg-primary px-md py-2.5 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
