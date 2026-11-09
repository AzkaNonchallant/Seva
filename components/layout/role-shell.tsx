import { logoutAction } from "@/app/actions/auth-actions";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { ToastHost } from "@/components/ui/toast-host";
import { initials } from "@/lib/utils";

import type { User } from "@/lib/api/types";

/**
 * Chrome shared by every authenticated role area.
 *
 * The reference in design/referensi.png puts the dashboard on one white rounded
 * panel and floats the purple rail beside it. Reproducing that here keeps the
 * Super Admin, Finance, Employee and Approver areas identical: the rail is
 * fixed, the panel starts 116px in (84px rail + 16px gap + 16px window inset)
 * and every screen inside inherits the same canvas.
 */
export function RoleShell({
  user,
  roleLabel,
  items,
  roleCaption,
  operationalPaths,
  homePath,
  children,
}: {
  user: User;
  roleLabel: string;
  items: NavItem[];
  roleCaption: string;
  operationalPaths?: string[];
  homePath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        items={items}
        userName={user.name}
        userRole={roleLabel}
        userInitials={initials(user.name)}
        roleCaption={roleCaption}
        operationalPaths={operationalPaths}
        homePath={homePath}
        logoutAction={logoutAction}
      />

      <div className="lg:pb-4 lg:pl-[116px] lg:pr-4 lg:pt-4">
        <div className="sticky top-0 z-20 flex items-center justify-end bg-brand px-margin-mobile py-2 lg:hidden">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium text-white transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                logout
              </span>
              Keluar
            </button>
          </form>
        </div>

        <div className="role-frame bg-surface-container-low lg:min-h-[calc(100vh-32px)] lg:rounded-[32px] lg:shadow-ambient">
          {children}
        </div>
      </div>

      <ToastHost />
    </div>
  );
}
