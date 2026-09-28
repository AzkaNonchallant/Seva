import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSearchParams, usePathname } from "@expo-router";

import { requireBookingManager } from "@/lib/auth";
import {
  listPendingBookings,
  getUnreadCount,
} from "@/lib/api";
import {
  SummaryCard,
  formatIDR,
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

export const metadata = { title: "Antrean Booking • Dinas Travel" };

export default async function QueuePage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const router = useRouter();
  await requireBookingManager();

  const [queue, unread] = await Promise.all([
    listPendingBookings(),
    getUnreadCount().catch(() => ({ count: 0 })),
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterWindow, setFilterWindow] = useState<"ALL" | "TODAY" | "WEEK">("ALL");

  // Window filter options
  const WINDOW_LABEL: Record<string, string> = {
    ALL: "Semua",
    TODAY: "Berangkat ≤ 3 hari",
    WEEK: "Berangkat ≤ 7 hari",
  };

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

  const counts = countByWindow(queue);
  const totalPages = 1; // Simplified - no pagination for now
  const currentPage = 1;

  useEffect(() => {
    // Reset when filters change
  }, [searchQuery, filterWindow]);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Dinas Travel", href: "/travel-admin/dashboard" },
          { label: "Antrean Booking" },
        ]}
        unreadCount={unread.count}
      />

      <PageHeader
        title="Antrean Penugasan Booking"
        description="Setiap pengajuan di sini sudah disetujui seluruh tingkat persetujuan tetapi belum memiliki satu pun booking. Urutan mengikuti waktu tunggu — yang terlama diantre paling atas."
      />

      <View style={styles.content}>
        <div style={styles.kpiFilters}>
          <FilterTabs<string>
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

        {filteredQueue.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {filteredQueue.map((travel) => (
              <TravelRequestCard
                key={travel.id}
                travel={travel}
                onPress={() =>
                  router.push(
                    `/travel-admin/requests/${travel.id}`
                  )
                }
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="task_alt" size={48} color="secondary" />
            <Text style={styles.emptyText}>
              {queue.length > 0 ? "Tidak ada antrean yang cocok" : "Antrean bersih"}
            </Text>
            {queue.length > 0 && (
              <Text style={styles.emptyHint}>
                Ubah kata kunci atau saringan jarak keberangkatan untuk melihat antrean lain.
              </Text>
            )}
          </View>
        )}
      </View>

      {filteredQueue.length > 0 && (
        <Pagination
          page={currentPage}
          perPage={10}
          total={filteredQueue.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  kpiFilters: {
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "text-on-surface-variant",
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: "text-tertiary",
    marginTop: 4,
  },
});