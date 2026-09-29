import { ProfilePage } from "@/components/shared/profile-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Profil • Employee" };

/** §8 for EMPLOYEE. */
const SCOPE = [
  "Membuat dan mengajukan pengajuan travel dinas",
  "Mengunggah dokumen pendukung pada pengajuannya",
  "Melacak approval Manager, Kepala Departemen, dan Finance atas pengajuannya",
  "Membuat serta mengajukan reimbursement atas travel yang selesai",
];

export default async function EmployeeProfilePage() {
  const user = await requireRole(["EMPLOYEE"]);
  return (
    <ProfilePage
      sessionUser={user}
      areaLabel="Employee"
      homeHref="/employee/dashboard"
      notificationsHref="/employee/notifications"
      scope={SCOPE}
    />
  );
}
