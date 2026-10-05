import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header, PageHeader } from "@/components/layout/header";
import { NotificationList } from "@/components/ui/notification-list";
import { listNotifications } from "@/lib/api/notification";
import { requireBookingManager } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Dinas Travel" };

export default async function NotificationsPage() {
  const user = await requireBookingManager();
  const notifications = await listNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Notifikasi" },
        ]}
        unreadCount={unreadCount}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Notifikasi"
          description="Pemberitahuan approval, booking, dan reimbursement. Membuka notifikasi menandainya sebagai dibaca dan mengikuti tautan terkait."
        />

        <Card>
          {notifications.length ? (
            <NotificationList notifications={notifications} role={user.role} />
          ) : (
            <EmptyState
              icon="notifications_none"
              title="Tidak ada notifikasi"
              description="Kabar approval, konfirmasi supplier, dan pengingat SLA akan muncul di sini."
            />
          )}
        </Card>
      </main>
    </div>
  );
}
