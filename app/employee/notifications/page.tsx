import { NotificationsPage } from "@/components/shared/notifications-page";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Notifikasi • Employee" };

export default async function EmployeeNotificationsPage() {
  const user = await requireRole(["EMPLOYEE"]);
  return (
    <NotificationsPage
      userRole={user.role}
      areaLabel="Employee"
      homeHref="/employee/dashboard"
      profileHref="/employee/profile"
      description="Pemberitahuan hasil approval pengajuan travel dan status reimbursement Anda. Sesuai API_SPEC bagian 6, notifikasi hanya terlihat oleh pemiliknya."
    />
  );
}
