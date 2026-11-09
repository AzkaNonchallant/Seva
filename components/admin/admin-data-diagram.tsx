import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABEL } from "@/lib/permissions";

import type { ReportDashboard, TravelStatus, User } from "@/lib/api/types";

const STATUS_LABEL: Record<TravelStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  IN_REVIEW: "Ditinjau",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
};

const STATUS_COLORS: Record<TravelStatus, string> = {
  DRAFT: "bg-surface-container-highest",
  SUBMITTED: "bg-secondary",
  IN_REVIEW: "bg-primary-container",
  APPROVED: "bg-success",
  REJECTED: "bg-error",
  CANCELLED: "bg-outline",
  COMPLETED: "bg-primary",
};

const STATUS_ORDER: TravelStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

const ROLE_COLORS: Record<User["role"], { chart: string; utility: string }> = {
  SUPER_ADMIN: { chart: "#15002C", utility: "bg-primary" },
  ADMIN: { chart: "#6307F8", utility: "bg-primary-container" },
  TRAVEL_ADMIN: { chart: "#9B78FF", utility: "bg-secondary" },
  FINANCE: { chart: "#007A62", utility: "bg-success" },
  MANAGER: { chart: "#B35C00", utility: "bg-warning" },
  DEPARTMENT_HEAD: { chart: "#A5235B", utility: "bg-error" },
  HRD: { chart: "#3567A8", utility: "bg-info" },
  EMPLOYEE: { chart: "#637083", utility: "bg-outline" },
};

export function AdminDataDiagram({
  users,
  travel,
}: {
  users: User[];
  travel: ReportDashboard | null;
}) {
  const activeUsers = users.filter((user) => user.isActive !== false);
  const roleRows = [...new Map(activeUsers.map((user) => [user.role, activeUsers.filter((item) => item.role === user.role).length])).entries()]
    .sort((a, b) => b[1] - a[1]);
  const statuses = travel
    ? STATUS_ORDER.map((status) => ({ status, count: travel.byStatus[status] ?? 0 })).filter((row) => row.count > 0)
    : [];

  const roleTotal = roleRows.reduce((sum, [, count]) => sum + count, 0);
  const roleSegments = roleRows.reduce<Array<{ role: User["role"]; count: number; offset: number }>>(
    (segments, [role, count]) => [
      ...segments,
      {
        role,
        count,
        offset: segments.length ? segments[segments.length - 1].offset + segments[segments.length - 1].count : 0,
      },
    ],
    [],
  );
  const maxStatusCount = Math.max(...statuses.map((row) => row.count), 1);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Diagram data operasional"
        description="Komposisi akun aktif dan alur status pengajuan dari data backend saat ini."
      />
      <CardBody className="grid grid-cols-1 gap-xl bg-surface-container-low lg:grid-cols-[1.35fr_0.65fr]">
        <section aria-labelledby="travel-diagram-title">
          <div className="mb-md flex items-center justify-between gap-3">
            <div>
              <h3 id="travel-diagram-title" className="text-label-lg font-semibold text-on-surface">
                Ringkasan pengajuan
              </h3>
              <p className="mt-1 text-caption text-tertiary">Distribusi status dari seluruh pengajuan</p>
            </div>
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              monitoring
            </span>
          </div>
          {statuses.length ? (
            <div className="rounded-xl bg-white p-md">
              <div className="flex h-48 items-end gap-2 border-b border-outline-variant/30 px-2 pb-0 sm:gap-4">
                {statuses.map(({ status, count }) => (
                  <div key={status} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-caption font-bold text-on-surface">{count}</span>
                    <div
                      className={`w-full max-w-14 rounded-t-lg ${STATUS_COLORS[status]} transition-[height] duration-500`}
                      style={{ height: `${Math.max((count / maxStatusCount) * 124, 12)}px` }}
                      title={`${STATUS_LABEL[status]}: ${count}`}
                    />
                    <span className="w-full truncate text-center text-[10px] text-tertiary">{STATUS_LABEL[status]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-md flex flex-wrap gap-x-4 gap-y-2">
                {statuses.map(({ status, count }) => (
                  <span key={status} className="flex items-center gap-1.5 text-caption text-on-surface-variant">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} aria-hidden="true" />
                    {STATUS_LABEL[status]} ({count})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon="insights" title="Belum ada data pengajuan" description="Diagram akan muncul saat laporan dashboard tersedia." compact />
          )}
        </section>

        <section aria-labelledby="role-diagram-title">
          <div className="mb-md flex items-center justify-between gap-3">
            <div>
              <h3 id="role-diagram-title" className="text-label-lg font-semibold text-on-surface">
                Distribusi role
              </h3>
              <p className="mt-1 text-caption text-tertiary">Akun aktif berdasarkan role</p>
            </div>
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              donut_large
            </span>
          </div>
          {roleRows.length ? (
            <>
              <div className="flex justify-center rounded-xl bg-white py-lg" aria-label="Diagram distribusi role pengguna">
                <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90" role="img" aria-label={`Total ${roleTotal} akun aktif`}>
                  <circle cx="60" cy="60" r="42" fill="none" stroke="#eceaf0" strokeWidth="16" />
                  {roleSegments.map(({ role, count, offset }, index) => (
                    <circle
                      key={role}
                      cx="60"
                      cy="60"
                      r="42"
                      fill="none"
                      stroke={ROLE_COLORS[role].chart}
                      strokeWidth="16"
                      strokeDasharray={`${(count / roleTotal) * 264} 264`}
                      strokeDashoffset={`${-(offset / roleTotal) * 264}`}
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-md space-y-2">
                {roleRows.map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between gap-3 text-caption">
                    <span className="flex min-w-0 items-center gap-2 text-on-surface-variant">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ROLE_COLORS[role].utility}`} aria-hidden="true" />
                      <span className="truncate">{ROLE_LABEL[role]}</span>
                    </span>
                    <span className="font-bold text-on-surface">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="group_off" title="Belum ada akun aktif" description="Diagram akan muncul setelah data pengguna tersedia." compact />
          )}
        </section>
      </CardBody>
    </Card>
  );
}
