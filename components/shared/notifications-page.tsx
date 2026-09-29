import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Header, PageHeader } from "@/components/layout/header";
import { NotificationList } from "@/components/ui/notification-list";
import { listNotifications } from "@/lib/api/notification";
import { settle } from "@/lib/api/api";

/**
 * The notification inbox, shared by every role area.
 *
 * The page body is identical across roles — §6 scopes the rows to the caller —
 * so only the breadcrumb, the header links, and the copy differ. Keeping this in
 * one place is what stops the three areas from drifting apart.
 */
export async function NotificationsPage({
  areaLabel,
  homeHref,
  profileHref,
  description,
}: {
  areaLabel: string;
  homeHref: string;
  profileHref: string;
  description: string;
}) {
  const notifications = await settle(listNotifications());

  if (!notifications.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: areaLabel, href: homeHref },
            { label: "Notifikasi" },
          ]}
          unreadCount={0}
          notificationsHref={homeHref.replace(/\/[^/]*$/, "/notifications")}
          profileHref={profileHref}
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <PageHeader title="Notifikasi" description={description} />
          <ErrorState error={notifications.error} />
        </main>
      </>
    );
  }

  const rows = notifications.data;
  const unreadCount = rows.filter((row) => !row.isRead).length;

  return (
    <>
      <Header
        breadcrumb={[
          { label: areaLabel, href: homeHref },
          { label: "Notifikasi" },
        ]}
        unreadCount={unreadCount}
        notificationsHref={`${homeHref.replace(/\/dashboard$/, "")}/notifications`}
        profileHref={profileHref}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader title="Notifikasi" description={description} />

        <Card>
          {rows.length ? (
            <NotificationList notifications={rows} />
          ) : (
            <EmptyState
              icon="notifications_none"
              title="Tidak ada notifikasi"
              description="Pemberitahuan approval, booking, dan reimbursement akan muncul di sini."
            />
          )}
        </Card>
      </main>
    </>
  );
}
