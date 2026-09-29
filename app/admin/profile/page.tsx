import { ProfilePage } from "@/components/shared/profile-page";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Profil • Super Admin" };

/** §8 for SUPER_ADMIN. */
const SCOPE = [
  "Mengelola seluruh master data: pengguna, departemen, jabatan, travel policy",
  "Menetapkan role setiap pengguna",
  "Membaca seluruh data pengajuan di seluruh perusahaan",
];

export default async function AdminProfilePage() {
  const user = await requireSuperAdmin();
  return (
    <ProfilePage
      sessionUser={user}
      areaLabel="Super Admin"
      homeHref="/admin/dashboard"
      notificationsHref="/admin/notifications"
      scope={SCOPE}
    />
  );
}
