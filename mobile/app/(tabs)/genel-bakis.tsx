import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Pressable,
    TextInput,
    Modal,
    Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function GenelBakisScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    // Form states
    const [workspace, setWorkspace] = useState("deneme's Workspace");
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");

    const [projects, setProjects] = useState([
        { id: '1', name: 'Deneme', owner: 'deneme', date: '23.02.2026' }
    ]);

    const handleCreateProject = () => {
        if (!projectName.trim()) return;
        setProjects([
            ...projects,
            {
                id: Date.now().toString(),
                name: projectName,
                owner: 'deneme',
                date: new Date().toLocaleDateString('tr-TR')
            }
        ]);
        setProjectName("");
        setProjectDesc("");
        setModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.welcomeText}>Hoş Geldiniz, deneme</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search & Actions */}
                <View style={styles.actionRow}>
                    <View style={styles.searchBox}>
                        <MaterialIcons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Proje kayıtlarında ara..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Pressable style={styles.newProjectBtn} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.newProjectBtnText}>Yeni Proje</Text>
                    </Pressable>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Kayıtlı Projeler</Text>
                    <View style={styles.line} />
                    <Text style={styles.sectionCount}>{projects.length} TOPLAM</Text>
                </View>

                {/* Projects Display */}
                {projects.length === 0 ? (
                    <View style={styles.emptyProjectsCard}>
                        <MaterialIcons name="web-asset" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Görüntülenecek proje bulunamadı.</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsList}>
                        {projects.map(proj => (
                            <Pressable
                                key={proj.id}
                                style={styles.projectCard}
                                onPress={() => router.push("/proje-panosu")}
                            >
                                <View style={styles.projectCardTop}>
                                    <View style={styles.projectIconBox}>
                                        <MaterialIcons name="folder" size={24} color="#fff" />
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusBadgeText}>KAYITLI</Text>
                                    </View>
                                </View>
                                <Text style={styles.projectName}>{proj.name}</Text>
                                <Text style={styles.projectOwner}>{proj.owner}</Text>

                                <View style={styles.projectCardBottom}>
                                    <View style={styles.dateRow}>
                                        <MaterialIcons name="calendar-today" size={12} color="#9CA3AF" />
                                        <Text style={styles.dateText}>{proj.date}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.openFileText}>Dosyayı Aç {">"}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {/* Bottom Stats Section */}
                <View style={styles.statsLayout}>
                    {/* Total Projects Card */}
                    <View style={styles.totalCard}>
                        <View style={styles.totalCardHeader}>
                            <Text style={styles.totalCardTitle}>TOPLAM PROJE</Text>
                            <View style={styles.folderIconLight}>
                                <MaterialIcons name="folder" size={20} color="#2563EB" />
                            </View>
                        </View>
                        <Text style={styles.totalNumber}>{projects.length}</Text>
                    </View>

                    {/* Mock Chart Card */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartCardHeader}>
                            <Text style={styles.chartCardTitle}>Proje Oluşturma Trendi</Text>
                            <View style={styles.realtimeBadge}>
                                <View style={styles.realtimeDot} />
                                <Text style={styles.realtimeText}>GERÇEK ZAMANLI</Text>
                            </View>
                        </View>
                        <View style={styles.mockChartArea}>
                            <View style={styles.yAxis}>
                                <Text style={styles.axisText}>4</Text>
                                <Text style={styles.axisText}>3</Text>
                                <Text style={styles.axisText}>2</Text>
                                <Text style={styles.axisText}>1</Text>
                                <Text style={styles.axisText}>0</Text>
                            </View>
                            <View style={styles.chartLines}>
                                {[4, 3, 2, 1, 0].map((_, i) => (
                                    <View key={i} style={styles.hLine} />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* New Project Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yeni Proje Kaydı</Text>
                            <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <MaterialIcons name="close" size={20} color="#374151" />
                            </Pressable>
                        </View>

                        <Text style={styles.label}>ÇALIŞMA ALANI SEÇİN</Text>
                        <TextInput
                            style={[styles.modalInput, styles.disabledInput]}
                            value={workspace}
                            editable={false}
                        />

                        <Text style={styles.label}>PROJE ADI</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={projectName}
                            onChangeText={setProjectName}
                            placeholder="E-Ticaret Web Sitesi..."
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={styles.label}>AÇIKLAMA</Text>
                        <TextInput
                            style={[styles.modalInput, styles.textArea]}
                            value={projectDesc}
                            onChangeText={setProjectDesc}
                            placeholder="Projenin temel hedefleri..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                        />

                        <Pressable
                            style={styles.submitBtn}
                            onPress={handleCreateProject}
                        >
                            <Text style={styles.submitBtnText}>Projeyi Onayla</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F7F9FC" },

    topHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 40 : 20,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: { marginRight: 16 },
    welcomeText: { fontSize: 20, fontWeight: "700", color: "#111827" },

    scrollContent: { padding: 20, flexGrow: 1 },

    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        gap: 12,
    },
    searchBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: { flex: 1, marginLeft: 8, color: "#111827", fontSize: 14 },
    newProjectBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563EB",
        height: 48,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    newProjectBtnText: { color: "#fff", fontWeight: "600", marginLeft: 4 },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    line: { flex: 1, height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 },
    sectionCount: { fontSize: 12, fontWeight: "600", color: "#6B7280" },

    emptyProjectsCard: {
        height: 160,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyText: { marginTop: 12, color: "#9CA3AF", fontSize: 14 },

    projectsList: { paddingRight: 20, marginBottom: 24, gap: 16 },
    projectCard: {
        width: 250,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    projectCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    projectIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
    },
    statusBadge: {
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: { color: "#4F46E5", fontSize: 10, fontWeight: "700" },
    projectName: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
    projectOwner: { fontSize: 13, color: "#6B7280", marginBottom: 20 },
    projectCardBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 16,
    },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    dateText: { fontSize: 12, color: "#6B7280" },
    openFileText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },

    statsLayout: { marginBottom: 32, gap: 16 },
    totalCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    totalCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    totalCardTitle: { fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5 },
    folderIconLight: {
        backgroundColor: "#EEF2FF",
        padding: 8,
        borderRadius: 8,
    },
    totalNumber: { fontSize: 28, fontWeight: "800", color: "#111827" },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chartCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    chartCardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
    realtimeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    realtimeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#3B82F6" },
    realtimeText: { fontSize: 10, fontWeight: "600", color: "#4B5563" },

    mockChartArea: { flexDirection: "row", height: 160 },
    yAxis: { justifyContent: "space-between", paddingRight: 12, paddingVertical: 8 },
    axisText: { fontSize: 10, color: "#9CA3AF" },
    chartLines: { flex: 1, justifyContent: "space-between", paddingVertical: 14 },
    hLine: { height: 1, backgroundColor: "#F3F4F6", borderStyle: "dashed" },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
    closeBtn: { padding: 4 },

    label: { fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
    modalInput: {
        height: 48,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: "#111827",
    },
    disabledInput: { color: "#6B7280" },
    textArea: { height: 100, paddingTop: 16 },

    submitBtn: {
        backgroundColor: "#2563EB",
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
