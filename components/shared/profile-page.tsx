import { logoutAction } from "@/app/actions/auth-actions";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { me } from "@/lib/api/auth";
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

      <main className="flex max-w-3xl flex-col gap-md px-margin-mobile py-md md:px-md">
        <PageHeader
          title="Profil Saya"
          description="Data akun yang dibaca dari GET /api/auth/me."
        />

        <Card>
          <div className="flex items-start gap-4 border-b border-outline-variant/15 p-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary-container">
              {initials(fresh.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {fresh.name}
              </h2>
              <p className="text-body-md text-on-surface-variant">{fresh.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="primary" icon="badge">
                  {roleLabel}
                </Badge>
                <Badge tone="neutral" variant="outline">
                  Role API: {fresh.role}
                </Badge>
              </div>
            </div>
          </div>

          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Fact label="Jabatan" value={fresh.positionName ?? "—"} />
            <Fact label="Departemen" value={fresh.departmentName ?? "—"} />
            <Fact label="Status akun" value={fresh.isActive === false ? "Nonaktif" : "Aktif"} />
            <Fact label="ID pengguna" value={String(fresh.id)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cakupan Akses"
            description="Hak yang diberikan oleh role ini pada API_SPEC bagian 8."
          />
          <CardBody>
            <ul className="space-y-2">
              {scope.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="material-symbols-outlined mt-px shrink-0 text-success"
                    style={{ fontSize: 16 }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-md text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Keluar dari akun
              </p>
              <p className="text-caption text-on-surface-variant">
                Sesi tersimpan di cookie httpOnly dan berakhir otomatis setelah 8
                jam. Menghapus sesi ini langsung mengembalikan akses ke halaman
                login.
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-error-container px-md text-label-md font-semibold text-on-error-container transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  logout
                </span>
                Keluar
              </button>
            </form>
          </CardBody>
        </Card>
      </main>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-tertiary">{label}</p>
      <p className="mt-0.5 text-label-md font-semibold text-on-surface">{value}</p>
    </div>
  );
}

/**
 * Mirrors ROLE_LABEL in `lib/permissions`, which is a server-only module because
 * it sits next to the auth guards. Kept as a local map so this shared component
 * can be imported from either kind of page without pulling in `next/headers`.
 */
const ROLE_LABELS: Record<User["role"], string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  DEPARTMENT_HEAD: "Department Head",
  HRD: "HRD",
  FINANCE: "Finance",
  ADMIN: "Admin Travel",
  SUPER_ADMIN: "Super Admin",
};

function labelFor(role: User["role"]) {
  return ROLE_LABELS[role];
}
