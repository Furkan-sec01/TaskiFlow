import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";

export default function HelpSupport() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert("Hata", "Tüm alanları doldur");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        Alert.alert("Hata", "Gönderilemedi");
        return;
      }

      Alert.alert("Başarılı ✅", "Talebin gönderildi");

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      Alert.alert("Hata", "Sunucuya bağlanamadı");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Yardım & Destek</Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Bize Yaz ✉️</Text>
          <Text style={styles.infoText}>
            Sorununu yaz, TaskiFlow ekibi sana en kısa sürede dönecek.
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.card}>
          <TextInput
            placeholder="Ad Soyad"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Konu"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />

          <TextInput
            placeholder="Mesaj"
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Pressable style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>Gönder</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F6FB" },

  container: { padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },

  back: {
    fontSize: 22,
    fontWeight: "bold",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  infoTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  infoText: {
    color: "#E0E7FF",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});