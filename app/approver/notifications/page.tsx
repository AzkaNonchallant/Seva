import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";

export const metadata = { title: "Notifikasi • Approver" };

export default async function ApproverNotificationsPage() {
  const user = await requireRole(APPROVER_ROLES);

  return (
    <NotificationsPage
      userRole={user.role}
      areaLabel="Approver"
      homeHref="/approver/dashboard"
      profileHref="/approver/profile"
      description="Pemberitahuan saat ada pengajuan dinas yang menunggu keputusan Anda. Sesuai API_SPEC bagian 6, notifikasi hanya terlihat oleh pemiliknya."
    />
  );
}
