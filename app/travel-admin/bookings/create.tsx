import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSearchParams } from "@expo/router";

import { requireBookingManager } from "@/lib/auth";
import {
  listPendingBookings,
  createBooking,
} from "@/lib/api";
import {
  SummaryCard,
  formatIDR,
  formatIDRCompact,
} from "@/components/ui/summary-card";
import { Header, PageHeader } from "@/components/layout/header";
import { SearchBar } from "@/components/ui/search-bar";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TravelStatusBadge } from "@/components/ui/status-badge";

import type { PendingTravel } from "@/lib/api/booking";

export const metadata = { title: "Buat Booking • Dinas Travel" };

export default function CreateBookingPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const router = useRouter();
  await requireBookingManager();

  const [travels, setTravels] = useState<PendingTravel[]>([]);
  const [selectedTravel, setSelectedTravel] = useState<PendingTravel | null>(null);
  const [form, setForm] = useState({
    type: "FLIGHT" as "FLIGHT" | "HOTEL" | "TRAIN" | "TRANSPORT",
    provider: "",
    referenceNumber: "",
    amount: 0,
    departureDate: "",
    checkInDate: "",
    checkOutDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load pending travels from API
  useEffect(() => {
    listPendingBookings().then((data) => setTravels(data));
  }, []);

  const handleCreate = async () => {
    if (!selectedTravel) {
      setError("Pilih pengajuan travel yang telah disetujui.");
      return;
    }
    if (form.amount <= 0) {
      setError("Nilai booking harus lebih dari 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createBooking(selectedTravel.id, {
        type: form.type,
        provider: form.provider,
        referenceNumber: form.referenceNumber,
        amount: form.amount,
        departureDate: form.departureDate,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        notes: form.notes,
      });

      // Show success and navigate back
      Alert.alert("Sukses", `Booking berhasil dibuat: ${result.data.ref}`);
      router.back();
    } catch (err: any) {
      setError(err.message || "Gagal membuat booking.");
    } finally {
      setLoading(false);
    }
  };

  if (travels.length === 0) {
    return (
      <View style={styles.container}>
        <PageHeader
          title="Buat Booking"
          description="Booking hanya dapat dibuat untuk pengajuan berstatus APPROVED."
        />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Tidak ada pengajuan travel menunggu antrean.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
          { label: "Buat Booking" },
        ]}
      />

      <PageHeader
        title="Buat Booking"
        description="Booking hanya dapat dibuat untuk pengajuan berstatus APPROVED."
      />

      <View style={styles.form}>
        {/* Travel Selection */}
        <SummaryCard
          label="Pilih Pengajuan Travel"
          value={selectedTravel?.ref ?? "—"}
          icon="info"
          tone="neutral"
        >
          <TouchableOpacity
            style={styles.travelSelect}
            onPress={() => router.push(`/travel-admin/bookings/queue`)}
          >
            <Text style={styles.travelSelectText}>
              Lihat antrean booking
              <span style={{ color: "text-tertiary", marginLeft: 4 }}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                />
              </span>
            </Text>
          </TouchableOpacity>
        </SummaryCard>

        {selectedTravel && (
          <View style={styles.formBody}>
            <View style={styles.formRow}>
              <Label>Jenis Booking</Label>
              <View style={styles.formControl}>
                <Button
                  variant="outline"
                  mode="flat"
                  style={styles.typeButton}
                  onPress={() => setForm((f) => ({ ...f, type: "FLIGHT" }))}
                >
                  Penerbangan
                </Button>
                <Button
                  variant="outline"
                  mode="flat"
                  style={styles.typeButton}
                  onPress={() => setForm((f) => ({ ...f, type: "HOTEL" }))}
                >
                  Hotel
                </Button>
                <Button
                  variant="outline"
                  mode="flat"
                  style={styles.typeButton}
                  onPress={() => setForm((f) => ({ ...f, type: "TRAIN" }))}
                >
                  Kereta Api
                </Button>
                <Button
                  variant="outline"
                  mode="flat"
                  style={styles.typeButton}
                  onPress={() => setForm((f) => ({ ...f, type: "TRANSPORT" }))}
                >
                  Transportasi Darat
                </Button>
              </View>
            </View>

            {form.type === "FLIGHT" && (
              <View style={styles.formGroup}>
                <Label>Mitra/Penprovider</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="Garuda Indonesia, Lion Air..."
                    value={form.provider}
                    onChangeText={setForm}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "HOTEL" && (
              <View style={styles.formGroup}>
                <Label>Mitra/Penprovider</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="Aston Hotel, Hotel Ubud Palace..."
                    value={form.provider}
                    onChangeText={setForm}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "TRAIN" && (
              <View style={styles.formGroup}>
                <Label>Mitra/Penprovider</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="KA Bandara, KA Yogyakarta..."
                    value={form.provider}
                    onChangeText={setForm}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "TRANSPORT" && (
              <View style={styles.formGroup}>
                <Label>Mitra/Penprovider</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="Mobil sewa, Bus..."
                    value={form.provider}
                    onChangeText={setForm}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Label>Nilai Booking (Rp)</Label>
              <View style={styles.inputWrapper}>
                <SearchBar
                  placeholder="4500000"
                  value={form.amount.toString()}
                  onChangeText={(text) =>
                    setForm({ ...form, amount: Number(text) || 0 })
                  }
                  keyboardType="number-pad"
                  placeholderTextColor="text-tertiary"
                />
              </View>
            </View>

            {form.type === "FLIGHT" && (
              <View style={styles.formGroup}>
                <Label>Tanggal Keberangkatan</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="2026-10-01"
                    value={form.departureDate}
                    onChangeText={(text) => setForm({ ...form, departureDate: text })}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "HOTEL" && (
              <View style={styles.formGroup}>
                <Label>Check-In</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="2026-10-01"
                    value={form.checkInDate}
                    onChangeText={(text) =>
                      setForm({ ...form, checkInDate: text })
                    }
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "TRAIN" && (
              <View style={styles.formGroup}>
                <Label>Tanggal Keberangkatan</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="2026-10-01"
                    value={form.departureDate}
                    onChangeText={(text) => setForm({ ...form, departureDate: text })}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            {form.type === "TRANSPORT" && (
              <View style={styles.formGroup}>
                <Label>Tanggal Keberangkatan</Label>
                <View style={styles.inputWrapper}>
                  <SearchBar
                    placeholder="2026-10-01"
                    value={form.departureDate}
                    onChangeText={(text) => setForm({ ...form, departureDate: text })}
                    placeholderTextColor="text-tertiary"
                  />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Label>No. Referensi / PNR</Label>
              <View style={styles.inputWrapper}>
                <SearchBar
                  placeholder="ABC123"
                  value={form.referenceNumber}
                  onChangeText={(text) =>
                    setForm({ ...form, referenceNumber: text })
                  }
                  placeholderTextColor="text-tertiary"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Label>Catatan</Label>
              <View style={styles.textarea}>
                <SearchBar
                  placeholder="Catatan tambahan..."
                  multiline
                  rows={3}
                  value={form.notes}
                  onChangeText={(text) =>
                    setForm({ ...form, notes: text })
                  }
                  placeholderTextColor="text-tertiary"
                />
              </View>
            </View>
          </View>
        )}

        {/* Form Error */}
        {error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitText}>Buat Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  form: {
    padding: 16,
  },
  formBody: {
    marginTop: 24,
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  formControl: {
    flex: 1,
  },
  typeButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e6e9",
    borderRadius: 6,
    marginRight: 8,
    minWidth: 100,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#e2e6e9",
    borderRadius: 8,
    padding: 12,
  },
  textarea: {
    marginTop: 8,
  },
  error: {
    backgroundColor: "#ffdad6",
    color: "#93000a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#93000a",
  },
  submitButton: {
    backgroundColor: "#0059bb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: {
    color: "white",
    fontWeight: "600",
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
  travelSelect: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e6e9",
    borderRadius: 8,
    marginBottom: 16,
  },
  travelSelectText: {
    color: "primary",
  },
});
