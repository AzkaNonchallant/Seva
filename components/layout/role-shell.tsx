import { logoutAction } from "@/app/actions/auth-actions";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { ToastHost } from "@/components/ui/toast-host";
import { initials } from "@/lib/utils";

import type { User } from "@/lib/api/types";

/**
 * Chrome shared by every authenticated role area.
 *
 * `app/travel-admin/layout.tsx` is the reference implementation of this
 * arrangement — fixed sidebar, `lg:pl-72` content offset, a compact logout bar
 * for viewports below `lg`, and the toast host. Extracting it here lets the
 * Super Admin and Employee areas use the identical shell instead of a
 * parallel design, which is what keeps the three areas looking like one
 * application.
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
    <div className="min-h-screen">
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

      <div className="lg:pl-72">
          <div className="flex items-center justify-end border-b border-white/10 bg-primary px-margin-mobile py-2 lg:hidden">
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

        {children}
      </div>

      <ToastHost />
    </div>
  );
}
