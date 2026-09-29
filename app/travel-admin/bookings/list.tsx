import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSearchParams } from "@expo/router";

import { requireBookingManager } from "@/lib/auth";
import {
  loadBookingsWithTravel,
  summariseBookings,
  getDashboardReport,
} from "@/lib/api/report";
import {
  SummaryCard,
  formatIDR,
  formatIDRCompact,
} from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { BookingRow } from "@/components/booking/booking-row";
import { FilterTabs } from "@/components/data-table/filters";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/data-table/pagination";
import { daysUntil } from "@/lib/utils";

import type { Booking } from "@/lib/api/types";

export const metadata = { title: "Kelola Booking • Dinas Travel" };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const router = useRouter();
  await requireBookingManager();

  const [unread, allBookings] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    loadBookingsWithTravel(),
  ]);
  const { breakdown, confirmedValue } = summariseBookings(allBookings);

  const statusFilter = (searchParams?.status as "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED") ||
    "ALL";
  const typeFilter = searchParams?.type as "FLIGHT" | "HOTEL" | "TRAIN" | "TRANSPORT" | null;
  const query =
    typeof searchParams?.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  // Apply filters
  let filtered = allBookings;
  if (statusFilter !== "ALL" && statusFilter) {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }
  if (typeFilter) {
    filtered = filtered.filter((b) => b.type === typeFilter);
  }
  if (query) {
    filtered = filtered.filter((b) =>
      [b.referenceNumber, b.provider, b.travel.employeeName, b.travel.ref, b.destination]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.max(1, Math.min((searchParams?.page as number) || 1, totalPages));
  const slice = filtered.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    // Reset when filters change
  }, [statusFilter, typeFilter, query]);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Kelola Booking" },
        ]}
        unreadCount={unread.count}
      />

      <PageHeader
        title="Kelola Booking"
        description="Seluruh tiket dan hotel yang pernah dibuat untuk pengajuan dinas. Ubah status melalui PATCH /api/travel/bookings/:id/status — hanya Menunggu, Terkonfirmasi, dan Dibatalkan yang tersedia."
      />

      <View style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <FilterTabs<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">
            ariaLabel="Saring menurut status booking"
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
            options={[
              { value: "ALL", label: "Semua" },
              { value: "PENDING", label: "Menunggu" },
              { value: "CONFIRMED", label: "Terkonfirmasi" },
              { value: "CANCELLED", label: "Dibatalkan" },
            ]}
          />
          <FilterTabs<string>
            ariaLabel="Saring menurut jenis booking"
            value={typeFilter ?? "ALL"}
            onValueChange={(v) => setTypeFilter(v)}
            options={[
              { value: "ALL", label: "Semua jenis" },
              { value: "FLIGHT", label: "Penerbangan" },
              { value: "HOTEL", label: "Hotel" },
              { value: "TRAIN", label: "Kereta Api" },
              { value: "TRANSPORT", label: "Transportasi Darat" },
            ]}
          />
          <SearchBar
            placeholder="Cari PNR,(employee, atau kota..."
            value={typeof searchParams?.q === "string" ? searchParams.q : ""}
            onChangeText={(text) =>
              router.push(`/travel-admin/bookings?q=${text}`)
            }
            className="sm:w-72"
          />
        </div>

        <div style={styles.summary}>
          <SummaryCard
            label="Total Booking"
            value={allBookings.length}
            icon="confirmation_number"
            tone="neutral"
          />
          <SummaryCard
            label="Menunggu Konfirmasi"
            value={breakdown.PENDING}
            icon="hourglass_top"
            tone="accent"
          />
          <SummaryCard
            label="Nilai Terkonfirmasi"
            value={formatIDRCompact(confirmedValue)}
            icon="paid"
            tone="success"
          />
        </div>
      </View>

      <View style={styles.content}>
        {slice.length ? (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {slice.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                travel={booking.travel}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {allBookings.length > 0
                ? "Ubah saringan status, jenis, atau kata kunci untuk melihat booking lain."
                : "Belum ada booking. Buka antrean untuk membuat pemesanan pertama."}
            </Text>
          </View>
        )}
      </View>

      {totalPages > 1 ? (
        <Pagination
          page={currentPage}
          perPage={10}
          total={filtered.length}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  toolbar: {
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },
  list: {
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    color: "text-on-surface-variant",
  },
});
