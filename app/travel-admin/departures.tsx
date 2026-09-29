import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import { requireBookingManager } from "@/lib/auth";
import {
  getBookingOverview,
  loadBookingsWithTravel,
} from "@/lib/api/report";
import {
  SummaryCard,
  formatIDRCompact,
} from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { BookingRow } from "@/components/booking/booking-row";

import type { Booking } from "@/lib/api/types";

export const metadata = { title: "Keberangkatan • Dinas Travel" };

export default function DeparturesPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const router = useRouter();
  await requireBookingManager();

  const [unread] = await useState(() => getUnreadCount().catch(() => ({ count: 0 })));
  const [overview, setOverview] = useState({
    breakdown: { PENDING: 0, CONFIRMED: 0, CANCELLED: 0 },
    confirmedValue: 0,
    total: 0,
    departures: [] as any[],
  });

  useEffect(() => {
    const loadData = async () => {
      const [bookings] = await Promise.all([loadBookingsWithTravel()]);
      const result = getBookingOverview(7)(bookings);
      setOverview(result);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Refresh on focus
  }, []);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
          { label: "Keberangkatan" },
        ]}
      />

      <PageHeader
        title="Monitoring Keberangkatan"
        description="Tiket dan hotel yang berangkat dalam 7 hari depan"
      />

      <View style={styles.content}>
        <SummaryCard
          label="Total Booking"
          value={overview.total}
          icon="confirmation_number"
          tone="neutral"
        />
        <SummaryCard
          label="Terkonfirmasi"
          value={overview.breakdown.CONFIRMED}
          icon="task_alt"
          tone="success"
        />
        <SummaryCard
          label="Nilai Terkonfirmasi"
          value={formatIDRCompact(overview.confirmedValue)}
          icon="paid"
          tone="success"
        />

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {overview.departures.map((departure) => (
            <BookingRow
              key={departure.id}
              booking={departure}
              travel={departure.travel}
            />
          ))}
        </ScrollView>
      </View>
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
  list: {
    gap: 12,
  },
});