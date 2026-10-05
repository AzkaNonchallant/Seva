import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header, PageHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { getUnreadCount } from "@/lib/api/notification";
import { listPolicies } from "@/lib/api/travel";
import { listPositions } from "@/lib/api/user";
import { requireBookingManager } from "@/lib/auth";
import { formatIDR } from "@/lib/utils";

import type { TravelPolicy } from "@/lib/api/types";

export const metadata = { title: "Travel Policy • Dinas Travel" };

const TIER_LABEL: Record<string, string> = {
  TIER_1: "Tier 1 — Jabodetabek",
  TIER_2: "Tier 2 — Kota besar",
  TIER_3: "Tier 3 — Luar Jawa",
  INTERNATIONAL: "Internasional",
  ANY: "Semua tingkat",
};

export default async function PolicyPage() {
  await requireBookingManager();
  const [policies, unread, positions] = await Promise.all([
    listPolicies(),
    getUnreadCount().catch(() => ({ count: 0 })),
    listPositions().catch(() => []),
  ]);

  const positionLabel = (id: number | null) =>
    id ? (positions.find((p) => p.id === id)?.name ?? `Jabatan #${id}`) : "Semua jabatan";

  return (
    <div className="min-h-screen">
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Travel Policy" },
        ]}
        unreadCount={unread.count}
      />

      <main className="flex flex-col gap-md px-margin-mobile py-md md:px-md lg:px-margin-desktop">
        <PageHeader
          title="Travel Policy"
          description="Referensi read-only dari GET /api/travel/policies. Admin Travel memakai ini saat menilai estimasi pengajuan sebelum mengalokasikan budget, tetapi perubahan policy hanya dapat dilakukan Super Admin."
        />

        {policies.length ? (
          <ul className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {policies.map((policy) => (
              <li key={policy.id}>
                <PolicyCard policy={policy} positionLabel={positionLabel(policy.positionId)} />
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon="policy"
              title="Belum ada kebijakan aktif"
              description="Super Admin belum mendefinisikan kebijakan perjalanan yang dapat dipakai sebagai acuan."
            />
          </Card>
        )}
      </main>
    </div>
  );
}

function PolicyCard({
  policy,
  positionLabel,
}: {
  policy: TravelPolicy;
  positionLabel: string;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-outline-variant/15 p-md">
        <div className="min-w-0">
          <h2 className="text-body-lg font-semibold text-on-surface">
            {policy.name}
          </h2>
          <p className="mt-0.5 text-caption text-tertiary">{positionLabel}</p>
        </div>
        <Badge tone="primary" dot>
          {TIER_LABEL[policy.destinationTier] ?? policy.destinationTier}
        </Badge>
      </div>

      <CardBody className="flex flex-1 flex-col gap-md">
        {/* A policy is three per-component limits in the backend's model, not a
            single cap on the total estimate. */}
        <dl className="mt-auto space-y-2 border-t border-outline-variant/15 pt-3">
          {[
            ["Batas hotel", policy.hotelLimit],
            ["Batas transportasi", policy.transportLimit],
            ["Batas uang saku", policy.allowanceLimit],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-caption text-tertiary">{label}</dt>
              <dd className="text-caption font-semibold text-on-surface">
                {formatIDR(value as string)}
              </dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  );
}
