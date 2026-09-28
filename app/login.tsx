import { redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, AsyncStorage } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { login } from "@/lib/api/auth";
import { createSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/permissions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await login(email, password);
      await createSession(result.data.user, result.data.token);
      // Redirect based on role
      const role = result.data.user.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        redirect("/travel-admin/dashboard");
      } else if (role === "EMPLOYEE") {
        redirect("/employee/dashboard");
      } else if (role === "FINANCE") {
        redirect("/finance/dashboard");
      } else if (role === "MANAGER" || role === "DEPARTMENT_HEAD" || role === "HRD") {
        redirect("/approver/dashboard");
      } else {
        redirect("/");
      }
    } catch (err: any) {
      setError(err.message || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === "development") {
    // Check for existing session
    (async () => {
      const stored = await AsyncStorage.getItem("horizon_token");
      if (stored) {
        redirect("/travel-admin/dashboard");
      }
    })();
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <MaterialCommunityIcons
          size={64}
          color="primary"
          name="account-circle"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Masuk ke Horizon Odyssey</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            style={{ position: "absolute", left: 16, top: 14, color: "text-on-surface-variant" }}
            size={20}
            name="email"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            style={{ position: "absolute", left: 16, top: 14, color: "text-on-surface-variant" }}
            size={20}
            name="lock"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            returnKeyType="go"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <Text style={styles.buttonText}>Masuk...</Text>
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}
            onPress={() => {}}
          >
            Lupa password?
          </Text>
          <Text style={styles.linkText} onPress={() => {}}>
            Daftar
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  formContainer: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#191c1d",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 360,
    marginLeft: "auto",
    marginRight: "auto",
  },
  errorBox: {
    backgroundColor: "#ffdad6",
    color: "#93000a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#93000a",
    fontSize: 14,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e6e9",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#191c1d",
  },
  button: {
    backgroundColor: "#0059bb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  linkText: {
    color: "#0059bb",
    fontSize: 14,
  },
});