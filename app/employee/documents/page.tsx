import Link from "next/link";

import { Header, PageHeader } from "@/components/layout/header";
import { TravelStatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getUnreadCount } from "@/lib/api/notification";
import { getTravelDocuments, listTravels } from "@/lib/api/travel";
import { settle } from "@/lib/api/api";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

import type { TravelDocument, TravelRequest } from "@/lib/api/types";

export const metadata = { title: "Dokumen • Employee" };

type Row = { travel: TravelRequest; documents: TravelDocument[] };

/**
 * Every attachment across the employee's own requests.
 *
 * The spec has no "list all my documents" endpoint, so this composes the two it
 * does publish: `GET /api/travel` for the requests, then
 * `GET /api/travel/:id/documents` per request. The N+1 shape is the same trade
 * the Admin Travel report helper already makes, and it lives in one place here.
 */
export default async function EmployeeDocumentsPage() {
  await requireRole(["EMPLOYEE"]);

  const [unread, travels] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    settle(listTravels()),
  ]);

  if (!travels.ok) {
    return (
      <>
        <Header
          breadcrumb={[
            { label: "Employee", href: "/employee/dashboard" },
            { label: "Dokumen" },
          ]}
          unreadCount={unread.count}
          notificationsHref="/employee/notifications"
          profileHref="/employee/profile"
        />
        <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
          <ErrorState error={travels.error} />
        </main>
      </>
    );
  }

  const settled = travels.data.filter((travel) => travel.status !== "DRAFT");
  const rows: Row[] = await Promise.all(
    settled.map(async (travel) => ({
      travel,
      documents: await getTravelDocuments(travel.id).catch(() => []),
    })),
  );

  const withDocuments = rows.filter((row) => row.documents.length);
  const total = rows.reduce((sum, row) => sum + row.documents.length, 0);

  return (
    <>
      <Header
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Dokumen" },
        ]}
        unreadCount={unread.count}
        notificationsHref="/employee/notifications"
        profileHref="/employee/profile"
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Dokumen"
          description="Seluruh lampiran pendukung pada pengajuan Anda. Unggah dan hapus dokumen dilakukan dari halaman detail tiap pengajuan."
        />

        {withDocuments.length ? (
          <ul className="flex flex-col gap-md">
            {withDocuments.map(({ travel, documents }) => (
              <li key={travel.id}>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 p-md">
                    <div className="min-w-0">
                      <p className="font-mono text-caption text-tertiary">
                        #{travel.id}
                      </p>
                      <Link
                        href={`/employee/travel/${travel.id}`}
                        className="truncate text-label-md font-semibold text-primary transition-colors hover:text-primary-container"
                      >
                        {travel.destination}
                      </Link>
                    </div>
                    <TravelStatusBadge status={travel.status} />
                  </div>
                  <ul className="flex flex-col divide-y divide-outline-variant/15">
                    {documents.map((document) => (
                      <li key={document.id} className="flex items-center gap-3 px-md py-2.5">
                        <span
                          className="material-symbols-outlined shrink-0 text-primary"
                          style={{ fontSize: 20 }}
                        >
                          description
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-md text-on-surface">
                            {document.fileName}
                          </span>
                          <span className="block truncate font-mono text-caption text-tertiary">
                            {document.filePath}
                          </span>
                        </span>
                        <span className="shrink-0 text-caption text-tertiary">
                          {formatDate(document.uploadedAt ?? "")}
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
              description={
                settled.length
                  ? "Lampiran pendukung diunggah dari halaman detail pengajuan yang memerlukan dokumen."
                  : "Kirimkan satu pengajuan terlebih dahulu, lalu lampirkan dokumen pendukungnya."
              }
              action={
                <Link
                  href="/employee/travel"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-md text-label-md font-semibold text-on-primary"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    flight_takeoff
                  </span>
                  Lihat Pengajuan
                </Link>
              }
            />
          </Card>
        )}

        <p className="text-caption text-tertiary">
          {total} dokumen pada {withDocuments.length} pengajuan.
        </p>
      </main>
    </>
  );
}
