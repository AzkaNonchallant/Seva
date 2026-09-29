/**
 * Layout for the Admin Travel area.
 * Provides sidebar navigation and header with user info.
 * Uses requireBookingManager gate from lib/auth.
 */
import { requireBookingManager } from "@/lib/auth";
import { useEffect } from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastHost } from "@/components/ui/toast-host";

export default function TravelAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = useNavigation();
  const user = requireBookingManager();

  useEffect(() => {
    // Update sidebar queue badge on focus
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const queue = await listPendingBookings().catch(() => []);
        // We'll update the sidebar via a different mechanism
        // The sidebar reads from a shared state or prop
      } catch (e) {
        // Silently fail - badge update is cosmetic
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Header
        breadcrumb={[
          { label: "Horizon Odyssey", href: "/travel-admin/dashboard" },
          { label: "Dinas Travel" },
        ]}
      />
      <Sidebar
        userName={user.name}
        userRole="Admin Travel"
        userInitials={user.name?.split(" ")[0]?.[0] || "?"}
      />
      <View style={styles.content}>
        {children}
      </View>
      <ToastHost />
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
});