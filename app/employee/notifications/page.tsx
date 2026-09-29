import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Employee" };

export default async function EmployeeNotificationsPage() {
  await requireRole(["EMPLOYEE"]);
  return (
    <NotificationsPage
      areaLabel="Employee"
      homeHref="/employee/dashboard"
      profileHref="/employee/profile"
      description="Pemberitahuan hasil approval pengajuan travel dan status reimbursement Anda. Sesuai API_SPEC bagian 6, notifikasi hanya terlihat oleh pemiliknya."
    />
  );
}
