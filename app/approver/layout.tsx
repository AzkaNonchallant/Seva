import { requireRole } from "@/lib/auth";

/**
 * Auth gate for the approver segment. MANAGER, DEPARTMENT_HEAD and HRD share
 * these routes because API_SPEC gives all three the same approval rights and
 * the same landing page (ROLE_HOME maps each to /approver/dashboard).
 */
export default async function ApproverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["MANAGER", "DEPARTMENT_HEAD", "HRD"]);
  return children;
}
