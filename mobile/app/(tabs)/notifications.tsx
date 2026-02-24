import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

/* ── mock data ── */
const NOTIFICATIONS = [
    {
        id: "1",
        title: "Yeni görev atandı",
        message: "Login sayfası tasarımı görevi size atandı.",
        type: "task",
        isRead: false,
        time: "10 dk önce",
        group: "Bugün",
    },
    {
        id: "2",
        title: "Proje davetiyesi",
        message: "Mobil Uygulama projesine davet edildiniz.",
        type: "invite",
        isRead: false,
        time: "1 saat önce",
        group: "Bugün",
    },
    {
        id: "3",
        title: "Görev tamamlandı",
        message: "API Entegrasyonu projesindeki tüm görevler tamamlandı.",
        type: "complete",
        isRead: false,
        time: "3 saat önce",
        group: "Bugün",
    },
    {
        id: "4",
        title: "Son tarih yaklaşıyor",
        message: "Veritabanı şeması güncelle görevinin son tarihi yarın.",
        type: "deadline",
        isRead: true,
        time: "Dün",
        group: "Dün",
    },
    {
        id: "5",
        title: "Yeni yorum",
        message: "Proje detay sayfası görevine yeni bir yorum eklendi.",
        type: "comment",
        isRead: true,
        time: "Dün",
        group: "Dün",
    },
    {
        id: "6",
        title: "Hoş geldiniz!",
        message: "TaskiFlow'a hoş geldiniz. Projelerinizi yönetmeye başlayın.",
        type: "welcome",
        isRead: true,
        time: "3 gün önce",
        group: "Önceki",
    },
];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    task: { icon: "plus.square.fill", color: "#2563EB", bg: "#DBEAFE" },
    invite: { icon: "person.badge.plus", color: "#7C3AED", bg: "#EDE9FE" },
    complete: { icon: "checkmark.seal.fill", color: "#059669", bg: "#D1FAE5" },
    deadline: { icon: "clock.fill", color: "#EF4444", bg: "#FEE2E2" },
    comment: { icon: "text.bubble.fill", color: "#F59E0B", bg: "#FEF3C7" },
    welcome: { icon: "star.fill", color: "#2563EB", bg: "#DBEAFE" },
};

export default function NotificationsScreen() {
    const unreadCount = NOTIFICATIONS.filter((n) => !n.isRead).length;
    const groups = [...new Set(NOTIFICATIONS.map((n) => n.group))];

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Bildirimler</Text>
                    <Text style={styles.headerSub}>{unreadCount} okunmamış bildirim</Text>
                </View>
                {unreadCount > 0 && (
                    <Pressable style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Tümünü oku</Text>
                    </Pressable>
                )}
            </View>

            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                alwaysBounceVertical={true}
            >
                {groups.map((group) => (
                    <View key={group}>
                        <Text style={styles.groupLabel}>{group}</Text>
                        {NOTIFICATIONS.filter((n) => n.group === group).map((n) => {
                            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.task;
                            return (
                                <Pressable
                                    key={n.id}
                                    style={[styles.notifCard, !n.isRead && styles.notifUnread]}
                                >
                                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                                        <IconSymbol name={cfg.icon} size={20} color={cfg.color} />
                                    </View>
                                    <View style={styles.notifBody}>
                                        <View style={styles.notifTopRow}>
                                            <Text style={styles.notifTitle}>{n.title}</Text>
                                            {!n.isRead && <View style={styles.unreadDot} />}
                                        </View>
                                        <Text style={styles.notifMessage} numberOfLines={2}>
                                            {n.message}
                                        </Text>
                                        <Text style={styles.notifTime}>{n.time}</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}

                <View style={{ height: 32 }} />
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
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
    headerSub: { fontSize: 13, color: "#6B7280", marginTop: 4, fontWeight: "500" },
    markAllBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    markAllText: { color: "#fff", fontSize: 12, fontWeight: "700" },

    /* List */
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingTop: 8 },

    groupLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 20,
        marginBottom: 10,
    },

    /* Card */
    notifCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    notifUnread: {
        borderLeftWidth: 3,
        borderLeftColor: "#2563EB",
    },

    notifIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    notifBody: { flex: 1 },
    notifTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    notifTitle: { fontSize: 14, fontWeight: "700", color: "#111827", flex: 1 },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#2563EB",
        marginLeft: 8,
    },
    notifMessage: { fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 18 },
    notifTime: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
});
