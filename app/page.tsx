import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

/** Entry point: send the visitor to their role's home, or to the login page. */
export default async function RootPage() {
  const user = await getSession();
  redirect(user ? (ROLE_HOME[user.role] ?? "/login") : "/login");
}
