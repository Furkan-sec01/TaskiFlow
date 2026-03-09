import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const PROJECTS = [
    { id: "1", title: "Mobil Uygulama", color: "#2563EB" },
    { id: "2", title: "Web Sitesi", color: "#E11D48" },
    { id: "3", title: "Backend API", color: "#059669" },
];

const TEAM_BY_PROJECT: Record<string, { name: string; initial: string; color: string }[]> = {
    "1": [
        { name: "Abdelbaky", initial: "A", color: "#2563EB" },
        { name: "Semra", initial: "S", color: "#7C3AED" },
        { name: "Helin", initial: "H", color: "#7C3AED" },
    ],
    "2": [
        { name: "Talha", initial: "T", color: "#7C3AED" },
        { name: "Aleyna", initial: "A", color: "#7C3AED" },
        { name: "Feyza", initial: "F", color: "#7C3AED" },
    ],
    "3": [{ name: "Furkan", initial: "F", color: "#059669" }],
};

const STATUS_OPTIONS = [
    { label: "Yapılacak", color: "#F59E0B" },
    { label: "Devam Ediyor", color: "#2563EB" },
    { label: "Tamamlandı", color: "#10B981" },
];

export default function AddTaskScreen() {
    const router = useRouter();
    const [taskName, setTaskName] = useState("");
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [selectedStatus, setSelectedStatus] = useState("Yapılacak");
    const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

    const team = TEAM_BY_PROJECT[selectedProject.id] || [];

    const handleSave = () => {
        if (!taskName.trim()) {
            Alert.alert("Hata", "Görev adı boş olamaz.");
            return;
        }
        Alert.alert("Başarılı ✅", `"${taskName}" görevi "${selectedProject.title}" projesine eklendi.`, [
            { text: "Tamam", onPress: () => router.back() },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces alwaysBounceVertical>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.cancelLink}>İptal</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Yeni Görev</Text>
                    <Pressable onPress={handleSave}>
                        <Text style={styles.saveLink}>Kaydet</Text>
                    </Pressable>
                </View>

                {/* ── Task Name ── */}
                <Text style={styles.label}>Görev Adı</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Görev adını yaz..."
                    placeholderTextColor="#9CA3AF"
                    value={taskName}
                    onChangeText={setTaskName}
                    autoFocus
                />

                {/* ── Project Selection ── */}
                <Text style={styles.label}>Proje</Text>
                <View style={styles.chipsRow}>
                    {PROJECTS.map((p) => (
                        <Pressable
                            key={p.id}
                            style={[styles.projectChip, selectedProject.id === p.id && { backgroundColor: p.color, borderColor: p.color }]}
                            onPress={() => { setSelectedProject(p); setSelectedAssignee(null); }}
                        >
                            <View style={[styles.projectDot, { backgroundColor: selectedProject.id === p.id ? "#fff" : p.color }]} />
                            <Text style={[styles.projectChipText, selectedProject.id === p.id && { color: "#fff" }]}>{p.title}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* ── Assignee ── */}
                <Text style={styles.label}>Kişi Ata</Text>
                <View style={styles.chipsRow}>
                    <Pressable style={[styles.chip, !selectedAssignee && styles.chipActive]} onPress={() => setSelectedAssignee(null)}>
                        <Text style={[styles.chipText, !selectedAssignee && styles.chipTextActive]}>Yok</Text>
                    </Pressable>
                    {team.map((m, i) => (
                        <Pressable key={i} style={[styles.chip, selectedAssignee === m.initial && styles.chipActive]} onPress={() => setSelectedAssignee(m.initial)}>
                            <View style={[styles.miniAvatar, { backgroundColor: m.color }]}>
                                <Text style={styles.miniAvatarText}>{m.initial}</Text>
                            </View>
                            <Text style={[styles.chipText, selectedAssignee === m.initial && styles.chipTextActive]}>{m.name}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* ── Status ── */}
                <Text style={styles.label}>Durum</Text>
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

                {/* ── Save Button ── */}
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Görev Ekle</Text>
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

    saveBtn: { height: 54, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginTop: 36, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
