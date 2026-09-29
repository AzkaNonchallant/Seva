import {
  deleteDepartmentAction,
  saveDepartmentAction,
} from "@/app/actions/master-data-actions";
import { NamedListEditor } from "@/components/admin/named-list-editor";
import { Header, PageHeader } from "@/components/layout/header";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { listDepartments } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Departemen • Super Admin" };

/**
 * §2 master data. The spec gives every logged-in role the read and reserves
 * POST/PUT/DELETE for Super Admin, which is exactly what `saveDepartmentAction`
 * and `deleteDepartmentAction` re-check on the server.
 */
export default async function DepartmentsPage() {
  await requireSuperAdmin();

  const unread = await getUnreadCount().catch(() => ({ count: 0 }));
  const departments = await settle(listDepartments());

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Departemen" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Departemen"
          description="Struktur departemen PT Andrea. Dipakai sebagai filter pengajuan travel dan sebagai atribut pada setiap pengguna. Sumber data: /api/users/departments."
        />

        {!departments.ok ? (
          <ErrorState error={departments.error} />
        ) : (
          <NamedListEditor
            title="Daftar Departemen"
            description="Nama harus unik. Departemen yang masih dipakai pengguna tidak dapat dihapus."
            rows={departments.data}
            emptyTitle="Belum ada departemen"
            emptyDescription="Tambahkan departemen pertama untuk mulai mengelompokkan pengguna."
            nameLabel="Nama departemen"
            namePlaceholder="Contoh: Legal"
            saveAction={saveDepartmentAction}
            deleteAction={deleteDepartmentAction}
          />
        )}
      </main>
    </>
  );
}
