import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Finance" };

export default async function FinanceNotificationsPage() {
  const user = await requireRole(["FINANCE"]);
  return (
    <NotificationsPage
      userRole={user.role}
      areaLabel="Finance"
      homeHref="/finance/dashboard"
      profileHref="/finance/profile"
      description="Pemberitahuan reimbursement yang menunggu verifikasi Anda."
    />
  );
}
