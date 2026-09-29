import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { getDashboardReport } from "@/lib/api/report";
import { listPolicies } from "@/lib/api/travel";
import { listDepartments, listPositions, listUsers } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";

import type { User } from "@/lib/api/types";

export const metadata = { title: "Dashboard • Super Admin" };

const ROLE_LABEL: Record<User["role"], string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  DEPARTMENT_HEAD: "Department Head",
  HRD: "HRD",
  FINANCE: "Finance",
  ADMIN: "Admin Travel",
  SUPER_ADMIN: "Super Admin",
};

/**
 * Super Admin overview.
 *
 * Every figure comes from an endpoint the spec gives this role: the user
 * directory and the two master-data lists (§2), the travel rollup (§7
 * `GET /api/reports/dashboard`), and the policy catalogue. Travel itself is
 * summarised as counts, never as a list — the operational view of a travel
 * request belongs to Admin Travel.
 */
export default async function AdminDashboardPage() {
  const user = await requireSuperAdmin();

  const [users, unread, travel, policies, departments, positions] =
    await Promise.all([
      settle(listUsers()),
      getUnreadCount().catch(() => ({ count: 0 })),
      settle(getDashboardReport()),
      settle(listPolicies()),
      settle(listDepartments()),
      settle(listPositions()),
    ]);

  if (!users.ok) {
    return (
      <Frame unread={unread.count} user={user}>
        <PageHeader
          title="Dashboard Super Admin"
          description="Ringkasan master data, pengguna, dan kondisi pengajuan travel di seluruh perusahaan."
        />
        <ErrorState error={users.error} />
      </Frame>
    );
  }

  const userRows = users.data;
  const travelReport = travel.ok ? travel.data : null;
  const policyRows = policies.ok ? policies.data : [];
  const departmentRows = departments.ok ? departments.data : [];
  const positionRows = positions.ok ? positions.data : [];

  const active = userRows.filter((row) => row.isActive !== false);
  const inactive = userRows.length - active.length;
  const byRole = new Map<User["role"], number>();
  for (const row of active) {
    byRole.set(row.role, (byRole.get(row.role) ?? 0) + 1);
  }
  const roleRows = [...byRole.entries()].sort((a, b) => b[1] - a[1]);
  const activePolicies = policyRows.filter((policy) => policy.isActive);

  return (
    <Frame unread={unread.count} user={user}>
      <PageHeader
        title="Dashboard Super Admin"
        description="Ringkasan master data, pengguna, dan kondisi pengajuan travel di seluruh perusahaan."
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              group
            </span>
            Kelola Pengguna
          </Link>
        }
      />

      <section
        aria-label="Ringkasan master data"
        className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Pengguna Aktif"
          value={active.length}
          icon="group"
          tone="primary"
          caption={`${inactive} akun nonaktif`}
          href="/admin/users"
        />
        <StatCard
          label="Departemen"
          value={departmentRows.length}
          icon="corporate_fare"
          tone="neutral"
          caption="Struktur organisasi"
          href="/admin/departments"
        />
        <StatCard
          label="Jabatan"
          value={positionRows.length}
          icon="badge"
          tone="neutral"
          caption="Penentu policy berlaku"
          href="/admin/positions"
        />
        <StatCard
          label="Travel Policy Aktif"
          value={activePolicies.length}
          icon="policy"
          tone="success"
          caption={`${policyRows.length} total kebijakan`}
          href="/admin/travel-policy"
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-md xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Sebaran Pengguna per Role"
            description="Dari GET /api/users. Role diubah satu per pengguna melalui PATCH /api/users/:id/role."
            action={
              <Link
                href="/admin/roles-permissions"
                className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
              >
                Rincian izin
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {roleRows.map(([role, count]) => {
              const pct = active.length ? Math.round((count / active.length) * 100) : 0;
              return (
                <div key={role}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-caption text-on-surface-variant">
                      {ROLE_LABEL[role]}
                    </span>
                    <span className="text-label-md font-bold text-on-surface">
                      {count}{" "}
                      <span className="text-caption font-normal text-tertiary">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!roleRows.length ? (
              <EmptyState
                icon="group_off"
                title="Belum ada pengguna"
                description="Tidak ada akun aktif yang tercatat."
              />
            ) : null}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-md">
          <Card>
            <CardHeader
              title="Kondisi Pengajuan"
              description="GET /api/reports/dashboard"
            />
            <CardBody className="space-y-3">
              {travelReport ? (
                <>
                  <SummaryCard
                    label="Total Pengajuan"
                    value={travelReport.total}
                    icon="assignment"
                    tone="neutral"
                    footnote="Seluruh pengajuan tercatat"
                  />
                  <SummaryCard
                    label="Sedang Berjalan"
                    value={travelReport.ongoing}
                    icon="flight_takeoff"
                    tone="accent"
                    footnote="Berlangsung di hari ini"
                  />
                  <SummaryCard
                    label="Akan Datang"
                    value={travelReport.upcoming}
                    icon="event_upcoming"
                    tone="primary"
                    footnote="Tanggal mulai di masa depan"
                  />
                  <SummaryCard
                    label="Selesai"
                    value={travelReport.completed}
                    icon="task_alt"
                    tone="success"
                    footnote="Siap reported ke Finance"
                  />
                </>
              ) : (
                <EmptyState
                  icon="insights"
                  title="Ringkasan belum tersedia"
                  description="Endpoint /api/reports/dashboard tidak dapat dibaca saat ini."
                  compact
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cakupan Tugas" />
            <CardBody className="flex flex-col gap-2">
              {[
                "Master data pengguna, departemen, jabatan, dan travel policy",
                "Penetapan role setiap pengguna",
                "Membaca seluruh data pengajuan di seluruh perusahaan",
              ].map((scope) => (
                <p
                  key={scope}
                  className="flex items-start gap-2 text-caption text-on-surface-variant"
                >
                  <span
                    className="material-symbols-outlined mt-px shrink-0 text-success"
                    style={{ fontSize: 16 }}
                  >
                    check_circle
                  </span>
                  {scope}
                </p>
              ))}
              <p className="mt-1 flex items-start gap-2 text-caption text-tertiary">
                <span
                  className="material-symbols-outlined mt-px shrink-0 text-outline"
                  style={{ fontSize: 16 }}
                >
                  info
                </span>
                Booking dan keberangkatan tetap berada di area Admin Travel.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Pengguna Terbaru"
          description="Lima akun terakhir pada direktori."
          action={
            <Link
              href="/admin/users"
              className="whitespace-nowrap text-caption font-semibold text-primary transition-colors hover:text-primary-container"
            >
              Lihat semua
            </Link>
          }
        />
        <CardBody>
          {active.length ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {active.slice(0, 6).map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/admin/users/${row.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-container-low"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-caption font-bold text-on-primary-fixed">
                      {initialsOf(row.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-label-md font-semibold text-on-surface">
                        {row.name}
                      </span>
                      <span className="block truncate text-caption text-tertiary">
                        {row.departmentName ?? "Tanpa departemen"}
                      </span>
                    </span>
                    <Badge tone="neutral" variant="outline">
                      {ROLE_LABEL[row.role]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="group_off"
              title="Belum ada pengguna"
              description="Tambahkan pengguna pertama dari halaman Pengguna."
            />
          )}
        </CardBody>
      </Card>

      <p className="text-caption text-tertiary">
        Nilai pengeluaran per departemen dan per karyawan tersedia di modul
        laporan, yang terbuka untuk role Finance, Admin, dan Super Admin.
      </p>
    </Frame>
  );
}

function Frame({
  user,
  unread,
  children,
}: {
  user: { name: string };
  unread: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/admin/dashboard" },
          { label: "Super Admin" },
        ]}
        unreadCount={unread}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />
      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        {children}
        <p className="text-caption text-tertiary">
          Masuk sebagai {user.name} • Super Admin
        </p>
      </main>
    </>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
