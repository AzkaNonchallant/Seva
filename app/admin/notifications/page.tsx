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
      description="Pemberitahuan yang ditujukan untuk akun Anda. Sesuai API_SPEC bagian 6, notifikasi approval dan reimbursement hanya terlihat oleh pemiliknya masing-masing."
    />
  );
}
