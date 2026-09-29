import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter, useRoute } from "expo-router";
import { useParams } from "react-navigation";

import { requireBookingManager } from "@/lib/auth";
import {
  getTravel,
  getTravelDocuments,
  getApprovalTimeline,
} from "@/lib/api";
import {
  TravelStatusBadge,
  formatDate,
  formatDateRange,
  formatIDR,
} from "@/components/ui/status-badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ApprovalTimeline } from "@/components/travel/approval-timeline";
import { BookingRow } from "@/components/booking/booking-row";

import type { PendingTravel } from "@/lib/api/booking";

export const metadata = { title: "Detail Travel Request • Dinas Travel" };

export default function TravelRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = await params;
  const travelId = Number(id);

  if (!Number.isFinite(travelId)) {
    // Not found - redirect
    router.replace("/travel-admin/requests");
    return null;
  }

  await requireBookingManager();

  const [travel, unread] = await useEffect(() => {
    const fetchData = async () => {
      const [travel, unread] = await Promise.all([
        getTravel(travelId),
        // getUnreadCount().catch(() => ({ count: 0 })),
      ]);
      return { travel, unread };
    };

    const result = fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelId]);

  // Load data properly
  useEffect(() => {
    const loadData = async () => {
      const [travel, unread] = await Promise.all([
        getTravel(travelId),
        // getUnreadCount().catch(() => ({ count: 0 })),
      ]);

      const [approvals, documents] = await Promise.all([
        getApprovalTimeline(travelId).catch(() => []),
        getTravelDocuments(travelId).catch(() => []),
      ]);

      // ...
    };
    loadData();
  }, [travelId]);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Travel Request", href: "/travel-admin/requests" },
          { label: travel?.ref ?? `#${travel?.id}` },
        ]}
        unreadCount={unread.count}
      />

      <ScrollView style={styles.scroll}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-caption text-tertiary">
                  {travel?.ref}
                </span>
                <TravelStatusBadge status={travel?.status} />
              </div>
              <h1 className="text-headline-lg-mobile font-semibold tracking-tight text-on-surface">
                {travel?.destination}
              </h1>
              <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
                {travel?.purpose}
              </p>
            </div>
            {travel?.status === "APPROVED" ? (
              <LinkButton
                href="/travel-admin/bookings/queue"
                variant="secondary"
                startIcon="add"
              >
                Buat Booking
              </LinkButton>
            ) : (
              <View style={styles.approvalNote}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  info
                </span>
                Booking hanya untuk pengajuan Disetujui
              </View>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader title="Detail Pengajuan">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-caption text-tertiary">Pemohon</dt>
                <dd className="mt-0.5 text-label-md font-medium text-on-surface">
                  {travel?.employeeName}
                </dd>
                <dt className="text-caption text-tertiary">Departemen</dt>
                <dd className="mt-0.5 text-label-md font-medium text-on-surface">
                  {travel?.departmentName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-tertiary">Periode</dt>
                <dd className="mt-0.5 text-label-md font-medium text-on-surface">
                  {formatDateRange(travel?.startDate, travel?.endDate)}
                </dd>
                <dt className="text-caption text-tertiary">Estimasi biaya</dt>
                <dd className="mt-0.5 text-label-md font-medium text-on-surface">
                  {formatIDR(travel?.estimatedCost)}
                </dd>
              </div>
            </dl>
          </CardHeader>

          {travel?.policyName ? (
            <div>
              <dt className="text-caption text-tertiary">Kebijakan</dt>
              <dd className="mt-0.5 text-label-md font-medium text-on-surface col-span-2">
                {travel?.policyName}
              </dd>
            </div>
          ) : null}

          <dt className="text-caption text-tertiary">Tingkat kota</dt>
          <dd className="mt-0.5 text-label-md font-medium text-on-surface">
            {travel?.destinationTier
              ? travel.destinationTier.includes("TIER_1")
                ? "Tier 1 — Jabodetabek"
                : travel.destinationTier.includes("TIER_2")
                  ? "Tier 2 — Kota besar"
                  : travel.destinationTier.includes("TIER_3")
                    ? "Tier 3 — Luar Jawa"
                    : travel.destinationTier.includes("INTERNATIONAL")
                      ? "Internasional"
                      : "—"
              : "—"}
          </dd>

          <dt className="text-caption text-tertiary">Diajukan</dt>
          <dd className="mt-0.5 text-label-md font-medium text-on-surface">
            {formatDate(travel?.submittedAt ?? travel?.createdAt)}
          </dd>
        </Card>

        <Card>
          <CardHeader title="Booking">
            {travel?.bookings?.length ? (
              <View>
                {travel.bookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    travel={travel}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="confirmation_number"
                title="Belum ada booking"
                description={
                  travel?.status === "APPROVED"
                    ? "Pengajuan ini sudah disetujui dan siap dipesan. Tambahkan tiket atau hotel melalui antrean booking."
                    : "Booking tidak dapat dibuat karena pengajuan belum berstatus Disetujui."
                }
              />
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader title="Alur Persetujuan">
            <ApprovalTimeline approvals={travel?.approvals ?? []} />
          </CardHeader>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scroll: {
    flexGrow: 1,
    padding: 16,
  },
  approvalNote: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});
