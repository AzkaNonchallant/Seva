import { requireRole } from "@/lib/auth";

/**
 * Auth gate for the employee segment. The pages themselves stay unguarded so
 * a screen can be worked on independently, but nothing under /employee
 * renders without an EMPLOYEE session.
 */
export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["EMPLOYEE"]);
  return children;
}
