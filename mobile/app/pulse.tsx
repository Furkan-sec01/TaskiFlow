import React, { useState, useEffect, useCallback } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    Pressable, ActivityIndicator, Alert, Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Polyline } from "react-native-svg";

const API = "http://192.168.1.128:5001/api";

async function apiFetch(path: string, options: any = {}) {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Hata");
    return data;
}

function MiniChart() {
    const points = [0, 3, 1, 4, 2, 5, 3].map((v, i) => `${i * 10},${20 - v * 3}`).join(" ");
    return (
        <Svg width={60} height={24}>
            <Polyline points={points} fill="none" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export default function PulseScreen() {
    const router = useRouter();
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            const data = await apiFetch(`/reports/${projectId}`);
            setReport(data);
        } catch (err: any) {
            Alert.alert("Hata", err.message);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator color="#6366F1" size="large" />
                </View>
            </SafeAreaView>
        );
    }

    const members: any[] = report?.memberStats || [];
    const totalTasks = report?.totalTasks || 0;
    const weeklyAdded = report?.weeklyAdded || 0;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.headerTitle}>Pulse</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Haftanın Nabzı */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💓 Haftanın Nabzı</Text>
                    {members.length === 0 ? (
                        <Text style={styles.emptyText}>Henüz görev atanmamış</Text>
                    ) : (
                        members.map((m: any, i: number) => (
                            <View key={i} style={styles.memberRow}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>
                                        {(m.name || "?")[0].toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.memberName}>{m.name}</Text>
                                    <Text style={styles.memberSub}>Görevler: {m.count} tamamlandı</Text>
                                </View>
                                <MiniChart />
                            </View>
                        ))
                    )}
                </View>

                {/* Toplam Görevler */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Toplam Görevler</Text>
                    <Text style={styles.bigNumber}>{totalTasks}</Text>
                    <Text style={styles.bigNumberSub}>Bu hafta {weeklyAdded} görev eklendi</Text>
                </View>

                {/* En Aktif Kullanıcılar */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏆 En Aktif Kullanıcılar</Text>
                    {members.length === 0 ? (
                        <Text style={styles.emptyText}>Henüz veri yok</Text>
                    ) : (
                        <View style={styles.activeGrid}>
                            {members.slice(0, 4).map((m: any, i: number) => (
                                <View key={i} style={styles.activeCard}>
                                    <View style={[styles.activeAvatar, { backgroundColor: i === 0 ? "#6366F1" : i === 1 ? "#F59E0B" : "#22C55E" }]}>
                                        <Text style={styles.activeAvatarText}>
                                            {(m.name || "?")[0].toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.activeName} numberOfLines={1}>{m.name}</Text>
                                    <Text style={styles.activeSub}>{m.count} tamamlandı</Text>
                                    <MiniChart />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Proje Hızı */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚀 Proje Hızı ve Tamamlanma</Text>
                    <View style={styles.rateRow}>
                        <View style={styles.rateBox}>
                            <Text style={styles.rateNumber}>{report?.completionRate || 0}%</Text>
                            <Text style={styles.rateSub}>Tamamlanma</Text>
                        </View>
                        <View style={styles.rateBox}>
                            <Text style={styles.rateNumber}>{report?.completedCount || 0}</Text>
                            <Text style={styles.rateSub}>Tamamlanan</Text>
                        </View>
                        <View style={styles.rateBox}>
                            <Text style={styles.rateNumber}>{report?.overdueTasks || 0}</Text>
                            <Text style={styles.rateSub}>Geciken</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F7F9FC" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 40 : 16,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
    loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: 16 },
    card: {
        backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 16 },
    memberRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    memberAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center",
    },
    memberAvatarText: { color: "#fff", fontSize: 16, fontWeight: "900" },
    memberName: { fontSize: 14, fontWeight: "700", color: "#111827" },
    memberSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    emptyText: { color: "#9CA3AF", fontSize: 13, textAlign: "center", paddingVertical: 12 },
    bigNumber: { fontSize: 48, fontWeight: "900", color: "#111827" },
    bigNumberSub: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
    activeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    activeCard: {
        width: "47%", backgroundColor: "#F8FAFC", borderRadius: 16,
        padding: 14, alignItems: "center", gap: 6,
    },
    activeAvatar: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: "center", justifyContent: "center",
    },
    activeAvatarText: { color: "#fff", fontSize: 18, fontWeight: "900" },
    activeName: { fontSize: 13, fontWeight: "700", color: "#111827" },
    activeSub: { fontSize: 11, color: "#9CA3AF" },
    rateRow: { flexDirection: "row", justifyContent: "space-around" },
    rateBox: { alignItems: "center", gap: 4 },
    rateNumber: { fontSize: 28, fontWeight: "900", color: "#6366F1" },
    rateSub: { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },
});