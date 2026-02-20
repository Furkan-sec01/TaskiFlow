import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>T</Text>
        </View>

        <Text style={styles.title}>TaskiFlow</Text>
        <Text style={styles.subtitle}>Yeni bir hesap oluştur</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ad Soyad"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            secureTextEntry
          />

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 16, alignItems: "center", paddingTop: 40 },

  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  logoText: { color: "#fff", fontSize: 26, fontWeight: "800" },

  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },

  card: {
    width: "100%",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
  },

  label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },

  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },

  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
