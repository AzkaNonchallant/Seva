import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import { requireBookingManager } from "@/lib/auth";
import { listPolicies } from "@/lib/api/travel";
import {
  SummaryCard,
} from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";

import type { TravelPolicy } from "@/lib/api/types";

export const metadata = { title: "Travel Policy • Dinas Travel" };

export default function PolicyPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const router = useRouter();
  await requireBookingManager();

  const [policies, setPolicies] = useState<TravelPolicy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPolicies().then((data) => {
      setPolicies(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Reset when search changes
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
          { label: "Travel Policy" },
        ]}
      />

      <PageHeader
        title="Travel Policy"
        description="Kebijakan perjalanan dinas yang berlaku"
      />

      <View style={styles.toolbar}>
        <SearchBar
          placeholder="Cari policy..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="sm:w-80"
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loading}>
            <Text>Memuat policy...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {policies.map((policy) => (
              <View
                key={policy.id}
                style={styles.policyItem}
                onPress={() =>
                  router.push(`/travel-admin/policy/${policy.id}`)
                }
              >
                <Text style={styles.policyTitle}>{policy.name}</Text>
                <Text style={styles.policyDescription}>
                  {policy.description || "—"}
                </Text>
                <Text style={styles.policyDetails}>
                  {policy.maxEstimatedCost
                    ? `Maksimal estimasi: ${formatIDR(
                        policy.maxEstimatedCost
                      )}`
                    : "Tanpa batas estimasi"}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {!policies.length && !loading && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Tidak ada policy yang ditemukan.
          </Text>
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  list: {
    gap: 12,
  },
  loading: {
    padding: 24,
    textAlign: "center",
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
  policyItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e6e9",
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#191c1d",
  },
  policyDescription: {
    color: "text-tertiary",
    marginBottom: 8,
  },
  policyDetails: {
    color: "text-tertiary",
    fontSize: 14,
  },
});