import { Sidebar } from "@/components/layout/sidebar";
import { ToastHost } from "@/components/ui/toast-host";
import { logoutAction } from "@/app/actions/auth-actions";
import { listPendingBookings } from "@/lib/api/booking";
import { requireBookingManager } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { initials } from "@/lib/utils";

/**
 * Shell for the Admin Travel area. API_SPEC names this role `ADMIN`; the
 * sidebar says "Admin Travel" purely as the UI label for it.
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
    <div className="min-h-screen">
      <Sidebar
        items={items}
        userName={user.name}
        userRole={ROLE_LABEL[user.role]}
        userInitials={initials(user.name)}
      />

      <div className="lg:pl-72">
        <div className="flex items-center justify-end border-b border-outline-variant/20 bg-surface-container-lowest px-margin-mobile py-2 lg:hidden">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                logout
              </span>
              Keluar
            </button>
          </form>
        </div>

        {children}
      </div>

      <ToastHost />
    </div>
  );
}
