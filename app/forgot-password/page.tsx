import Link from "next/link";

export const metadata = { title: "Lupa Password • Horizon Odyssey" };

/**
 * API_SPEC publishes no password-reset endpoint, so this screen states that
 * plainly instead of posting to an invented route.
 */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile py-xl">
      <div className="w-full max-w-md">
        <div className="mb-lg flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              flight_takeoff
            </span>
          </span>
          <div className="leading-tight">
            <p className="text-headline-md font-bold tracking-tight text-on-surface">
              Horizon Odyssey
            </p>
            <p className="text-caption text-tertiary">Dinas Travel • PT Andrea</p>
          </div>
        </div>

        <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
          Lupa password
        </h1>

        <div
          role="status"
          className="mt-md flex items-start gap-3 rounded-xl bg-surface-container-low p-4"
        >
          <span className="material-symbols-outlined shrink-0 text-outline" style={{ fontSize: 20 }}>
            info
          </span>
          <p className="text-caption leading-relaxed text-on-surface-variant">
            API_SPEC belum mendefinisikan endpoint reset password. Hubungi Super
            Admin untuk mengatur ulang kredensial akun Anda.
          </p>
        </div>

        <p className="mt-md text-center text-caption text-tertiary">
          <Link href="/login" className="transition-colors hover:text-primary">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
