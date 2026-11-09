import { ProfilePage } from "@/components/shared/profile-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Profil • Finance" };

/** §8 for FINANCE. */
const SCOPE = [
  "Memverifikasi reimbursement",
  "Menandai reimbursement sebagai lunas",
  "Membaca laporan pengeluaran per departemen, karyawan, dan project",
];

export default async function FinanceProfilePage() {
  const user = await requireRole(["FINANCE"]);
  return (
    <ProfilePage
      sessionUser={user}
      areaLabel="Finance"
      homeHref="/finance/dashboard"
      notificationsHref="/finance/notifications"
      scope={SCOPE}
    />
  );
}
