import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

/* ── Mock Projects ── */
const PROJECTS = [
    {
        id: "1",
        name: "sylas",
        sprint: "Sprint 1",
        workspace: "sylas çalışma alanı",
        description: "organizasyona ait proje raporları.",
        status: "Aktif",
        gradient: ["#3B82F6", "#2563EB"] as const,
        borderColor: "#3B82F6",
    },
    {
        id: "2",
        name: "deneme 02",
        sprint: "Sprint 1",
        workspace: "deneme 02 çalışma alanı",
        description: "organizasyona ait proje raporları.",
        status: "Aktif",
        gradient: ["#EC4899", "#DB2777"] as const,
        borderColor: "#EC4899",
    },
];

export default function RaporlarScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconBox}>
                        <MaterialIcons name="bar-chart" size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.headerTitle}>Raporlar</Text>
                </View>
                <Text style={styles.headerCount}>{PROJECTS.length} proje</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Section Title */}
                <Text style={styles.sectionTitle}>Proje Raporları</Text>
                <Text style={styles.sectionDesc}>
                    Detaylı raporu görüntülemek için bir projeye tıklayın.
                </Text>

                {/* Project Cards Grid */}
                <View style={styles.cardsGrid}>
                    {PROJECTS.map((project) => (
                        <Pressable
                            key={project.id}
                            style={styles.card}
                            onPress={() =>
                                router.push({
                                    pathname: "/proje-raporu",
                                    params: { projectName: project.name, sprint: project.sprint },
                                })
                            }
                        >
                            {/* Gradient Top Border */}
                            <View
                                style={[
                                    styles.cardTopBorder,
                                    { backgroundColor: project.borderColor },
                                ]}
                            />

                            {/* Card Content */}
                            <View style={styles.cardContent}>
                                {/* Icon + Name + Arrow */}
                                <View style={styles.cardHeader}>
                                    <View
                                        style={[
                                            styles.cardIconBox,
                                            { backgroundColor: project.gradient[0] + "20" },
                                        ]}
                                    >
                                        <MaterialIcons
                                            name="description"
                                            size={22}
                                            color={project.gradient[0]}
                                        />
                                    </View>
                                    <View style={styles.cardTitleArea}>
                                        <Text style={styles.cardName}>{project.name}</Text>
                                        <Text style={styles.cardSprint}>{project.sprint}</Text>
                                    </View>
                                    <MaterialIcons
                                        name="chevron-right"
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </View>

                                {/* Description */}
                                <Text style={styles.cardDesc}>
                                    {project.workspace} — {project.description}
                                </Text>

                                {/* Status */}
                                <View style={styles.statusRow}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>{project.status}</Text>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },
    headerCount: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },

    /* Scroll */
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },

    /* Section */
    sectionTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 6,
    },
    sectionDesc: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 24,
    },

    /* Cards Grid */
    cardsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },

    /* Card */
    card: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTopBorder: {
        height: 4,
        width: "100%",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    cardIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitleArea: {
        flex: 1,
        marginLeft: 10,
    },
    cardName: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },
    cardSprint: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 18,
        marginBottom: 14,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10B981",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#10B981",
    },
});
