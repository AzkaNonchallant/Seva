import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header, PageHeader } from "@/components/layout/header";
import { getUnreadCount } from "@/lib/api/notification";
import { loadTravelsWithBookings } from "@/lib/api/report";
import { getTravelDocuments } from "@/lib/api/travel";
import { requireBookingManager } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

import type { TravelDocument } from "@/lib/api/types";

export const metadata = { title: "Dokumen • Dinas Travel" };

export default async function DocumentsPage() {
  await requireBookingManager();
  const [unread, travels] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    loadTravelsWithBookings(),
  ]);

  // Documents hang off a travel request, so the index is built by walking the
  // requests rather than by an endpoint of its own.
  const rows = await Promise.all(
    travels
      .filter(({ bookings }) => bookings.length > 0)
      .map(async ({ travel }) => {
        const documents = await getTravelDocuments(travel.id).catch(() => []);
        return { travel, documents };
      }),
  );

  const withDocs = rows.filter((row) => row.documents.length > 0);

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Dokumen" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Dokumen Pengajuan"
          description="Berkas pendukung yang diunggah pemohon, dikumpulkan dari setiap travel yang sudah memiliki booking. Dipakai saat memverifikasi reimburse."
        />

        {withDocs.length ? (
          <ul className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {withDocs.map(({ travel, documents }) => (
              <li key={travel.id}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 p-md">
                    <div className="min-w-0">
                      <p className="font-mono text-caption font-semibold text-primary">
                        {travel.ref}
                      </p>
                      <p className="mt-0.5 truncate text-body-md font-semibold text-on-surface">
                        {travel.destination}
                      </p>
                      <p className="truncate text-caption text-tertiary">
                        {travel.employeeName} • {travel.departmentName}
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-outline-variant/10">
                    {documents.map((doc: TravelDocument) => (
                      <li key={doc.id} className="flex items-center gap-3 p-md">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            description
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-md font-medium text-on-surface">
                            {doc.fileName}
                          </p>
                          <p className="text-caption text-tertiary">
                            {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <span className="rounded-md bg-primary-fixed px-2 py-1 text-caption font-medium text-on-primary-fixed">
                          {doc.filePath.split(".").pop()?.toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon="folder_open"
              title="Belum ada dokumen"
              description="Travel yang sudah dibooking akan menampilkan berkas pendukung di sini. Pengajuan tier 1 biasanya tidak memerlukannya."
            />
          </Card>
        )}
      </main>
    </div>
  );
}
