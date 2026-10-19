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
 * The slot this fills is the one travel templates give a star rating and a user
 * count, which would be invented numbers for a system with no customers yet, so
 * it carries the workflow instead.
 */
const APPROVAL_FLOW = [
  { icon: "outbox", label: "Pegawai mengajukan" },
  { icon: "approval", label: "Atasan menyetujui" },
  { icon: "payments", label: "Finance membayar" },
];

/**
 * Split screen, and the reason each breakpoint is where it is:
 *
 * - Below `md` there is no photo column at all. A 768px tablet split gives each
 *   side ~360px, which is narrower than the 448px form, so the form would either
 *   overflow or the photo would collapse to a sliver. A short band carries the
 *   identity instead and the form keeps the full width.
 * - `md` to `lg` is the same problem, so the band stays until 1024px, where each
 *   side can hold its content properly.
 * - At `lg` the photo becomes a full column. `xl` widens it to 7/12 but caps at
 *   860px: past that the 736px source is upscaled far enough to read as soft.
 */
export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(ROLE_HOME[user.role] ?? "/travel-admin/dashboard");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
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
        {/* Two-tone scrim. The top band holds the wordmark over bright sky, the
            bottom anchors the card over the lagoon, so white text never lands
            on a light patch of water. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/25 to-slate-950/85"
        />
        <div aria-hidden className="absolute inset-0 bg-slate-900/25 mix-blend-multiply" />

        {/* Centred rather than spread top-and-bottom. justify-between left a
            band of empty water at the top and pushed the card off the optical
            centre; the lockup and card now read as one group. */}
        <div className="absolute inset-0 flex flex-col justify-center gap-lg p-lg xl:p-xl">
          <BrandLockup className="self-start" />

          {/* `container-type: inline-size` gives the card a query container so the
              heading can size itself to the column it sits in. */}
          <div className="max-w-xl [container-type:inline-size]">
            {/* Dark-tinted glass, not white: white type has to clear AA against
                whatever the photograph is doing behind it. */}
            <div className="rounded-2xl border border-white/20 bg-slate-950/45 p-lg backdrop-blur-xl">
              {/* Scaled to the column, not the viewport. The photo column is
                  512px at `lg` and 860px at `xl`, so one fixed 40px heading
                  wrapped to four cramped lines in the narrow case. */}
              <h2 className="text-balance text-[clamp(1.5rem,3.2cqw,2.5rem)] font-semibold leading-[1.15] text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)]">
                Perjalanan dinas, dari ajuan sampai pembayaran.
              </h2>
              <p className="mt-3 text-body-md text-white/90 [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">
                Ajukan perjalanan, tunggu persetujuan atasan, lalu pantau
                pembayaran klaim biaya. Satu tempat, satu riwayat.
              </p>

              {/* Step numbers, not arrows. An arrow separator has to sit between
                  two items, so when the row wraps it lands at the end of a line
                  and points at nothing. A numeral is self-contained, so the
                  sequence survives any wrap. */}
              <ol className="mt-lg space-y-3 border-t border-white/20 pt-md">
                {APPROVAL_FLOW.map((step, i) => (
                  <li
                    key={step.label}
                    className="flex items-center gap-3 text-caption text-white/90"
                  >
                    <span
                      aria-hidden
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/15 text-[11px] font-bold tabular-nums text-white"
                    >
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="material-symbols-outlined shrink-0 text-white"
                        style={{ fontSize: 15 }}
                      >
                        {step.icon}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex w-full flex-col bg-background lg:flex-[6] xl:flex-[5]">
        {/* Stands in for the photo column below `lg`. Its height shrinks on the
            shortest phones so the form is never pushed below the fold. */}
        <div className="relative h-36 shrink-0 overflow-hidden sm:h-40 lg:hidden">
          {/* 0px from lg up: the band is hidden there, so any width would only
              have Next.js fetch an image the layout never shows. */}
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
            className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/35"
          />
          <div className="absolute inset-0 flex items-center px-margin-mobile">
            <BrandLockup variant="band" />
          </div>
        </div>

        {/* Centred on tall screens, top-aligned with a comfortable minimum pad
            on short ones. Pure centring pushed the form's top edge under a
            landscape phone's viewport. */}
        <div className="flex flex-1 items-center justify-center px-margin-mobile py-lg md:px-lg md:py-xl">
          <div className="w-full max-w-md">
            <LoginForm mockMode={usesMockBackend()} />
          </div>
        </div>
      </main>
    </div>
  );
}