import { ProfilePage } from "@/components/shared/profile-page";
import { requireRole } from "@/lib/auth";
import { APPROVER_ROLES } from "@/lib/permissions";

export const metadata = { title: "Profil • Approver" };

/** §8 for MANAGER / DEPARTMENT_HEAD / HRD: "Approve/reject di levelnya, kelola delegasi". */
const SCOPE = [
  "Melihat pengajuan travel yang menunggu persetujuan pada tingkat kewenangannya",
  "Menyetujui atau menolak pengajuan pada tingkat tersebut",
  "Menerima kewenangan persetujuan melalui delegasi yang masih berlaku",
  "Menerima notifikasi saat ada pengajuan yang menunggu keputusan",
];

export default async function ApproverProfilePage() {
  const user = await requireRole(APPROVER_ROLES);

  return (
    <ProfilePage
      sessionUser={user}
      areaLabel="Approver"
      homeHref="/approver/dashboard"
      notificationsHref="/approver/notifications"
      scope={SCOPE}
    />
  );
}
