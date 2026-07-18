import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/constants/api";

const STATUS_OPTIONS = [
    { label: "Yapılacak", color: "#F59E0B" },
    { label: "Devam Ediyor", color: "#2563EB" },
    { label: "Tamamlandı", color: "#10B981" },
];

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AddTaskScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [taskName, setTaskName] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("Yapılacak");
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            // Projeleri çek
            const projRes = await fetch(`${API_URL}/project`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const projData = await projRes.json();
            if (Array.isArray(projData)) {
                setProjects(projData);
                if (projData.length > 0) setSelectedProjectId(projData[0].id);
            }

            // Organizasyonu ve üyeleri çek
            const orgRes = await fetch(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orgData = await orgRes.json();
            const orgId = Array.isArray(orgData) ? orgData[0]?.id : orgData?.id;

            if (orgId) {
                const membersRes = await fetch(`${API_URL}/organizations/${orgId}/members`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const membersData = await membersRes.json();
                if (Array.isArray(membersData)) setMembers(membersData);
            }
        } catch (e) {
            console.log("Veri yükleme hatası:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!taskName.trim()) { Alert.alert("Hata", "Görev adı boş olamaz."); return; }
        if (!selectedProjectId) { Alert.alert("Hata", "Proje seçmelisiniz."); return; }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Hata", "Oturum bulunamadı. Lütfen tekrar giriş yapın.");
                return;
            }

            // Önce projenin kolonlarını çek
            const colRes = await fetch(`${API_URL}/project/${selectedProjectId}/board`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const colData = await colRes.json().catch(() => null);
            if (!colRes.ok) {
                Alert.alert("Hata", colData?.error || "Proje kolonları alınamadı.");
                return;
            }

            const columns = Array.isArray(colData) ? colData : colData.columns || colData.board?.columns || [];

            let columnId = null;
            if (columns.length > 0) {
                // Seçilen duruma göre kolon bul
                const statusMap: Record<string, string[]> = {
                    "Yapılacak": ["yapılacak", "todo", "to do", "to-do"],
                    "Devam Ediyor": ["devam", "progress", "in progress", "doing"],
                    "Tamamlandı": ["tamamlandı", "done", "completed", "finished"],
                };
                const keywords = statusMap[selectedStatus] || [];
                const matchedCol = columns.find((c: any) =>
                    keywords.some(k => (c.title || c.name || "").toLowerCase().includes(k))
                );
                columnId = matchedCol?.id || columns[0]?.id;
            }

            if (!columnId) { Alert.alert("Hata", "Proje kolonları bulunamadı. Önce projeyi açıp kolon ekleyin."); return; }

            const selectedAssignee = members.find((member) => member.id === selectedAssigneeId);
            const res = await fetch(`${API_URL}/task/create/${selectedProjectId}/${columnId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: taskName.trim(),
                    description: taskDesc.trim(),
                    priority: "MEDIUM",
                    assignedTo: selectedAssigneeId || null,
                    assigneeMail: selectedAssignee?.email || null,
                }),
            });

            const data = await res.json().catch(() => null);
            if (res.ok) {
                Alert.alert("Başarılı ✅", `"${taskName}" görevi eklendi.`, [
                    { text: "Tamam", onPress: () => router.back() },
                ]);
            } else {
                Alert.alert("Hata", data?.error || data?.message || "Görev eklenemedi.");
            }
        } catch (e) {
            console.log("Görev ekleme hatası:", e);
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setSaving(false);
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={[styles.cancelLink, { color: colors.textSecondary }]}>İptal</Text>
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Yeni Görev</Text>
                    <Pressable onPress={handleSave} disabled={saving}>
                        <Text style={styles.saveLink}>{saving ? "..." : "Kaydet"}</Text>
                    </Pressable>
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Görev Adı</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Görev adını yaz..."
                    placeholderTextColor={colors.placeholder}
                    value={taskName}
                    onChangeText={setTaskName}
                    autoFocus
                />

                <Text style={[styles.label, { color: colors.text }]}>Açıklama (isteğe bağlı)</Text>
                <TextInput
                    style={[styles.input, { height: 80, paddingTop: 12, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Görev açıklaması..."
                    placeholderTextColor={colors.placeholder}
                    value={taskDesc}
                    onChangeText={setTaskDesc}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={[styles.label, { color: colors.text }]}>Proje</Text>
                <View style={styles.chipsRow}>
                    {projects.map((p, i) => (
                        <Pressable
                            key={p.id}
                            style={[styles.projectChip, { backgroundColor: colors.card, borderColor: colors.border }, selectedProjectId === p.id && { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], borderColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}
                            onPress={() => { setSelectedProjectId(p.id); setSelectedAssigneeId(null); }}
                        >
                            <View style={[styles.projectDot, { backgroundColor: selectedProjectId === p.id ? "#fff" : AVATAR_COLORS[i % AVATAR_COLORS.length] }]} />
                            <Text style={[styles.projectChipText, { color: colors.text }, selectedProjectId === p.id && { color: "#fff" }]}>{p.title || p.name}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Kişi Ata</Text>
                <View style={styles.chipsRow}>
                    <Pressable style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, !selectedAssigneeId && styles.chipActive]} onPress={() => setSelectedAssigneeId(null)}>
                        <Text style={[styles.chipText, { color: colors.text }, !selectedAssigneeId && styles.chipTextActive]}>Yok</Text>
                    </Pressable>
                    {members.map((m, i) => (
                        <Pressable key={m.id} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, selectedAssigneeId === m.id && styles.chipActive]} onPress={() => setSelectedAssigneeId(m.id)}>
                            <View style={[styles.miniAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                                <Text style={styles.miniAvatarText}>{m.name?.charAt(0).toUpperCase() || "?"}</Text>
                            </View>
                            <Text style={[styles.chipText, { color: colors.text }, selectedAssigneeId === m.id && styles.chipTextActive]}>{m.name}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Durum</Text>
                <View style={styles.chipsRow}>
                    {STATUS_OPTIONS.map((s) => (
                        <Pressable
                            key={s.label}
                            style={[styles.statusChip, { borderColor: s.color }, selectedStatus === s.label && { backgroundColor: s.color }]}
                            onPress={() => setSelectedStatus(s.label)}
                        >
                            <Text style={[styles.statusChipText, { color: s.color }, selectedStatus === s.label && { color: "#fff" }]}>{s.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Görev Ekle</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    content: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
    cancelLink: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
    saveLink: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
    label: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 10, marginTop: 20 },
    input: { height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB", paddingHorizontal: 16, backgroundColor: "#fff", fontSize: 15, color: "#111827" },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    projectChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff", gap: 8 },
    projectDot: { width: 8, height: 8, borderRadius: 4 },
    projectChipText: { fontSize: 13, fontWeight: "700", color: "#374151" },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff", gap: 6 },
    chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
    chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
    chipTextActive: { color: "#fff" },
    miniAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    miniAvatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
    statusChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
    statusChipText: { fontSize: 13, fontWeight: "700" },
    saveBtn: { height: 54, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginTop: 36, elevation: 6 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});