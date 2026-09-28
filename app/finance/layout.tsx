import { requireRole } from "@/lib/auth";

/** Auth gate for the finance segment. */
export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["FINANCE"]);
  return children;
}
