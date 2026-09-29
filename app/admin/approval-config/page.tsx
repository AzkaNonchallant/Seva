import { BackendRequiredNotice } from "@/components/shared/backend-required-notice";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Konfigurasi Approval • Super Admin" };

/**
 * §3 fixes the approval chain implicitly — submitting a request "generate baris
 * Approval per level" — but publishes no endpoint to read or edit that chain.
 * Configuring it would require a contract that does not exist yet.
 */
export default async function ApprovalConfigPage() {
  await requireSuperAdmin();

  return (
    <BackendRequiredNotice
      areaLabel="Super Admin"
      homeHref="/admin/dashboard"
      title="Konfigurasi Approval"
      description="Urutan level persetujuan dan aturan yang menentukan siapa menyetujui pengajuan."
      missingEndpoint="GET / PATCH /api/approval-config"
      plannedContent={[
        "Urutan level persetujuan per jabatan dan tingkat tujuan",
        "Rules eskalasi otomatis bila level pertama belum merespons",
        "Jumlah approver yang diperlukan pada setiap level",
      ]}
      backHref="/admin/dashboard"
      backLabel="Kembali ke Dashboard"
    />
  );
}
