import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 48;

/* ══════════════════════════════════════════════
   TAB NAMES
   ══════════════════════════════════════════════ */
const TABS = [
    { key: "burndown", label: "Burndown", icon: "trending-down" },
    { key: "burnup", label: "Burnup", icon: "trending-up" },
    { key: "sprint", label: "Sprint", icon: "assignment" },
    { key: "velocity", label: "Velocity", icon: "speed" },
    { key: "flow", label: "Flow", icon: "waves" },
    { key: "control", label: "Control", icon: "tune" },
    { key: "crvsres", label: "Cr. vs Res.", icon: "compare-arrows" },
    { key: "pie", label: "Pie Chart", icon: "pie-chart" },
    { key: "avgage", label: "Avg. Age", icon: "access-time" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ══════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════ */
const DAY_LABELS = ["Gün 1", "Gün 2", "Gün 3", "Gün 4", "Gün 5", "Gün 6", "Gün 7", "Gün 8", "Gün 9"];

const BURNDOWN_ACTUAL = [80, 75, 68, 63, 58, 50, 44, 38, 28];
const BURNDOWN_IDEAL = [80, 70, 60, 50, 40, 30, 20, 10, 0];

const BURNUP_COMPLETED = [0, 5, 10, 17, 22, 30, 34, 40, 52];
const BURNUP_TOTAL = [80, 80, 80, 80, 80, 80, 80, 80, 80];

const VELOCITY_SPRINTS = ["Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "Sprint 6", "Sprint 7"];
const VELOCITY_COMMITMENT = [60, 65, 58, 70, 68, 80];
const VELOCITY_COMPLETED = [55, 60, 41, 70, 70, 52];

const SPRINT_TASKS = [
    { key: "PROJ-101", title: "Login sayfası tasarımı", status: "Tamamlandı", statusColor: "#10B981", priority: "Yüksek", priorityColor: "#EF4444", assignee: "Ahmet K.", avatar: "AK", avatarBg: "#3B82F6", sp: 5 },
    { key: "PROJ-102", title: "API endpoint güvenlik testi", status: "Tamamlandı", statusColor: "#10B981", priority: "Yüksek", priorityColor: "#EF4444", assignee: "Zeynep M.", avatar: "ZM", avatarBg: "#10B981", sp: 8 },
    { key: "PROJ-103", title: "Dashboard veri entegrasyonu", status: "Devam", statusColor: "#F59E0B", priority: "Yüksek", priorityColor: "#EF4444", assignee: "Burak T.", avatar: "BT", avatarBg: "#8B5CF6", sp: 13 },
    { key: "PROJ-104", title: "Kullanıcı profil sayfası", status: "Devam", statusColor: "#F59E0B", priority: "Orta", priorityColor: "#F59E0B", assignee: "Selin A.", avatar: "SA", avatarBg: "#EC4899", sp: 5 },
    { key: "PROJ-105", title: "Email bildirim sistemi", status: "Yapılacak", statusColor: "#6B7280", priority: "Orta", priorityColor: "#F59E0B", assignee: "Ahmet K.", avatar: "AK", avatarBg: "#3B82F6", sp: 8 },
];

const PIE_DURUM = [
    { name: "Tamamlanan", count: 8, color: "#10B981", legendFontColor: "#94A3B8", legendFontSize: 11 },
    { name: "Devam Eden", count: 4, color: "#3B82F6", legendFontColor: "#94A3B8", legendFontSize: 11 },
    { name: "Yapılacak", count: 3, color: "#94A3B8", legendFontColor: "#94A3B8", legendFontSize: 11 },
    { name: "Bloke", count: 1, color: "#EF4444", legendFontColor: "#94A3B8", legendFontSize: 11 },
];

const PIE_ONCELIK = [
    { name: "Yüksek", count: 6, color: "#EF4444", legendFontColor: "#94A3B8", legendFontSize: 11 },
    { name: "Orta", count: 7, color: "#F59E0B", legendFontColor: "#94A3B8", legendFontSize: 11 },
    { name: "Düşük", count: 3, color: "#10B981", legendFontColor: "#94A3B8", legendFontSize: 11 },
];

const FLOW_LABELS = ["22 Oca", "24 Oca", "26 Oca", "28 Oca", "30 Oca"];

const AVG_AGE_CATEGORIES = [
    { label: "Yapılacak", value: 8, maxValue: 16 },
    { label: "Devam Eden", value: 6, maxValue: 16 },
    { label: "İncelemede", value: 4, maxValue: 16 },
    { label: "Bloke", value: 16, maxValue: 16 },
];

const AVG_AGE_TASKS = [
    { key: "PROJ-112", title: "Kullanıcı onboarding akışı", age: 24, status: "Devam", statusColor: "#F59E0B" },
    { key: "PROJ-106", title: "Rapor export özelliği", age: 14, status: "Bloke", statusColor: "#EF4444" },
    { key: "PROJ-111", title: "CI/CD pipeline iyileştirme", age: 11, status: "Yapılacak", statusColor: "#6B7280" },
    { key: "PROJ-105", title: "Email bildirim sistemi", age: 10, status: "Yapılacak", statusColor: "#6B7280" },
    { key: "PROJ-110", title: "Unit test kapsamı artırma", age: 9, status: "Yapılacak", statusColor: "#6B7280" },
    { key: "PROJ-103", title: "Dashboard veri entegrasyonu", age: 7, status: "Devam", statusColor: "#F59E0B" },
];

const CR_VS_RES_LABELS = ["Eyl", "Eki", "Kas", "Ara", "Oca", "Şub"];
const CR_OPENED = [14, 23, 15, 14, 12, 4];
const CR_RESOLVED = [13, 16, 14, 15, 12, 8];

const CONTROL_DATA = [2, 2, 4, 2, 5, 11, 3, 2, 4, 8, 3, 4, 3, 3, 3, 3, 2, 2, 3];

/* ══════════════════════════════════════════════
   CHART CONFIG
   ══════════════════════════════════════════════ */
const darkChartConfig = {
    backgroundColor: "#1E293B",
    backgroundGradientFrom: "#1E293B",
    backgroundGradientTo: "#1E293B",
    decimalCount: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => "#94A3B8",
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#3B82F6" },
    propsForBackgroundLines: { stroke: "#334155", strokeDasharray: "" },
    style: { borderRadius: 16 },
};

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function ProjeRaporuScreen() {
    const router = useRouter();
    const { projectName = "deneme 02", sprint = "Sprint 1" } =
        useLocalSearchParams<{ projectName: string; sprint: string }>();
    const [tab, setTab] = useState<TabKey>("burndown");

    const activeTab = TABS.find((t) => t.key === tab)!;

    /* ── Stats per tab ── */
    const renderStats = () => {
        switch (tab) {
            case "burndown":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="TOPLAM SP" value="80" sub="Sprint 7" />
                        <StatCard label="KALAN" value="28" sub="story point" color="#3B82F6" />
                        <StatCard label="TAMAMLANAN" value="52" sub="story point" color="#10B981" />
                        <StatCard label="SPRINT DURUMU" value="🌙 Geride" sub="4 gün kaldı" />
                    </View>
                );
            case "burnup":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="TOPLAM HEDEF" value="80" />
                        <StatCard label="TAMAMLANAN" value="52" color="#10B981" />
                        <StatCard label="KAPSAM DEĞİŞİMİ" value="+8" sub="SP eklendi" color="#F59E0B" />
                        <StatCard label="İLERLEME" value="65%" color="#3B82F6" />
                    </View>
                );
            case "sprint":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="TAMAMLANAN" value="8" sub="görev" color="#10B981" />
                        <StatCard label="DEVAM EDEN" value="4" color="#F59E0B" />
                        <StatCard label="YAPILACAK" value="3" color="#6366F1" />
                        <StatCard label="BLOKE" value="1" color="#EF4444" />
                    </View>
                );
            case "velocity":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="ORT. VELOCITY" value="58" sub="SP / sprint" />
                        <StatCard label="EN YÜKSEK" value="72" color="#10B981" />
                        <StatCard label="EN DÜŞÜK" value="41" color="#EF4444" />
                        <StatCard label="TAHMİN (S8)" value="60" sub="SP önerisi" />
                    </View>
                );
            case "flow":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="YAPILACAK" value="12" />
                        <StatCard label="DEVAM EDEN" value="7" color="#F59E0B" />
                        <StatCard label="İNCELEMEDE" value="5" color="#6366F1" />
                        <StatCard label="TAMAMLANAN" value="18" color="#10B981" />
                    </View>
                );
            case "control":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="ORT. CYCLE TIME" value="3.2" sub="gün" />
                        <StatCard label="MEDYAN" value="2.8" sub="gün" color="#3B82F6" />
                        <StatCard label="MAKSİMUM" value="11" sub="gün" color="#EF4444" />
                        <StatCard label="ANORMAL" value="3" sub="görev" color="#F59E0B" />
                    </View>
                );
            case "crvsres":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="TOPLAM AÇILAN" value="94" />
                        <StatCard label="TOPLAM ÇÖZÜLEN" value="78" color="#10B981" />
                        <StatCard label="BİRİKMİŞ" value="16" color="#EF4444" />
                        <StatCard label="ÇÖZÜM ORANI" value="83%" color="#3B82F6" />
                    </View>
                );
            case "pie":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="TOPLAM GÖREV" value="16" />
                        <StatCard label="TAMAMLANAN" value="8" color="#10B981" />
                        <StatCard label="DEVAM EDEN" value="4" color="#3B82F6" />
                        <StatCard label="YAPILACAK" value="3" />
                    </View>
                );
            case "avgage":
                return (
                    <View style={styles.statsRow}>
                        <StatCard label="ORT. YAŞ" value="8.4" sub="gün" />
                        <StatCard label="EN YAŞLI" value="24" sub="gün" color="#EF4444" />
                        <StatCard label="KRİTİK (>14G)" value="1" color="#F59E0B" />
                        <StatCard label="TOPLAM AÇIK" value="8" />
                    </View>
                );
        }
    };

    /* ── Chart per tab ── */
    const renderChart = () => {
        switch (tab) {
            case "burndown":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Burndown Chart — Sprint 7</Text>
                        <Text style={styles.chartSub}>Kalan iş vs ideal ilerleme çizgisi</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: DAY_LABELS,
                                    datasets: [
                                        { data: BURNDOWN_ACTUAL, color: () => "#3B82F6", strokeWidth: 2 },
                                        { data: BURNDOWN_IDEAL, color: () => "#F59E0B", strokeWidth: 2, withDots: false },
                                    ],
                                    legend: ["Gerçekleşen", "İdeal"],
                                }}
                                width={CHART_W + 40}
                                height={220}
                                chartConfig={darkChartConfig}
                                bezier
                                style={styles.chart}
                                withInnerLines
                                withOuterLines={false}
                            />
                        </ScrollView>
                    </View>
                );

            case "burnup":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Burnup Chart — Sprint 7</Text>
                        <Text style={styles.chartSub}>Tamamlanan iş & kapsam çizgisi</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: DAY_LABELS,
                                    datasets: [
                                        { data: BURNUP_COMPLETED, color: () => "#3B82F6", strokeWidth: 2 },
                                        { data: BURNUP_TOTAL, color: () => "#F59E0B", strokeWidth: 2, withDots: false },
                                    ],
                                    legend: ["Tamamlanan", "Toplam Kapsam"],
                                }}
                                width={CHART_W + 40}
                                height={220}
                                chartConfig={darkChartConfig}
                                bezier
                                style={styles.chart}
                                withInnerLines
                                withOuterLines={false}
                            />
                        </ScrollView>
                    </View>
                );

            case "sprint":
                return (
                    <View style={styles.chartCard}>
                        <View style={styles.sprintHeader}>
                            <View>
                                <Text style={styles.chartTitle}>Sprint 7 — Görev Listesi</Text>
                            </View>
                            <Pressable style={styles.addTaskBtn}>
                                <Text style={styles.addTaskBtnText}>+ Görev Ekle</Text>
                            </Pressable>
                        </View>

                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, { width: 80 }]}>ANAHTAR</Text>
                            <Text style={[styles.th, { flex: 1 }]}>ÖZET</Text>
                            <Text style={[styles.th, { width: 85 }]}>DURUM</Text>
                            <Text style={[styles.th, { width: 60 }]}>SP</Text>
                        </View>

                        {/* Table Rows */}
                        {SPRINT_TASKS.map((task) => (
                            <View key={task.key} style={styles.tableRow}>
                                <Text style={[styles.tdKey, { width: 80 }]}>{task.key}</Text>
                                <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>{task.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: task.statusColor + "20" }]}>
                                    <Text style={[styles.statusBadgeText, { color: task.statusColor }]}>
                                        {task.status}
                                    </Text>
                                </View>
                                <Text style={[styles.td, { width: 60, textAlign: "center" }]}>{task.sp}</Text>
                            </View>
                        ))}
                    </View>
                );

            case "velocity":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Velocity Chart — Son 6 Sprint</Text>
                        <Text style={styles.chartSub}>Sprint bazlı taahhüt vs tamamlanan SP</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart
                                data={{
                                    labels: VELOCITY_SPRINTS,
                                    datasets: [{ data: VELOCITY_COMMITMENT }],
                                }}
                                width={CHART_W + 40}
                                height={240}
                                chartConfig={{
                                    ...darkChartConfig,
                                    barPercentage: 0.5,
                                    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                                }}
                                style={styles.chart}
                                showValuesOnTopOfBars
                                withInnerLines
                                yAxisLabel=""
                                yAxisSuffix=""
                            />
                        </ScrollView>
                        {/* Legend */}
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#60A5FA" }]} />
                                <Text style={styles.legendText}>Taahhüt</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#1E40AF" }]} />
                                <Text style={styles.legendText}>Tamamlanan</Text>
                            </View>
                        </View>
                    </View>
                );

            case "flow":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Cumulative Flow Diagram</Text>
                        <Text style={styles.chartSub}>İş durumu dağılımı (son 2 hafta)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: FLOW_LABELS,
                                    datasets: [
                                        { data: [2, 6, 10, 14, 18], color: () => "#10B981", strokeWidth: 2 },
                                        { data: [1, 4, 8, 12, 15], color: () => "#F59E0B", strokeWidth: 2 },
                                        { data: [3, 8, 14, 20, 25], color: () => "#3B82F6", strokeWidth: 2 },
                                        { data: [5, 12, 22, 35, 45], color: () => "#94A3B8", strokeWidth: 2 },
                                    ],
                                    legend: ["Tamamlanan", "İncelemede", "Devam Eden", "Yapılacak"],
                                }}
                                width={CHART_W + 40}
                                height={220}
                                chartConfig={darkChartConfig}
                                bezier
                                style={styles.chart}
                                withInnerLines
                                withOuterLines={false}
                            />
                        </ScrollView>
                    </View>
                );

            case "control":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Control Chart — Cycle Time</Text>
                        <Text style={styles.chartSub}>Her görevin tamamlanma süresi</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: ["", "2", "", "4", "", "6", "", "8", "", "10", "", "12", "", "14", "", "", "", "18", ""],
                                    datasets: [
                                        { data: CONTROL_DATA, color: () => "#3B82F6", strokeWidth: 0 },
                                        { data: Array(19).fill(8), color: () => "#EF4444", strokeWidth: 1, withDots: false },
                                        { data: Array(19).fill(3), color: () => "#10B981", strokeWidth: 1, withDots: false },
                                    ],
                                }}
                                width={CHART_W + 80}
                                height={220}
                                chartConfig={{
                                    ...darkChartConfig,
                                    propsForDots: { r: "5", strokeWidth: "0", fill: "#3B82F6" },
                                    propsForBackgroundLines: { stroke: "#334155", strokeDasharray: "4,4" },
                                }}
                                style={styles.chart}
                                withInnerLines
                                withOuterLines={false}
                            />
                        </ScrollView>
                        {/* Legend */}
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                                <Text style={styles.legendText}>ÜCL</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                                <Text style={styles.legendText}>OCL</Text>
                            </View>
                        </View>
                    </View>
                );

            case "crvsres":
                return (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Created vs Resolved Issues</Text>
                        <Text style={styles.chartSub}>Aylık açılan vs çözülen görevler</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: CR_VS_RES_LABELS,
                                    datasets: [
                                        { data: CR_OPENED, color: () => "#EF4444", strokeWidth: 2 },
                                        { data: CR_RESOLVED, color: () => "#10B981", strokeWidth: 2 },
                                    ],
                                    legend: ["Açılan", "Çözülen"],
                                }}
                                width={CHART_W + 40}
                                height={220}
                                chartConfig={{
                                    ...darkChartConfig,
                                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
                                }}
                                bezier
                                style={styles.chart}
                                withInnerLines
                                withOuterLines={false}
                            />
                        </ScrollView>
                    </View>
                );

            case "pie":
                return (
                    <View style={{ gap: 12 }}>
                        {/* Durum Dağılımı */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Durum Dağılımı</Text>
                            <PieChart
                                data={PIE_DURUM.map((d) => ({ ...d, population: d.count }))}
                                width={CHART_W}
                                height={200}
                                chartConfig={darkChartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                hasLegend={true}
                                style={styles.chart}
                            />
                        </View>
                        {/* Öncelik Dağılımı */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Öncelik Dağılımı</Text>
                            <PieChart
                                data={PIE_ONCELIK.map((d) => ({ ...d, population: d.count }))}
                                width={CHART_W}
                                height={200}
                                chartConfig={darkChartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                hasLegend={true}
                                style={styles.chart}
                            />
                        </View>
                    </View>
                );

            case "avgage":
                return (
                    <View style={{ gap: 12 }}>
                        {/* Horizontal Bar Chart */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Average Age Report</Text>
                            <Text style={styles.chartSub}>Durum bazında ortalama yaş</Text>
                            <View style={{ marginTop: 8 }}>
                                {AVG_AGE_CATEGORIES.map((cat, i) => (
                                    <View key={i} style={styles.hBarRow}>
                                        <Text style={styles.hBarLabel}>{cat.label}</Text>
                                        <View style={styles.hBarTrack}>
                                            <View
                                                style={[
                                                    styles.hBarFill,
                                                    { width: `${(cat.value / cat.maxValue) * 100}%` },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.hBarValue}>{cat.value} gün</Text>
                                    </View>
                                ))}
                                {/* X Axis labels */}
                                <View style={styles.hBarXAxis}>
                                    {["0 gün", "4 gün", "8 gün", "12 gün", "16 gün"].map((l, i) => (
                                        <Text key={i} style={styles.hBarXLabel}>{l}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Uzun Süredir Bekleyen Görevler */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Uzun Süredir Bekleyen Görevler</Text>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.th, { width: 80 }]}>ANAHTAR</Text>
                                <Text style={[styles.th, { flex: 1 }]}>ÖZET</Text>
                                <Text style={[styles.th, { width: 50 }]}>YAŞ</Text>
                                <Text style={[styles.th, { width: 75 }]}>DURUM</Text>
                            </View>
                            {AVG_AGE_TASKS.map((task) => (
                                <View key={task.key} style={styles.tableRow}>
                                    <Text style={[styles.tdKey, { width: 80 }]}>{task.key}</Text>
                                    <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>{task.title}</Text>
                                    <Text style={[styles.td, { width: 50, color: "#F59E0B", fontWeight: "700" }]}>{task.age}g</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: task.statusColor + "20", width: 75 }]}>
                                        <Text style={[styles.statusBadgeText, { color: task.statusColor }]}>{task.status}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safe} edges={["top"]}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialIcons name="arrow-back" size={22} color="#fff" />
                        </Pressable>
                        <View style={styles.breadcrumb}>
                            <Text style={styles.breadcrumbText}>Raporlar</Text>
                            <MaterialIcons name="chevron-right" size={16} color="#64748B" />
                            <Text style={styles.breadcrumbBold}>{projectName}</Text>
                            <MaterialIcons name="chevron-right" size={16} color="#64748B" />
                            <Text style={styles.breadcrumbText}>{activeTab.label}</Text>
                        </View>
                        <View style={styles.sprintBadge}>
                            <View style={styles.sprintDot} />
                            <Text style={styles.sprintBadgeText}>
                                {projectName} · {sprint}
                            </Text>
                        </View>
                    </View>

                    {/* ── Tab Bar ── */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsRow}
                    >
                        {TABS.map((t) => (
                            <Pressable
                                key={t.key}
                                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                                onPress={() => setTab(t.key)}
                            >
                                <MaterialIcons
                                    name={t.icon as any}
                                    size={14}
                                    color={tab === t.key ? "#3B82F6" : "#64748B"}
                                />
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        tab === t.key && styles.tabLabelActive,
                                    ]}
                                >
                                    {t.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Content ── */}
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {renderStats()}
                    {renderChart()}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

/* ── Stat Card Component ── */
function StatCard({
    label,
    value,
    sub,
    color,
}: {
    label: string;
    value: string;
    sub?: string;
    color?: string;
}) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
            {sub && <Text style={styles.statSub}>{sub}</Text>}
        </View>
    );
}

/* ══════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════ */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F172A" },
    safe: { flex: 1 },

    /* Header */
    header: {
        backgroundColor: "#1E293B",
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    headerTop: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#334155",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    breadcrumb: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 10,
    },
    breadcrumbText: { fontSize: 13, color: "#64748B" },
    breadcrumbBold: { fontSize: 13, color: "#F1F5F9", fontWeight: "700" },

    sprintBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#334155",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    sprintDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10B981",
    },
    sprintBadgeText: { fontSize: 12, color: "#CBD5E1", fontWeight: "600" },

    /* Tabs */
    tabsRow: {
        paddingHorizontal: 16,
        gap: 4,
        paddingBottom: 0,
    },
    tabBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabBtnActive: {
        borderBottomColor: "#3B82F6",
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    tabLabelActive: {
        color: "#3B82F6",
    },

    /* Content */
    content: {
        padding: 16,
    },

    /* Stats */
    statsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: (SCREEN_W - 62) / 2,
        backgroundColor: "#1E293B",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#334155",
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "900",
        color: "#F1F5F9",
    },
    statSub: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },

    /* Chart Card */
    chartCard: {
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#F1F5F9",
        marginBottom: 4,
    },
    chartSub: {
        fontSize: 12,
        color: "#64748B",
        marginBottom: 16,
    },
    chart: {
        borderRadius: 12,
        marginLeft: -8,
    },

    /* Sprint Table */
    sprintHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    addTaskBtn: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    addTaskBtnText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
        gap: 8,
    },
    th: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1E293B50",
        gap: 8,
    },
    tdKey: {
        fontSize: 12,
        fontWeight: "700",
        color: "#3B82F6",
    },
    td: {
        fontSize: 12,
        color: "#CBD5E1",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        width: 85,
        alignItems: "center",
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },

    /* Legend */
    legendRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginTop: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "600",
    },

    /* Horizontal Bar (Avg Age) */
    hBarRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        gap: 10,
    },
    hBarLabel: {
        width: 85,
        fontSize: 12,
        color: "#94A3B8",
        textAlign: "right",
    },
    hBarTrack: {
        flex: 1,
        height: 22,
        backgroundColor: "#334155",
        borderRadius: 6,
        overflow: "hidden",
    },
    hBarFill: {
        height: "100%",
        backgroundColor: "#60A5FA",
        borderRadius: 6,
    },
    hBarValue: {
        width: 50,
        fontSize: 11,
        color: "#64748B",
    },
    hBarXAxis: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 95,
        marginTop: 4,
    },
    hBarXLabel: {
        fontSize: 10,
        color: "#475569",
    },
});
