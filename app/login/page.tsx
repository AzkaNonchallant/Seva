import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { usesMockBackend } from "@/lib/api/api";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

export const metadata = { title: "Masuk • Horizon Odyssey" };

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(ROLE_HOME[user.role] ?? "/travel-admin/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile py-xl">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-secondary-fixed/30 blur-3xl" />
      </div>
      <div className="relative">
        <LoginForm mockMode={usesMockBackend()} />
      </div>
    </main>
  );
}
