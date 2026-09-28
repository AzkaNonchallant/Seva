import { formatDateTime } from "@/lib/utils";

import type { Approval, ApprovalDecision } from "@/lib/api/types";

const DECISION: Record<
  ApprovalDecision,
  { label: string; chip: string; icon: string }
> = {
  PENDING: {
    label: "Menunggu keputusan",
    chip: "bg-surface-container-high text-on-surface-variant",
    icon: "schedule",
  },
  APPROVED: {
    label: "Disetujui",
    chip: "bg-success-container text-success",
    icon: "check_circle",
  },
  REJECTED: {
    label: "Ditolak",
    chip: "bg-error-container text-on-error-container",
    icon: "cancel",
  },
};

const LEVEL_LABEL: Record<string, string> = {
  MANAGER: "Atasan Langsung",
  DEPARTMENT_HEAD: "Kepala Departemen",
  HRD: "Human Resource",
  FINANCE: "Finance",
};

/**
 * Vertical approval timeline for one travel request.
 * Order follows `level` ascending, matching how `POST /api/travel/:id/submit`
 * generates one Approval row per level.
 */
export function ApprovalTimeline({ approvals }: { approvals: Approval[] }) {
  if (!approvals.length) {
    return (
      <p className="px-md py-md text-caption text-on-surface-variant">
        Belum ada data persetujuan.
      </p>
    );
  }

  const ordered = [...approvals].sort((a, b) => a.level - b.level);

  return (
    <ol className="relative space-y-md p-md pl-11">
      <span
        aria-hidden
        className="absolute bottom-6 left-[26px] top-6 w-0.5 bg-surface-container-high"
      />
      {ordered.map((approval) => {
        const meta = DECISION[approval.status];
        const isPending = approval.status === "PENDING";
        return (
          <li key={approval.id} className="relative">
            <span
              aria-hidden
              className={`absolute -left-11 top-0.5 flex h-7 w-7 items-center justify-center rounded-full ${
                isPending
                  ? "bg-primary-container text-on-primary-container ring-4 ring-primary-fixed/50"
                  : approval.status === "APPROVED"
                    ? "bg-primary text-on-primary"
                    : "bg-error-container text-on-error-container"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {isPending ? "sync" : meta.icon}
              </span>
            </span>

            <div
              className={
                isPending
                  ? "rounded-xl bg-surface-container-low p-3 shadow-sm"
                  : "rounded-lg p-3"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="text-label-md font-semibold text-on-surface">
                  {approval.level}.{" "}
                  {LEVEL_LABEL[approval.approverRole] ?? approval.approverRole}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.chip}`}
                >
                  {meta.label}
                </span>
              </div>

              {approval.approverName ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-caption text-on-surface-variant">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary-container text-[9px] font-bold text-on-tertiary-container">
                    {initialsOf(approval.approverName)}
                  </span>
                  {approval.approverName}
                  {approval.delegatedToName ? (
                    <span className="text-accent">
                      (didelegasikan ke {approval.delegatedToName})
                    </span>
                  ) : null}
                </p>
              ) : null}

              {approval.note ? (
                <p className="mt-1.5 text-caption text-on-surface-variant">
                  {approval.note}
                </p>
              ) : null}

              <p className="mt-1.5 text-caption text-tertiary">
                {approval.decidedAt
                  ? `Keputusan ${formatDateTime(approval.decidedAt)}`
                  : "Menunggu keputusan approver"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
