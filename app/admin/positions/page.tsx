import {
  deletePositionAction,
  savePositionAction,
} from "@/app/actions/master-data-actions";
import { NamedListEditor } from "@/components/admin/named-list-editor";
import { Header, PageHeader } from "@/components/layout/header";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { listPositions } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Jabatan • Super Admin" };

/** §2 positions — same read/write split as departments. */
export default async function PositionsPage() {
  await requireSuperAdmin();

  const unread = await getUnreadCount().catch(() => ({ count: 0 }));
  const positions = await settle(listPositions());

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Jabatan" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Jabatan"
          description="Daftar jabatan yang menentukan kebijakan perjalanan yang berlaku pada setiap pengguna. Sumber data: /api/users/positions."
        />

        {!positions.ok ? (
          <ErrorState error={positions.error} />
        ) : (
          <NamedListEditor
            title="Daftar Jabatan"
            description="Jabatan yang masih dipakai pengguna tidak dapat dihapus. Menghapus jabatan tidak mengubah travel policy yang sudah terlampir pada pengajuan berjalan."
            rows={positions.data}
            emptyTitle="Belum ada jabatan"
            emptyDescription="Tambahkan jabatan pertama agar pengguna dapat ditugaskan ke posisi yang benar."
            nameLabel="Nama jabatan"
            namePlaceholder="Contoh: Legal Officer"
            saveAction={savePositionAction}
            deleteAction={deletePositionAction}
          />
        )}
      </main>
    </>
  );
}
