import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { me } from "@/lib/api/auth";
import { departmentName, positionName } from "@/lib/api/user-format";
import { initials } from "@/lib/utils";

import type { User } from "@/lib/api/types";

/**
 * Profile and sign-out, shared by every role area.
 *
 * The layout already gated the session; `me()` re-reads the account through
 * GET /api/auth/me so the screen shows the server's view rather than the cookie
 * snapshot. The fallback to the session user keeps the page usable if that call
 * is unavailable.
 */
export async function ProfilePage({
  sessionUser,
  areaLabel,
  homeHref,
  notificationsHref,
  scope,
}: {
  sessionUser: User;
  areaLabel: string;
  homeHref: string;
  notificationsHref: string;
  /** The rights API_SPEC section 8 grants this role. */
  scope: string[];
}) {
  const fresh = await me().catch(() => sessionUser);
  const roleLabel = labelFor(fresh.role);

  return (
    <>
      <Header
        breadcrumb={[
          { label: areaLabel, href: homeHref },
          { label: "Profil" },
        ]}
        unreadCount={0}
        notificationsHref={notificationsHref}
        profileHref={`${homeHref.replace(/\/dashboard$/, "")}/profile`}
      />

        <main className="flex max-w-5xl flex-col gap-section px-margin-mobile py-section md:px-md">
        <PageHeader
          title="Profil Saya"
          description="Data akun yang dibaca dari GET /api/auth/me."
        />

        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-primary px-lg py-xl text-white md:px-xl">
            <div aria-hidden className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-container/45" />
            <div aria-hidden className="absolute -bottom-32 left-1/2 h-56 w-56 rounded-full bg-secondary-container/20" />
            <div className="relative flex flex-col gap-lg sm:flex-row sm:items-center">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white font-display text-[30px] font-semibold text-primary shadow-sm">
                {initials(fresh.name)}
              </span>
              <div className="min-w-0">
                <p className="text-caption font-semibold uppercase tracking-[0.14em] text-white/65">
                  Akun aktif
                </p>
                <h2 className="mt-1 text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-tight text-white">
                  {fresh.name}
                </h2>
                <p className="mt-1 text-body-md text-white/75">{fresh.email}</p>
                <div className="mt-md flex flex-wrap gap-2">
                  <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 text-caption font-semibold text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      badge
                    </span>
                    {roleLabel}
                  </span>
                  <span className="inline-flex min-h-9 items-center rounded-full border border-white/25 bg-white/10 px-3 text-caption text-white/85">
                    Role API: {fresh.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <CardBody className="grid grid-cols-1 gap-5 bg-white sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon="work" label="Jabatan" value={positionName(fresh)} />
            <Fact icon="domain" label="Departemen" value={departmentName(fresh)} />
            <Fact icon="verified_user" label="Status akun" value={fresh.isActive === false ? "Nonaktif" : "Aktif"} />
            <Fact icon="fingerprint" label="ID pengguna" value={String(fresh.id)} />
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Cakupan Akses"
            description="Hak yang diberikan oleh role ini berdasarkan API_SPEC bagian 8."
            action={
              <span className="inline-flex min-h-9 items-center rounded-full bg-primary-fixed px-3 text-caption font-semibold text-on-primary-fixed">
                {scope.length} hak akses
              </span>
            }
          />
          <CardBody className="bg-surface-container-low">
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {scope.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-md bg-white p-md shadow-ambient">
                  <span
                    className="material-symbols-outlined mt-0.5 shrink-0 text-primary-container"
                    style={{ fontSize: 19 }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-md text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

      </main>
    </>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-caption text-tertiary">{label}</p>
        <p className="mt-0.5 truncate text-label-md font-semibold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

/**
 * Mirrors ROLE_LABEL in `lib/permissions`, which is a server-only module because
 * it sits next to the auth guards. Kept as a local map so this shared component
 * can be imported from either kind of page without pulling in `next/headers`.
 */
import { ROLE_LABEL } from "@/lib/permissions";

function labelFor(role: User["role"]) {
  return ROLE_LABEL[role];
}
