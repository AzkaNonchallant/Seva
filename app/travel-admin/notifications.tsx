import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { requireBookingManager } from "@/lib/auth";
import { listNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/api/notification";
import { SummaryCard } from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Notifikasi • Dinas Travel" };

export default function NotificationsPage({ searchParams }: any) {
  const router = useRouter();
  await requireBookingManager();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [count, list] = await Promise.all([getUnreadCount(), listNotifications()]);
      setUnreadCount(count.count);
      setNotifications(list);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {}, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
  };

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
          { label: "Notifikasi" },
        ]}
      />
      <PageHeader title="Notifikasi" description="Pemberitahuan mengenai booking, approval, dan sistem" />
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Tandai Semua sebagai Dibaca</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loading}>
            <Text>Memuat notifikasi...</Text>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Tidak ada notifikasi baru.</Text>
              </View>
            ) : (
              <View>
                {notifications.map((notif: any) => (
                  <View key={notif.id} style={styles.notificationItem} onPress={() => router.push(`/travel-admin/notifications/${notif.id}`)}>
                    <View style={styles.dotContainer}>
                      <View style={styles.dot} />
                      <Text style={styles.dotText}>{"Sudah Dibaca"} | {"Belum Dibaca"}</Text>
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      <Text style={styles.notificationMessage}>{notif.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  toolbar: { marginBottom: 16, paddingHorizontal: 16 },
  markAllBtn: { padding: 8, borderRadius: 6, backgroundColor: "#f0f4f8", alignItems: "center" },
  markAllText: { color: "primary", fontSize: 14 },
  content: { flex: 1, padding: 16 },
  list: { gap: 12 },
  loading: { padding: 24, textAlign: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { color: "text-on-surface-variant" },
  notificationItem: { padding: 16, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e6e9" },
  dotContainer: { flexDirection: "row", alignItems: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "text-tertiary", marginRight: 12 },
  dotRead: { backgroundColor: "primary" },
  dotUnread: { backgroundColor: "error" },
  dotText: { color: "text-tertiary", fontSize: 10 },
  notificationContent: { flex: 1, marginLeft: 12 },
  notificationTitle: { fontSize: 14, fontWeight: "600", color: "#191c1d" },
  notificationMessage: { color: "text-tertiary", fontSize: 12, marginTop: 2 },
});