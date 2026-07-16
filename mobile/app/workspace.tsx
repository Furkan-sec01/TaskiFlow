import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function WorkspaceDetail() {
  const router = useRouter();
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (e) {
      console.log("Proje yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const openMenu = (proj: any) => {
    setSelectedProject(proj);
    setMenuVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Organizasyonlara Dön</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Çalışma Alanı</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Görev Alınan Projeler</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 12 }} />
        ) : projects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <MaterialIcons name="folder-open" size={36} color={colors.placeholder} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz görev alınan proje yok.</Text>
          </View>
        ) : (
          projects.map((proj, i) => (
            <Pressable
              key={proj.id}
              style={[styles.projectCard, { backgroundColor: colors.card }]}
              onPress={() => router.push({
                pathname: "/workspace-proje-detay",
                params: { projectId: proj.id, projectTitle: proj.title || proj.name }
              })}
            >
              <View style={styles.projectLeft}>
                <View style={[styles.projectIcon, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <MaterialIcons name="folder" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.projectTitle, { color: colors.text }]}>{proj.title || proj.name}</Text>
                  {proj.description ? (
                    <Text style={[styles.projectDesc, { color: colors.textSecondary }]} numberOfLines={1}>{proj.description}</Text>
                  ) : null}
                </View>
              </View>

              {/* SAĞ OK BUTONU */}
              <Pressable
                style={styles.menuBtn}
                onPress={(e) => { e.stopPropagation(); openMenu(proj); }}
              >
                <MaterialIcons name="expand-more" size={24} color={colors.textSecondary} />
              </Pressable>
            </Pressable>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL MENU */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{selectedProject?.title || selectedProject?.name}</Text>

            <Pressable
              style={styles.leaveBtn}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert("Bilgi", "Ekipten ayrılma işlemini sonra bağlayacağız.");
              }}
            >
              <Text style={styles.leaveText}>Ekipten Ayrıl</Text>
            </Pressable>

            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert("Bilgi", "Ekibi kapatma işlemini sonra bağlayacağız.");
              }}
            >
              <Text style={styles.deleteText}>Ekibi Kapat</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16 },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  backText: { fontSize: 14, color: "#6b7280" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  emptyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 13, color: "#9CA3AF" },
  projectCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1 },
  projectLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  projectIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  projectTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  projectDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  menuBtn: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 32 },
  menuBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 10 },
  menuTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  leaveBtn: { backgroundColor: "#fee2e2", padding: 12, borderRadius: 10 },
  leaveText: { color: "#dc2626", textAlign: "center", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fecaca", padding: 12, borderRadius: 10 },
  deleteText: { color: "#b91c1c", textAlign: "center", fontWeight: "600" },
});