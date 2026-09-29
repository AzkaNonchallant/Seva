import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";

import { requireBookingManager } from "@/lib/auth";
import {
  listPendingBookings,
  getUnreadCount,
  getBookingOverview,
} from "@/lib/api";
import {
  SummaryCard,
  formatIDRCompact,
} from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { TravelRequestCard } from "@/components/travel/travel-request-card";
import { FilterTabs } from "@/components/data-table/filters";
import { SearchBar } from "@/components/ui/search-bar";
import { BookingRow } from "@/components/booking/booking-row";
import { Pagination } from "@/components/data-table/pagination";
import { daysUntil } from "@/lib/utils";
import { countByWindow } from "@/lib/utils";

import type { PendingTravel } from "@/lib/api/booking";

export const metadata = { title: "Dashboard • Dinas Travel" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const user = await requireBookingManager();
  const router = useRouter();

  const [queue, unread, { breakdown, confirmedValue, total, departures }] =
    await Promise.all([
      listPendingBookings(),
      getUnreadCount().catch(() => ({ count: 0 })),
      getBookingOverview(7),
    ]);

  // Handle refresh
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const refreshControl = RefreshControl.create();
    refreshControl.addListener("refresh", async () => {
      setRefreshing(true);
      await Promise.all([
        listPendingBookings(),
        getUnreadCount().catch(() => ({ count: 0 })),
        getBookingOverview(7),
      ]);
      setRefreshing(false);
    });
    return refreshControl;
  }, []);

  const window = "ALL"; // default window filter

  const counts = countByWindow(queue);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWindow, setFilterWindow] = useState<"ALL" | "TODAY" | "WEEK">("ALL");

  // Apply filters
  let filteredQueue = [...queue];
  if (searchQuery) {
    filteredQueue = filteredQueue.filter((travel) =>
      [travel.ref, travel.employeeName, travel.destination, travel.purpose]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchQuery)),
    );
  }
  if (filterWindow === "TODAY") {
    filteredQueue = filteredQueue.filter(
      (travel) => daysUntil(travel.startDate) <= 3,
    );
  } else if (filterWindow === "WEEK") {
    filteredQueue = filteredQueue.filter(
      (travel) => daysUntil(travel.startDate) <= 7,
    );
  }

  useEffect(() => {
    // Reset page when filters change
  }, [searchQuery, filterWindow]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor="primary"
          title="Refreshing..."
        />
      }
    >
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
        ]}
        unreadCount={unread.count}
      />

      <PageHeader
        title="Dinas Travel"
        description="Antrean penugasan booking untuk pengajuan yang telah disetujui, dan pemantauan keberangkatan karyawan."
        actions={
          <Button
            href="/travel-admin/bookings/queue"
            variant="secondary"
            startIcon="pending_actions"
          >
            Buka Antrean
          </Button>
        }
      />

      <section
        aria-label="Ringkasan operasional"
        style={styles.kpiSection}
      >
        <div style={styles.kpiRow}>
          <SummaryCard
            label="Menunggu Booking"
            value={queue.length}
            icon="pending_actions"
            tone="accent"
            footnote="Pengajuan APPROVED tanpa booking"
            href="/travel-admin/bookings/queue"
          />
          <SummaryCard
            label="Booking Terkonfirmasi"
            value={breakdown.CONFIRMED}
            icon="task_alt"
            tone="success"
            footnote="Tiket & hotel sudah terbit"
            href="/travel-admin/bookings?status=CONFIRMED"
          />
          <SummaryCard
            label="Keberangkatan Mendatang"
            value={departures.length}
            icon="travel_explore"
            tone="neutral"
            footnote="7 hari ke depan"
            href="/travel-admin/departures"
          />
          <SummaryCard
            label="Realisasi Booking"
            value={formatIDRCompact(confirmedValue)}
            icon="payments"
            tone="primary"
            footnote="Nilai tiket & hotel terbit"
          />
        </div>
      </section>

      <section
        aria-label="Ringkasan operasional"
        style={styles.detailsSection}
      >
        <div style={styles.grid}>
          <TravelRequestCard
            travel={queue[0]}
            key={queue[0]?.id}
            onPress={() => router.push(`/travel-admin/requests/${queue[0]?.id}`)}
          />
          {/* Show up to 3 recent cards */}
          {queue.slice(1, 3).map((travel) => (
            <TravelRequestCard
              key={travel.id}
              travel={travel}
            />
          ))}
        </div>

        <div style={styles.filters}>
          <FilterTabs<"ALL" | "TODAY" | "WEEK">
            ariaLabel="Saring antrean menurut jarak keberangkatan"
            value={filterWindow}
            onValueChange={setFilterWindow}
            options={[
              { value: "ALL", label: "Semua", count: queue.length },
              { value: "TODAY", label: "Berangkat ≤ 3 hari", count: counts.TODAY },
              { value: "WEEK", label: "Berangkat ≤ 7 hari", count: counts.WEEK },
            ]}
          />
          <SearchBar
            placeholder="Cari nama, kota, atau nomor..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="sm:w-80"
          />
        </div>
      </section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  kpiSection: {
    marginBottom: 24,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailsSection: {
    marginTop: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  filters: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});