import Image from "next/image";
import { redirect } from "next/navigation";

import { BrandLockup } from "@/components/auth/brand-lockup";
import { LoginForm } from "@/components/auth/login-form";
import { usesMockBackend } from "@/lib/api/api";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

export const metadata = { title: "Masuk • Horizon Odyssey" };

const PHOTO = "/images/login-raja-ampat.jpg";

/**
 * The three stages a travel request actually moves through, in the order the
 * backend runs them: an employee files it, an approver decides, finance pays.
 * The layout slot it fills is the one travel templates use for a star rating
 * and a user count, which would be invented numbers for a system that has no
 * customers yet, so it carries the workflow instead.
 */
const APPROVAL_FLOW = [
  { icon: "outbox", label: "Pegawai mengajukan" },
  { icon: "approval", label: "Atasan menyetujui" },
  { icon: "payments", label: "Finance membayar" },
];

/**
 * Split screen. The photo panel carries the brand from `lg` up and a short
 * band stands in for it below, so the phone still shows the identity instead
 * of dropping to a bare form. The panel grows to 7/12 of the width at `xl` but
 * stops at 860px: past that the 736px source would be upscaled far enough to
 * read as soft.
 */
export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(ROLE_HOME[user.role] ?? "/travel-admin/dashboard");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative hidden overflow-hidden lg:block lg:flex-[6] xl:max-w-[860px] xl:flex-[7]">
        {/* Decorative: the wordmark beside it carries the meaning, so the
            photograph gets an empty alt rather than a description. */}
        <Image
          src={PHOTO}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 860px, (min-width: 1024px) 50vw, 100vw"
          className="scale-105 object-cover object-center transition-transform duration-1000 ease-out hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-105"
        />
        {/* Two-tone scrim. The top band holds the wordmark over bright sky,
            the bottom anchors the card over the lagoon, so white text never
            lands on a light patch of water. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/30 to-slate-950/85"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-slate-900/20 mix-blend-multiply"
        />

        <div className="absolute inset-0 flex flex-col justify-between p-lg xl:p-xl">
          <BrandLockup />
          <div className="max-w-xl">
            {/* Dark-tinted glass, not white: white type has to clear AA against
                whatever the photograph is doing behind it. */}
            <div className="rounded-2xl border border-white/20 bg-slate-950/50 p-lg backdrop-blur-xl">
              <h2 className="text-balance text-headline-lg font-semibold text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.4)]">
                Perjalanan dinas, dari ajuan sampai pembayaran.
              </h2>
              <p className="mt-3 text-body-md text-white/90">
                Ajukan perjalanan, tunggu persetujuan atasan, lalu pantau
                pembayaran klaim biaya. Satu tempat, satu riwayat.
              </p>

              <ol className="mt-md space-y-2 border-t border-white/20 pt-md">
                {APPROVAL_FLOW.map((step) => (
                  <li
                    key={step.label}
                    className="flex items-center gap-2.5 text-caption text-white/90"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
                      <span
                        className="material-symbols-outlined text-white"
                        style={{ fontSize: 14 }}
                      >
                        {step.icon}
                      </span>
                    </span>
                    {step.label}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex w-full flex-col bg-background lg:flex-[6] xl:flex-[5]">
        {/* Stands in for the photo panel on a phone. Fixed height so it never
            competes with the form for vertical room. */}
        <div className="relative h-44 shrink-0 overflow-hidden lg:hidden">
          {/* 0px declared from lg up: the band is hidden there, so any width
              would only have Next.js fetch an image the layout never shows. */}
          <Image
            src={PHOTO}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 0px, 100vw"
            className="object-cover object-[center_35%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-950/40"
          />
          <div className="absolute inset-0 flex items-center px-margin-mobile">
            <BrandLockup variant="band" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-margin-mobile py-xl md:px-lg">
          <div className="w-full max-w-md">
            <LoginForm mockMode={usesMockBackend()} />
          </div>
        </div>
      </main>
    </div>
  );
}
