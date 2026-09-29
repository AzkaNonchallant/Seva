import Link from "next/link";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

/**
 * Placeholder for a screen whose API does not exist yet.
 *
 * API_SPEC section 9 lists audit logs as needing `GET /api/audit-logs` and notes
 * it was never built. Rather than fabricate an endpoint or leave the old
 * "outside implementation scope" text, this states which endpoint is missing and
 * what the screen would show — so the gap is visible in the product, not just in
 * a comment.
 */
export function BackendRequiredNotice({
  areaLabel,
  homeHref,
  title,
  description,
  missingEndpoint,
  plannedContent,
  backHref,
  backLabel,
}: {
  areaLabel: string;
  homeHref: string;
  title: string;
  description: string;
  /** The call API_SPEC would have to publish first. */
  missingEndpoint: string;
  plannedContent: string[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <>
      <Header
        breadcrumb={[
          { label: areaLabel, href: homeHref },
          { label: title },
        ]}
        unreadCount={0}
        notificationsHref={`${homeHref.replace(/\/dashboard$/, "")}/notifications`}
        profileHref={`${homeHref.replace(/\/dashboard$/, "")}/profile`}
      />

      <main className="flex max-w-3xl flex-col gap-md px-margin-mobile py-md md:px-md">
        <PageHeader title={title} description={description} />

        <Card>
          <CardHeader
            title="Menunggu Dukungan Backend"
            description="Layar ini belum dapat berfungsi penuh karena endpoint-nya belum ada di API_SPEC."
          />
          <CardBody className="flex flex-col gap-md">
            <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-md">
              <p className="text-caption text-tertiary">Endpoint yang dibutuhkan</p>
              <code className="mt-1 block font-mono text-body-md text-on-surface">
                {missingEndpoint}
              </code>
            </div>

            <div>
              <p className="text-label-md font-semibold text-on-surface">
                Yang akan ditampilkan setelah endpoint tersedia
              </p>
              <ul className="mt-2 space-y-2">
                {plannedContent.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined mt-px shrink-0 text-outline"
                      style={{ fontSize: 16 }}
                    >
                      radio_button_unchecked
                    </span>
                    <span className="text-body-md text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                href={backHref}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-md text-label-md font-semibold text-primary transition-colors hover:bg-primary-fixed/40"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_back
                </span>
                {backLabel}
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
