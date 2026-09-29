import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { usesMockBackend } from "@/lib/api/api";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

export const metadata = { title: "Masuk • Horizon Odyssey" };

/**
 * Split screen, per the Stitch login reference: the brand panel fills the
 * left half from `lg` up, and the form column takes the rest. Below `lg` the
 * panel is dropped and the form's own lockup sits above the fields, so the
 * two columns never have to be forced onto a phone. The breakpoint is `lg`
 * rather than Stitch's `md` because the form column is capped at 600-800px,
 * which would leave the brand panel under 250px at tablet widths.
 */
export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(ROLE_HOME[user.role] ?? "/travel-admin/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden flex-1 overflow-hidden bg-primary lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-container/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-secondary-fixed/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"
        />

        <div className="relative z-10 flex flex-col justify-between p-lg lg:p-xl">
          <span className="text-headline-md font-bold text-on-primary">
            Horizon Odyssey
          </span>

          <div className="glass rounded-xl border border-white/20 p-lg">
            <h2 className="mb-sm text-headline-lg text-on-primary">
              Discover the extraordinary.
            </h2>
            <p className="text-balance text-body-lg text-on-primary/90">
              Your next adventure begins here. Sign in to manage your
              itineraries, explore new destinations, and embark on
              unforgettable journeys.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex w-full max-w-full shrink-0 flex-col items-center justify-center bg-background px-margin-mobile py-xl md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px]">
        <div className="w-full max-w-[400px]">
          <LoginForm mockMode={usesMockBackend()} />
        </div>
      </main>
    </div>
  );
}
