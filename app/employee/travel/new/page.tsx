import { TravelForm } from "@/components/travel/travel-form";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardBody } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { listApplicablePolicies } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Pengajuan Baru • Employee" };

/**
 * POST /api/travel creates a DRAFT, and §3's `applicable` policy endpoint is the
 * one the spec points at for filling this form, so the policy list is fetched
 * with the caller's position rather than the full catalogue.
 */
export default async function NewTravelPage() {
  const user = await requireRole(["EMPLOYEE"]);

  const [unread, policies] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    user.positionId
      ? settle(listApplicablePolicies(user.positionId))
      : settle(Promise.resolve([])),
  ]);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Pengajuan Travel", href: "/employee/travel" },
          { label: "Pengajuan Baru" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex max-w-3xl flex-col gap-md px-margin-mobile py-md md:px-md">
        <PageHeader
          title="Pengajuan Travel Baru"
          description="Pengajuan disimpan sebagai draft. Anda dapat mengedit, melampirkan dokumen, lalu mengirimnya ke atasan pada langkah berikutnya."
        />

        {!policies.ok ? (
          <ErrorState error={policies.error} />
        ) : (
          <Card>
            <CardBody>
              <TravelForm policies={policies.data} />
            </CardBody>
          </Card>
        )}
      </main>
    </>
  );
}
