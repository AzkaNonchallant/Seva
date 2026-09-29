import Link from "next/link";

import { RoleSelect } from "@/components/admin/role-select";
import { FilterTabs } from "@/components/data-table/filters";
import { Header, PageHeader } from "@/components/layout/header";
import { DataTable, TableFooter, type Column } from "@/components/data-table/data-table";
import { SearchBar } from "@/components/ui/search-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getUnreadCount } from "@/lib/api/notification";
import { listUsers } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

import type { Role, User } from "@/lib/api/types";

export const metadata = { title: "Pengguna • Super Admin" };

const PER_PAGE = 10;

const ROLE_FILTERS: Array<{ value: Role | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "MANAGER", label: "Manager" },
  { value: "DEPARTMENT_HEAD", label: "Dept Head" },
  { value: "HRD", label: "HRD" },
  { value: "FINANCE", label: "Finance" },
  { value: "ADMIN", label: "Admin Travel" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

/**
 * §2 user directory.
 *
 * `GET /api/users` accepts only `role` and `departmentId` per the spec, so the
 * free-text search is applied here rather than being sent as a query the
 * backend would ignore. Role changes post to PATCH /api/users/:id/role through
 * `RoleSelect`, which re-gates on the server.
 */
type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const me = await requireSuperAdmin();
  const params = await searchParams;

  const role = (params.role as Role | "ALL" | undefined) ?? "ALL";
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number(params.page) || 1);

  const [unread, all] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listUsers()),
  ]);

  if (!all.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Super Admin", href: "/admin/dashboard" },
            { label: "Pengguna" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/admin/notifications"
          profileHref="/admin/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader title="Pengguna" description="Direktori akun PT Andrea." />
          <ErrorState error={all.error} />
        </main>
      </>
    );
  }

  const users = all.data;
  const counts = new Map<Role | "ALL", number>();
  counts.set("ALL", users.length);
  for (const row of users) counts.set(row.role, (counts.get(row.role) ?? 0) + 1);

  const filtered = users.filter((row) => {
    if (role !== "ALL" && row.role !== role) return false;
    if (!query) return true;
    return [row.name, row.email, row.departmentName, row.positionName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const activeCount = users.filter((row) => row.isActive !== false).length;

  const columns: Array<Column<User>> = [
    {
      key: "name",
      header: "Pengguna",
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/admin/users/${row.id}`}
            className="block truncate font-semibold text-primary transition-colors hover:text-primary-container"
          >
            {row.name}
          </Link>
          <span className="block truncate text-caption text-tertiary">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      key: "org",
      header: "Departemen & Jabatan",
      cell: (row) => (
        <div className="min-w-0 text-caption">
          <span className="block truncate text-on-surface">
            {row.departmentName ?? "—"}
          </span>
          <span className="block truncate text-tertiary">
            {row.positionName ?? "—"}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone="neutral" variant="outline">
            {ROLE_LABEL[row.role]}
          </Badge>
          <RoleSelect user={row} selfId={me.id} />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) =>
        row.isActive === false ? (
          <Badge tone="error" dot>
            Nonaktif
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Aktif
          </Badge>
        ),
    },
  ];

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Pengguna" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Pengguna"
          description="Seluruh akun PT Andrea beserta role, departemen, dan jabatan. Perubahan role memakai PATCH /api/users/:id/role dan hanya berlaku untuk Super Admin."
        />

        <section
          aria-label="Ringkasan pengguna"
          className="grid grid-cols-1 gap-md sm:grid-cols-3"
        >
          <SummaryCard
            label="Total Pengguna"
            value={users.length}
            icon="group"
            tone="neutral"
            footnote="Semua akun terdaftar"
          />
          <SummaryCard
            label="Aktif"
            value={activeCount}
            icon="check_circle"
            tone="success"
            footnote="Dapat masuk ke aplikasi"
          />
          <SummaryCard
            label="Nonaktif"
            value={users.length - activeCount}
            icon="person_off"
            tone="accent"
            footnote="Dinonaktifkan, riwayat tetap tersimpan"
          />
        </section>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* `min-w-0` on both levels: the tab group is a single non-wrapping
              row of eight options, so without it the toolbar widens the page
              rather than scrolling. */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FilterTabs<Role | "ALL">
              ariaLabel="Saring menurut role"
              paramName="role"
              value={role}
              options={ROLE_FILTERS.map((entry) => ({
                value: entry.value,
                label: entry.label,
                count: counts.get(entry.value) ?? 0,
              }))}
            />
          </div>
          <SearchBar
            paramName="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
            placeholder="Cari nama, email, departemen..."
            className="sm:w-72"
          />
        </div>

        <Card>
          {slice.length ? (
            <>
              <DataTable
                columns={columns}
                rows={slice}
                rowKey={(row) => row.id}
                empty={
                  <EmptyState
                    icon="person_search"
                    title="Tidak ada pengguna yang cocok"
                    description="Ubah saringan role atau kata kunci untuk melihat akun lain."
                    action={
                      <Link
                        href="/admin/users"
                        className="text-caption font-semibold text-primary hover:underline"
                      >
                        Reset saringan
                      </Link>
                    }
                  />
                }
              />
              <TableFooter
                from={(current - 1) * PER_PAGE + 1}
                to={Math.min(current * PER_PAGE, filtered.length)}
                total={filtered.length}
              />
            </>
          ) : users.length ? (
            <EmptyState
              icon="person_search"
              title="Tidak ada pengguna yang cocok"
              description="Ubah saringan role atau kata kunci untuk melihat akun lain."
              action={
                <Link
                  href="/admin/users"
                  className="text-caption font-semibold text-primary hover:underline"
                >
                  Reset saringan
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon="group_off"
              title="Belum ada pengguna"
              description="Direktori masih kosong."
            />
          )}
        </Card>
      </main>
    </>
  );
}
