import { RoleShell } from "@/components/layout/role-shell";
import { listPendingApprovals } from "@/lib/api/approval";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES, ROLE_LABEL } from "@/lib/permissions";

/**
 * Shell for the approval area. MANAGER, DEPARTMENT_HEAD and HRD share these
 * routes because the backend gives all three the same approval rights and the
 * same landing page — ROLE_HOME maps each of them to /approver/dashboard.
 */
export default async function ApproverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(APPROVER_ROLES);

  // The queue count drives the sidebar badge. A failure here must not take down
  // the whole shell, so it degrades to an unbadged nav rather than an error page.
  const pending = await listPendingApprovals().catch(() => []);

  const items = [
    { href: "/approver/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      href: "/approver/approvals",
      label: "Persetujuan",
      icon: "fact_check",
      badge: pending.length,
    },
    { href: "/approver/notifications", label: "Notifikasi", icon: "notifications" },
    { href: "/approver/profile", label: "Profil", icon: "account_circle" },
  ];

  return (
    <RoleShell
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      items={items}
      roleCaption={`Role ${user.role} • Persetujuan pengajuan`}
      homePath="/approver/dashboard"
    >
      {children}
    </RoleShell>
  );
}
