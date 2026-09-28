import Link from "next/link";

/**
 * Stand-in for scaffold routes that are not part of the current scope.
 *
 * The repository arrived with ~55 zero-byte page files across the (admin),
 * (approver), (employee) and (finance) groups. Empty `.tsx` files are not
 * modules, so they break `next typegen` and `tsc`. Rather than delete routes
 * someone deliberately scaffolded, each one renders this notice until its
 * screen is implemented.
 */
export function PlaceholderPage({
  title,
  description,
  role,
}: {
  title: string;
  description: string;
  role: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-md py-xl">
      <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-lg text-center shadow-ambient">
        <span className="mx-auto mb-md flex w-14 h-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <span className="material-symbols-outlined text-[28px]">construction</span>
        </span>
        <p className="mb-1 font-caption text-caption font-bold uppercase tracking-widest text-outline">
          {role}
        </p>
        <h1 className="mb-2 text-headline-md text-on-surface">{title}</h1>
        <p className="mb-md text-body-md text-on-surface-variant">{description}</p>
        <Link
          href="/travel-admin/dashboard"
          className="inline-flex items-center gap-xs rounded-lg bg-primary px-md py-2.5 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
