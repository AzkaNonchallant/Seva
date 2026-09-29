import Link from "next/link";
import { notFound } from "next/navigation";

import { DeactivateUserButton, UserProfileForm } from "@/components/admin/user-profile-form";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { getUnreadCount } from "@/lib/api/notification";
import { listTravels } from "@/lib/api/travel";
import { listDepartments, listPositions, listUsers } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { initials } from "@/lib/utils";

export const metadata = { title: "Detail Pengguna • Super Admin" };

/**
 * One account, in the context of the travel it has raised. The travel rows come
 * from `GET /api/travel`, which the spec grants this role read access to, and
 * are shown read-only: booking and trip handling is Admin Travel's area.
 */
export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireSuperAdmin();
  const { id } = await params;
  const userId = Number(id);

  const [users, unread, departments, positions] = await Promise.all([
    settle(listUsers()),
    getUnreadCount().catch(() => ({ count: 0 })),
    listDepartments().catch(() => []),
    listPositions().catch(() => []),
  ]);

  if (!users.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Super Admin", href: "/admin/dashboard" },
            { label: "Pengguna", href: "/admin/users" },
            { label: "Detail" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/admin/notifications"
          profileHref="/admin/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={users.error} />
        </main>
      </>
    );
  }

  const user = users.data.find((row) => row.id === userId);
  if (!user) notFound();

  // The spec has no per-employee travel endpoint, so this filters the list it
  // already publishes for readers of all data.
  const travels = await listTravels().catch(() => []);
  const ownTravels = travels.filter((travel) => travel.employeeId === userId);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Pengguna", href: "/admin/users" },
          { label: user.name },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title={user.name}
          description={`${user.email} • ${ROLE_LABEL[user.role]}`}
          actions={
            <Link
              href="/admin/users"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-md text-label-md font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                arrow_back
              </span>
              Kembali ke Direktori
            </Link>
          }
        />

        <Card>
          <div className="flex items-start gap-4 border-b border-outline-variant/15 p-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary-container">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {user.name}
              </h2>
              <p className="text-body-md text-on-surface-variant">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="primary" icon="badge">
                  {ROLE_LABEL[user.role]}
                </Badge>
                <Badge tone="neutral" variant="outline">
                  API: {user.role}
                </Badge>
                <Badge
                  tone={user.isActive === false ? "error" : "success"}
                  dot
                >
                  {user.isActive === false ? "Nonaktif" : "Aktif"}
                </Badge>
              </div>
            </div>
          </div>

          <CardBody>
            <UserProfileForm
              user={user}
              departments={departments}
              positions={positions}
              selfId={me.id}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Riwayat Pengajuan"
            description="Dibaca dari GET /api/travel. Menampilkan status dan tujuan pengajuan, bukan dokumen pendukung maupun nominal."
            action={
              <span className="text-caption text-tertiary">
                {ownTravels.length} pengajuan
              </span>
            }
          />
          <CardBody>
            {ownTravels.length ? (
              <ul className="flex flex-col divide-y divide-outline-variant/15">
                {ownTravels.map((travel) => (
                  <li
                    key={travel.id}
                    className="flex flex-wrap items-center gap-3 py-3"
                  >
                    <span className="font-mono text-caption text-tertiary">
                      {travel.ref ?? `#${travel.id}`}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body-md text-on-surface">
                      {travel.destination}
                    </span>
                    <span className="text-caption text-tertiary">
                      {travel.startDate} → {travel.endDate}
                    </span>
                    <TravelStatusBadge status={travel.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-tertiary">
                Pengguna ini belum mengajukan travel dinas.
              </p>
            )}
          </CardBody>
        </Card>

        {user.id !== me.id ? (
          <Card>
            <CardHeader
              title="Status Akun"
              description="DELETE /api/users/:id menonaktifkan akun tanpa menghapus riwayatnya."
            />
            <CardBody>
              <DeactivateUserButton user={user} />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <p className="text-caption text-tertiary">
                Ini akun Anda sendiri, sehingga tidak dapat dinonaktifkan dari
                halaman ini.
              </p>
            </CardBody>
          </Card>
        )}
      </main>
    </>
  );
}
