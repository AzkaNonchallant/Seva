import { ProfilePage } from "@/components/shared/profile-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Profil • Finance" };

/** §8 for FINANCE. */
const SCOPE = [
  "Memverifikasi reimbursement melalui PATCH /api/reimbursements/:id/verify",
  "Menandai reimbursement lunas melalui PATCH /api/reimbursements/:id/pay",
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
