import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    Keyboard.dismiss();

    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldur.");
      return;
    }

    // Şimdilik başarılı varsay → Projelerim ekranına
    router.replace("/(tabs)/projects");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>

            <Text style={styles.title}>TaskiFlow</Text>
            <Text style={styles.subtitle}>Yeni bir hesap oluştur</Text>
          </View>

          {/* FORM */}
          <View style={styles.card}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ad Soyad"
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="******"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCorrect={false}
              autoComplete="password"
              textContentType="newPassword"
              returnKeyType="done"
            />

            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </Pressable>

            <View style={styles.row}>
              <Text style={styles.gray}>Zaten hesabın var mı?</Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  router.push("/login");
                }}
              >
                <Text style={styles.link}> Giriş Yap</Text>
              </Pressable>
            </View>

            <View style={styles.row2}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  router.replace("/");
                }}
              >
                <Text style={styles.backHome}>← Karşılama</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
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

  title: { fontSize: 28, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },

  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
  },

  label: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 8 },

  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  row2: { marginTop: 14, alignItems: "center" },

  gray: { color: "#6B7280" },
  link: { color: "#2563EB", fontWeight: "900" },
  backHome: { color: "#6B7280", fontWeight: "800" },
});