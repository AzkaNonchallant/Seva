import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Finance" };

export default async function FinanceNotificationsPage() {
  await requireRole(["FINANCE"]);
  return (
    <NotificationsPage
      areaLabel="Finance"
      homeHref="/finance/dashboard"
      profileHref="/finance/profile"
      description="Pemberitahuan reimbursement yang menunggu verifikasi Anda."
    />
  );
}
