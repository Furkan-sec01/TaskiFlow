import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function WorkspaceDetail() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      
      {/* SCROLL */}
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <Pressable onPress={() => router.back()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={20} color="#111" />
          <Text style={styles.backText}>Organizasyonlara Dön</Text>
        </Pressable>

        {/* TITLE */}
        <Text style={styles.title}>Çalışma Alanı Detayları</Text>

        {/* CONTENT */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Çalışma Alanı Özeti</Text>
          <Text style={styles.infoText}>
            Bu ekran çalışma alanının ana detay ekranı olacak. Buradan üyeler,
            projeler ve belgeler ekranlarına geçiş yapılır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>

          <Pressable
            style={styles.quickCard}
            onPress={() => router.push("/members")}
          >
            <View style={styles.quickLeft}>
              <View style={[styles.quickIconWrap, { backgroundColor: "#E0F2FE" }]}>
                <MaterialIcons name="group" size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.quickTitle}>Tüm Üyeler</Text>
                <Text style={styles.quickDesc}>
                  Bu workspace içindeki tüm üyeleri görüntüle
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => router.push("/proje-panosu")}
          >
            <View style={styles.quickLeft}>
              <View style={[styles.quickIconWrap, { backgroundColor: "#DCFCE7" }]}>
                <MaterialIcons name="folder" size={20} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.quickTitle}>Proje Panosu</Text>
                <Text style={styles.quickDesc}>
                  Çalışma alanına ait projeleri görüntüle
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => router.push("/documents")}
          >
            <View style={styles.quickLeft}>
              <View style={[styles.quickIconWrap, { backgroundColor: "#FEF3C7" }]}>
                <MaterialIcons name="description" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.quickTitle}>Belgeler</Text>
                <Text style={styles.quickDesc}>
                  Workspace belgelerini ve dosyalarını görüntüle
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* ALT BOŞLUK */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 🔥 ALT SABİT BUTONLAR */}
      <View style={styles.bottomActions}>

        {/* 👇 ÜYE DAVET ET EN ÜST */}
        <Pressable
          style={styles.inviteBtn}
          onPress={() =>
            Alert.alert("Bilgi", "Üye davet etme işlemini sonra bağlayacağız.")
          }
        >
          <Text style={styles.inviteText}>Üye Davet Et</Text>
        </Pressable>

        <Pressable
          style={styles.leaveBtn}
          onPress={() =>
            Alert.alert("Bilgi", "Ekipten ayrılma işlemini sonra bağlayacağız.")
          }
        >
          <Text style={styles.leaveText}>Ekipten Ayrıl</Text>
        </Pressable>

        <Pressable
          style={styles.deleteBtn}
          onPress={() =>
            Alert.alert("Bilgi", "Ekibi kapatma işlemini sonra bağlayacağız.")
          }
        >
          <Text style={styles.deleteText}>Ekibi Kapat</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  container: {
    padding: 16,
  },

  back: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },

  backText: {
    fontSize: 14,
    color: "#6b7280",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },

  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  leaveBtn: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  leaveText: {
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "600",
  },

  deleteBtn: {
    backgroundColor: "#fecaca",
    padding: 12,
    borderRadius: 10,
  },

  deleteText: {
    color: "#b91c1c",
    textAlign: "center",
    fontWeight: "600",
  },

  inviteBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  inviteText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },

  section: {
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  quickCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quickLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  quickTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  quickDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },
});