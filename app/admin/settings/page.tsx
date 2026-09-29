import { BackendRequiredNotice } from "@/components/shared/backend-required-notice";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Pengaturan • Super Admin" };

/**
 * No system-settings endpoint exists in API_SPEC — §2 covers users, departments
 * and positions, §3 travel policy, and nothing else that is writable at system
 * level. Preferences that are genuinely per-user are not in the contract either,
 * so there is nothing to build against.
 */
export default async function SettingsPage() {
  await requireSuperAdmin();

  return (
    <BackendRequiredNotice
      areaLabel="Super Admin"
      homeHref="/admin/dashboard"
      title="Pengaturan Sistem"
      description="Preferensi tingkat perusahaan, seperti ambang persetujuan, mata uang default, dan masa berlaku sesi."
      missingEndpoint="GET / PATCH /api/settings"
      plannedContent={[
        "Ambang nilai yang memaksa approval tambahan",
        "Masa berlaku sesi dan kebijakan kata sandi",
        "Konfigurasi notifikasi per jenis peristiwa",
      ]}
      backHref="/admin/dashboard"
      backLabel="Kembali ke Dashboard"
    />
  );
}
