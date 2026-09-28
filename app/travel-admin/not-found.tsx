import Link from "next/link";

/**
 * 404 inside the Travel Admin area. Keeps the operator inside the app shell
 * instead of dropping them on the bare Next.js default page.
 */
export default function TravelAdminNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-margin-mobile py-xl">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 28 }}
            aria-hidden
          >
            travel_explore
          </span>
        </span>

        <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
          Data tidak ditemukan
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Pengajuan atau booking yang Anda cari sudah tidak tersedia, atau
          tautannya salah.
        </p>

        <div className="mt-lg flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/travel-admin/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            <span
              className="material-symbols-outlined mr-1.5"
              style={{ fontSize: 18 }}
              aria-hidden
            >
              dashboard
            </span>
            Kembali ke Dashboard
          </Link>
          <Link
            href="/travel-admin/bookings/queue"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant px-md text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Lihat Antrean
          </Link>
        </div>
      </div>
    </div>
  );
}
