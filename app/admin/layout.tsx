import { RoleShell } from "@/components/layout/role-shell";
import { requireSuperAdmin } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

/**
 * Super Admin shell.
 *
 * The gate runs here, so every route under /admin requires a SUPER_ADMIN
 * session before any page renders. Navigation is master data only: booking
 * operations stay in the Admin Travel area even though the spec's §8 lets
 * SUPER_ADMIN read all data.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  const items = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/users", label: "Pengguna", icon: "group" },
    {
      href: "/admin/roles-permissions",
      label: "Role & Izin",
      icon: "admin_panel_settings",
    },
    { href: "/admin/departments", label: "Departemen", icon: "corporate_fare" },
    { href: "/admin/positions", label: "Jabatan", icon: "badge" },
    { href: "/admin/travel-policy", label: "Travel Policy", icon: "policy" },
    {
      href: "/admin/notifications",
      label: "Notifikasi",
      icon: "notifications",
    },
    { href: "/admin/profile", label: "Profil", icon: "account_circle" },
  ];

  return (
    <RoleShell
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      items={items}
      roleCaption={`Role ${user.role} • Master data & konfigurasi`}
      homePath="/admin/dashboard"
    >
      {children}
    </RoleShell>
  );
}
