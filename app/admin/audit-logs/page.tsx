import { BackendRequiredNotice } from "@/components/shared/backend-required-notice";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Audit Log • Super Admin" };

/**
 * API_SPEC section 9 names this module explicitly: audit logs "belum ada di
 * struktur folder terbaru" and would need `GET /api/audit-logs`, Super Admin
 * only. There is therefore no data to render, and inventing a call would
 * misrepresent the backend.
 */
export default async function AuditLogsPage() {
  await requireSuperAdmin();

  return (
    <BackendRequiredNotice
      areaLabel="Super Admin"
      homeHref="/admin/dashboard"
      title="Audit Log"
      description="Catatan perubahan pada master data dan keputusan approval."
      missingEndpoint="GET /api/audit-logs"
      plannedContent={[
        "Jejak perubahan master data: siapa mengubah apa dan kapan",
        "Riwayat penetapan role beserta alasan perubahan",
        "Filter berdasarkan aktor, jenis perubahan, dan rentang tanggal",
      ]}
      backHref="/admin/dashboard"
      backLabel="Kembali ke Dashboard"
    />
  );
}
