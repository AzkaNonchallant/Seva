import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Super Admin" };

export default async function AdminNotificationsPage() {
  const user = await requireSuperAdmin();
  return (
    <NotificationsPage
      userRole={user.role}
      areaLabel="Super Admin"
      homeHref="/admin/dashboard"
      profileHref="/admin/profile"
      description="Pemberitahuan yang ditujukan untuk akun Anda."
    />
  );
}
