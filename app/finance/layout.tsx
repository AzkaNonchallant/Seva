import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

/**
 * Shell for the Finance area.
 *
 * Finance used to render a bare breadcrumb header with no navigation and no
 * visible identity, which made it the odd one out next to the Super Admin,
 * Employee and Admin Travel areas. The chrome is the same `RoleShell` those
 * three use; only the entries differ.
 */
export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["FINANCE"]);

  const items = [
    { href: "/finance/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/finance/reimbursements", label: "Reimbursement", icon: "receipt_long" },
    { href: "/finance/payments", label: "Pembayaran", icon: "payments" },
    { href: "/finance/advances", label: "Uang Muka", icon: "savings" },
    { href: "/finance/reports", label: "Laporan", icon: "analytics" },
    { href: "/finance/notifications", label: "Notifikasi", icon: "notifications" },
    { href: "/finance/profile", label: "Profil", icon: "account_circle" },
  ];

  return (
    <RoleShell
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      items={items}
      roleCaption="Role FINANCE • Verifikasi & pembayaran"
      operationalPaths={[
        "/finance/dashboard",
        "/finance/reimbursements",
        "/finance/payments",
        "/finance/advances",
      ]}
      homePath="/finance/dashboard"
    >
      {children}
    </RoleShell>
  );
}
