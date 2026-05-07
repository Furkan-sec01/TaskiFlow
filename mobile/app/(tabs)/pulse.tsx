import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_URL = "http://192.168.1.128:5000/api";

export default function TaskPulseScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const loadBoard = async (projectId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/project/${projectId}/board`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Board columns:", JSON.stringify(data?.columns?.map((c: any) => ({ name: c.title, tasks: c.tasks?.length }))));
      setBoard(data);
    } catch (e) {
      console.log("Board yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API_URL}/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Projeler:", JSON.stringify(data?.map((p: any) => p.title)));
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0]);
        await loadBoard(data[0].id, token);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log("Proje yükleme hatası:", e);
      setLoading(false);
    }
  };

  const handleSelectProject = async (project: any) => {
    setSelectedProject(project);
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (token) loadBoard(project.id, token);
  };

  const allTasks = board?.columns?.flatMap((c: any) => c.tasks) || [];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t: any) => t.isCompleted).length;

  const memberTaskMap: Record<string, number> = {};
  allTasks.forEach((t: any) => {
    const name = t.assignee?.name;
    if (name) memberTaskMap[name] = (memberTaskMap[name] || 0) + 1;
  });
  const mostActive = Object.entries(memberTaskMap).sort((a, b) => b[1] - a[1])[0];
  const mostActiveName = mostActive?.[0] || "-";
  const mostActiveCount = mostActive?.[1] || 0;
  const mostActivePercent = totalTasks > 0 ? Math.round((mostActiveCount / totalTasks) * 100) : 0;

  const columnStats = board?.columns?.map((c: any) => ({
    name: c.title || c.name || "",
    count: c.tasks?.length || 0,
  })) || [];
  const maxCount = Math.max(...columnStats.map((c: any) => c.count), 1);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Pulse</Text>
          <Text style={styles.headerSubtitle}>Projeye özel takım nabzı</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Feather name="activity" size={18} color="#2563eb" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectSelector} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {projects.map((p) => (
          <Pressable key={p.id} style={[styles.projectChip, selectedProject?.id === p.id && styles.projectChipActive]} onPress={() => handleSelectProject(p)}>
            <Text style={[styles.projectChipText, selectedProject?.id === p.id && styles.projectChipTextActive]}>{p.title || p.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>{selectedProject?.title || selectedProject?.name}</Text>
          </View>
          <Text style={styles.taskTitle}>{totalTasks} Görev</Text>
          <Text style={styles.taskMeta}>{completedTasks} tamamlandı · {totalTasks - completedTasks} devam ediyor</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryMini}>TOPLAM GÖREV</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryNumber}>{totalTasks}</Text>
            <Text style={styles.summaryLabel}>GÖREV</Text>
          </View>
          <Text style={styles.summaryBottom}>%{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0} tamamlandı</Text>
          <Text style={styles.summaryBackgroundMark}>↗</Text>
        </View>

        {columnStats.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Feather name="bar-chart-2" size={18} color="#22c55e" />
              <Text style={styles.sectionTitle}>Kolon Dağılımı</Text>
            </View>
            <View style={styles.chartArea}>
              {columnStats.map((col: any, index: number) => {
                const barHeight = (col.count / maxCount) * 130;
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrap}>
                      <View style={[styles.bar, { height: Math.max(barHeight, 4) }]} />
                    </View>
                    <Text style={styles.barValue}>{col.count}</Text>
                    <Text style={styles.barDay} numberOfLines={1}>{col.name.slice(0, 4)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {mostActiveName !== "-" && (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="whatshot" size={18} color="#f59e0b" />
              <Text style={styles.sectionTitle}>En Aktif Kullanıcı</Text>
            </View>
            <View style={styles.activeBox}>
              <View style={styles.activeTop}>
                <Text style={styles.activeName}>{mostActiveName.toUpperCase()}</Text>
                <Text style={styles.activePercent}>%{mostActivePercent}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${mostActivePercent}%` }]} />
              </View>
            </View>
          </View>
        )}

        {Object.keys(memberTaskMap).length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Görev Dağılımı</Text>
              <Text style={styles.cardCount}>{Object.keys(memberTaskMap).length} kişi</Text>
            </View>
            {Object.entries(memberTaskMap).map(([name, count], i) => (
              <View key={i} style={styles.memberRow}>
                <View style={styles.memberLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.memberName}>{name}</Text>
                    <Text style={styles.memberInfo}>{count} görev</Text>
                  </View>
                </View>
                <View style={[styles.memberStatus, { backgroundColor: "#22c55e" }]} />
              </View>
            ))}
          </View>
        )}

        {totalTasks === 0 && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Feather name="info" size={18} color="#2563eb" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>Henüz görev yok</Text>
                <Text style={styles.infoDesc}>Bu projede henüz görev bulunmuyor.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10, backgroundColor: "#f8fafc" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  headerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  projectSelector: { marginBottom: 8 },
  projectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff", marginRight: 8 },
  projectChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  projectChipText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  projectChipTextActive: { color: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  topCard: { backgroundColor: "#ffffff", borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  topBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#eff6ff", marginBottom: 12 },
  topBadgeText: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  taskTitle: { fontSize: 21, fontWeight: "800", color: "#0f172a" },
  taskMeta: { marginTop: 8, fontSize: 13, color: "#64748b" },
  summaryCard: { backgroundColor: "#2563eb", borderRadius: 24, padding: 18, marginBottom: 16, overflow: "hidden", minHeight: 155, justifyContent: "space-between", elevation: 6 },
  summaryMini: { fontSize: 11, fontWeight: "800", color: "#dbeafe", letterSpacing: 1 },
  summaryRow: { flexDirection: "row", alignItems: "flex-end" },
  summaryNumber: { fontSize: 48, fontWeight: "900", color: "#ffffff", lineHeight: 54 },
  summaryLabel: { marginLeft: 8, marginBottom: 8, fontSize: 14, fontWeight: "800", color: "#dbeafe" },
  summaryBottom: { fontSize: 12, color: "#dbeafe", fontWeight: "500" },
  summaryBackgroundMark: { position: "absolute", right: 16, bottom: -4, fontSize: 92, fontWeight: "900", color: "rgba(255,255,255,0.10)" },
  card: { backgroundColor: "#ffffff", borderRadius: 22, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#64748b", textTransform: "uppercase" },
  cardCount: { fontSize: 13, fontWeight: "800", color: "#64748b" },
  memberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  memberLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: "800", color: "#2563eb" },
  memberName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  memberInfo: { marginTop: 2, fontSize: 12, color: "#94a3b8" },
  memberStatus: { width: 10, height: 10, borderRadius: 5 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  activeBox: { marginTop: 2 },
  activeTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  activeName: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  activePercent: { fontSize: 20, fontWeight: "900", color: "#2563eb" },
  progressTrack: { width: "100%", height: 10, borderRadius: 999, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#2563eb" },
  chartArea: { height: 190, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", marginVertical: 8 },
  barColumn: { alignItems: "center", flex: 1 },
  barWrap: { height: 135, justifyContent: "flex-end" },
  bar: { width: 20, borderRadius: 8, backgroundColor: "#2563eb" },
  barValue: { marginTop: 8, fontSize: 11, fontWeight: "700", color: "#0f172a" },
  barDay: { marginTop: 4, fontSize: 10, color: "#64748b", fontWeight: "600", textAlign: "center" },
  infoCard: { backgroundColor: "#ffffff", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  infoRow: { flexDirection: "row", alignItems: "flex-start" },
  infoIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  infoDesc: { fontSize: 13, lineHeight: 20, color: "#64748b" },
});