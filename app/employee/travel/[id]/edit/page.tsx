import { notFound } from "next/navigation";

import { TravelForm } from "@/components/travel/travel-form";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardBody } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravel, listApplicablePolicies } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { isNotFound } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Ubah Draft • Employee" };

/**
 * §3 allows PATCH only while the request is still DRAFT, so this screen refuses
 * to render for any other status rather than offering a form the server would
 * reject.
 */
export default async function EditTravelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["EMPLOYEE"]);
  const { id } = await params;
  const travelId = Number(id);

  const [unread, travel, policies] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(getTravel(travelId)),
    user.positionId
      ? listApplicablePolicies(user.positionId).catch(() => [])
      : Promise.resolve([]),
  ]);

  if (!travel.ok) {
    if (isNotFound(travel.error)) notFound();
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Pengajuan Travel", href: "/employee/travel" },
            { label: "Ubah Draft" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={travel.error} />
        </main>
      </>
    );
  }

  const request = travel.data;

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Pengajuan Travel", href: "/employee/travel" },
          { label: `#${request.id}` },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex max-w-3xl flex-col gap-md px-margin-mobile py-md md:px-md">
        <PageHeader
          title="Ubah Draft"
          description={
            request.status === "DRAFT"
              ? "Perubahan disimpan pada draft yang sama dan belum mengirim ulang ke atasan."
              : `Pengajuan ini berstatus ${request.status}, sehingga tidak dapat diubah.`
          }
        />

        {request.status === "DRAFT" ? (
          <Card>
            <CardBody>
              <TravelForm travel={request} policies={policies} />
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <p className="text-body-md text-on-surface-variant">
                Pengajuan yang sudah dikirim tidak dapat diedit. Batalkan
                pengajuan bila perubahan diperlukan, lalu buat pengajuan baru.
              </p>
            </CardBody>
          </Card>
        )}
      </main>
    </>
  );
}
