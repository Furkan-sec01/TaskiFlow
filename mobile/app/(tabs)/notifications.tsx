import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

/* =====================================================
   🌐 API AYARI
   ===================================================== */

const LAN_IP = "http://192.168.100.23:5000"; // ← login.tsx ile aynı IP
const API_BASE =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : LAN_IP;

const API_URL = `${API_BASE}/api`;

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
};

type FilterKey = "ALL" | "UNREAD" | "ALERTS";

export default function BildirimlerScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const intervalRef = useRef<any>(null);

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    return t;
  };

  const fetchNotifications = useCallback(async (tParam?: string | null) => {
    const t = tParam ?? token ?? (await AsyncStorage.getItem("token"));
    if (!t) {
      setFirstLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Bildirimler alınamadı:", err);
    } finally {
      setFirstLoading(false);
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      await fetchNotifications(t);

      intervalRef.current = setInterval(() => {
        fetchNotifications(t);
      }, 60000);
    })();

    return () => clearInterval(intervalRef.current);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (filter === "ALL") return notifications;
    if (filter === "UNREAD") return notifications.filter(n => n.isRead === false);
    return notifications.filter(n =>
      (n.type || "").toUpperCase().includes("ALERT") ||
      (n.type || "").toUpperCase().includes("UYARI")
    );
  }, [notifications, filter]);

  const allReadText = useMemo(() => {
    const anyUnread = notifications.some(n => n.isRead === false);
    return anyUnread ? "Okunmamış bildirimlerin var" : "Tüm bildirimler okundu";
  }, [notifications]);

  const markAsRead = async (id: string) => {
    if (!token) return;

    setLoading(true);
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    setLoading(false);
  };

  const markAllAsRead = async () => {
    if (!token) return;

    setLoading(true);
    await fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setLoading(false);
  };

  const Chip = ({ label, active, onPress }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipPassive,
      ]}
    >
      <Text style={active ? styles.chipTextActive : styles.chipTextPassive}>
        {label}
      </Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.msg}>{item.message}</Text>
        </View>

        <Pressable onPress={() => markAsRead(item.id)}>
          <MaterialIcons name="done-all" size={20} color="#2563EB" />
        </Pressable>
      </View>
    </View>
  );

  if (firstLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <MaterialIcons name="notifications-none" size={22} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Bildirimler</Text>
              <Text style={styles.headerSub}>{allReadText}</Text>
            </View>
          </View>
        </View>

        {/* FILTERS ALT ALTA */}
        <View style={styles.filtersColumn}>
          <View style={styles.filterIcon}>
            <MaterialIcons name="tune" size={18} color="#9CA3AF" />
          </View>

          <Chip label="Hepsi" active={filter === "ALL"} onPress={() => setFilter("ALL")} />
          <Chip label="Okunmadı" active={filter === "UNREAD"} onPress={() => setFilter("UNREAD")} />
          <Chip label="Uyarılar" active={filter === "ALERTS"} onPress={() => setFilter("ALERTS")} />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="notifications-none" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Hiç bildirim yok</Text>
            <Text style={styles.emptyDesc}>Şu an gösterilecek bir şey yok.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}

        {notifications.length > 0 && (
          <Pressable style={styles.readAll} onPress={markAllAsRead}>
            <Text style={styles.readAllText}>Tümünü okundu yap</Text>
          </Pressable>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  container: { flex: 1, padding: 20 },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

  filtersColumn: {
    marginTop: 15,
    gap: 10,
  },
  filterIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  chip: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  chipPassive: { backgroundColor: "#fff", borderColor: "#E2E8F0" },
  chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipTextPassive: { color: "#475569", fontWeight: "700" },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontWeight: "700", fontSize: 14 },
  msg: { marginTop: 4, color: "#555" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 10 },
  emptyDesc: { color: "#94A3B8", marginTop: 4 },

  readAll: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  readAllText: { color: "#2563EB", fontWeight: "700" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});