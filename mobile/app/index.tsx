import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>

          <Text style={styles.title}>TaskiFlow</Text>
          <Text style={styles.subtitle}>
            Projelerini ve görevlerini kolayca yönet.
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Pressable
            style={[styles.button, styles.primary]}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>Kayıt Ol</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondary]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.buttonText, styles.secondaryText]}>Giriş Yap</Text>
          </Pressable>

          <Text style={styles.grayHint}>
            Devam ederek kullanım koşullarını kabul etmiş olursun.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
  },

  header: { alignItems: "center", marginBottom: 18 },

  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: { color: "#fff", fontSize: 26, fontWeight: "900" },

  title: { fontSize: 30, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#6B7280", textAlign: "center" },

  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
  },

  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#2563EB" },
  secondary: { borderWidth: 1, borderColor: "#E5E7EB", marginTop: 12 },

  buttonText: { fontSize: 16, fontWeight: "900" },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#111827" },

  grayHint: {
    marginTop: 14,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});