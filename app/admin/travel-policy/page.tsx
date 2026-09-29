import { PolicyManager } from "@/components/admin/policy-manager";
import { Header, PageHeader } from "@/components/layout/header";
import { SummaryCard } from "@/components/ui/summary-card";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { listPolicies } from "@/lib/api/travel";
import { listPositions } from "@/lib/api/user";
import { settle } from "@/lib/api/api";
import { requireSuperAdmin } from "@/lib/auth";

export const metadata = { title: "Travel Policy • Super Admin" };

/**
 * §3 travel policy. Reads come from GET /api/travel/policies and every write
 * goes through the Super Admin-only POST/PUT/DELETE on the same path.
 */
export default async function TravelPolicyPage() {
  await requireSuperAdmin();

  const [unread, policies, positions] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listPolicies()),
    listPositions().catch(() => []),
  ]);

  if (!policies.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Super Admin", href: "/admin/dashboard" },
            { label: "Travel Policy" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/admin/notifications"
          profileHref="/admin/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={policies.error} />
        </main>
      </>
    );
  }

  const policyRows = policies.data;
  const active = policyRows.filter((policy) => policy.isActive);
  const capped = active.filter((policy) => policy.maxEstimatedCost);
  const withDocs = active.filter((policy) => policy.requiresDocuments);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Super Admin", href: "/admin/dashboard" },
          { label: "Travel Policy" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/admin/notifications"
        profileHref="/admin/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Travel Policy"
          description="Aturan perjalanan dinas yang berlaku untuk seluruh perusahaan. Policy aktif dipakai form pengajuan employee melalui GET /api/travel/policies/applicable, yang menyaring berdasarkan jabatan dan tingkat tujuan."
        />

        <section
          aria-label="Ringkasan kebijakan"
          className="grid grid-cols-1 gap-md sm:grid-cols-3"
        >
          <SummaryCard
            label="Policy Aktif"
            value={active.length}
            icon="policy"
            tone="success"
            footnote={`${policyRows.length} total kebijakan`}
          />
          <SummaryCard
            label="Dengan Batas Nominal"
            value={capped.length}
            icon="payments"
            tone="primary"
            footnote="Batas perkiraan biaya"
          />
          <SummaryCard
            label="Wajib Dokumen"
            value={withDocs.length}
            icon="attach_file"
            tone="accent"
            footnote="Memerlukan lampiran saat mengajukan"
          />
        </section>

        <PolicyManager policies={policyRows} positions={positions} />
      </main>
    </>
  );
}
