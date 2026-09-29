import { RoleShell } from "@/components/layout/role-shell";
import { listPendingBookings } from "@/lib/api/booking";
import { requireBookingManager } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";

/**
 * Shell for the Admin Travel area. API_SPEC names this role `ADMIN`; the
 * sidebar says "Admin Travel" purely as the UI label for it.
 *
 * The chrome itself lives in `RoleShell`, shared with the Super Admin and
 * Employee areas; this file only declares who may enter and what the
 * navigation contains.
 */
export default async function TravelAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireBookingManager();

  // The queue badge drives the sidebar count. A failure here must not take
  // down the whole shell, so it degrades to an unbadged nav rather than an
  // error page.
  const queue = await listPendingBookings().catch(() => []);

  const items = [
    { href: "/travel-admin/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      href: "/travel-admin/bookings/queue",
      label: "Antrean Booking",
      icon: "pending_actions",
      badge: queue.length,
    },
    { href: "/travel-admin/bookings", label: "Kelola Booking", icon: "confirmation_number" },
    { href: "/travel-admin/departures", label: "Keberangkatan", icon: "flight" },
    { href: "/travel-admin/requests", label: "Travel Request", icon: "assignment" },
    { href: "/travel-admin/policy", label: "Travel Policy", icon: "policy" },
    { href: "/travel-admin/reports", label: "Laporan", icon: "analytics" },
    { href: "/travel-admin/documents", label: "Dokumen", icon: "folder" },
    { href: "/travel-admin/notifications", label: "Notifikasi", icon: "notifications" },
    { href: "/travel-admin/profile", label: "Profil", icon: "account_circle" },
  ];

  return (
    <RoleShell
      user={user}
      roleLabel={ROLE_LABEL[user.role]}
      items={items}
      roleCaption="Role ADMIN • Booking & keberangkatan"
      operationalPaths={[
        "/travel-admin/dashboard",
        "/travel-admin/bookings/queue",
        "/travel-admin/bookings",
        "/travel-admin/departures",
      ]}
      homePath="/travel-admin/dashboard"
    >
      {children}
    </RoleShell>
  );
}
