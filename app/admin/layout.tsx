import { requireRole } from "@/lib/auth";

/**
 * Auth gate for the Super Admin segment. API_SPEC section 8 gives SUPER_ADMIN
 * master data (users, departments, positions, policy), so this group is
 * closed to every other role including ADMIN, whose area is /travel-admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN"]);
  return children;
}
