import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

/**
 * Auth gate for the employee segment. The pages themselves stay unguarded so a
 * screen can be worked on independently, but nothing under /employee renders
 * without an EMPLOYEE session.
 */
export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["EMPLOYEE"]);

  const items = [
    { href: "/employee/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/employee/travel", label: "Pengajuan Travel", icon: "flight_takeoff" },
    { href: "/employee/reimbursements", label: "Reimbursement", icon: "receipt_long" },
    { href: "/employee/documents", label: "Dokumen", icon: "folder" },
    { href: "/employee/notifications", label: "Notifikasi", icon: "notifications" },
    { href: "/employee/profile", label: "Profil", icon: "account_circle" },
  ];

  return (
    <RoleShell
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      items={items}
      roleCaption={`Role ${user.role} • Pengajuan & reimbursement`}
      homePath="/employee/dashboard"
    >
      {children}
    </RoleShell>
  );
}
