import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/api";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
};

type FilterKey = "ALL" | "UNREAD" | "ALERTS";
type SortKey = "NEWEST" | "UNREAD_FIRST";

export default function BildirimlerScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("NEWEST");

  const intervalRef = useRef<any>(null);

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 7000
  ) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("İstek zaman aşımına uğradı.")), timeout)
      ),
    ]) as Promise<Response>;
  };

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    return t;
  };

  const fetchNotifications = useCallback(
    async (tParam?: string | null) => {
      const t = tParam ?? token ?? (await AsyncStorage.getItem("token"));

      if (!t) {
        setFirstLoading(false);
        return;
      }

      try {
        const res = await fetchWithTimeout(
          `${API_URL}/notifications`,
          {
            headers: { Authorization: `Bearer ${t}` },
          },
          7000
        );

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Bildirimler alınamadı:", err);
        setNotifications([]);
      } finally {
        setFirstLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      fetchNotifications(t);

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

  const filteredAndSorted = useMemo(() => {
    let list = [...notifications];

    if (filter === "UNREAD") {
      list = list.filter((n) => n.isRead === false);
    } else if (filter === "ALERTS") {
      list = list.filter(
        (n) =>
          (n.type || "").toUpperCase().includes("ALERT") ||
          (n.type || "").toUpperCase().includes("UYARI")
      );
    }

    if (sortBy === "UNREAD_FIRST") {
      list.sort((a, b) => {
        const aRead = a.isRead ? 1 : 0;
        const bRead = b.isRead ? 1 : 0;
        if (aRead !== bRead) return aRead - bRead;

        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } else {
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return list;
  }, [notifications, filter, sortBy]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isRead === false).length,
    [notifications]
  );

  const allReadText = useMemo(() => {
    return unreadCount > 0
      ? `${unreadCount} okunmamış bildirim var`
      : "Tüm bildirimler okundu";
  }, [unreadCount]);

  const markAsRead = async (id: string) => {
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log("Bildirim okundu yapılamadı:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("Tümü okundu yapılamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === "NEWEST" ? "UNREAD_FIRST" : "NEWEST"));
  };

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipPassive]}
    >
      <Text style={active ? styles.chipTextActive : styles.chipTextPassive}>
        {label}
      </Text>
    </Pressable>
  );

  const respondInvite = async (notificationId: string, action: "ACCEPT" | "REJECT") => {
  if (!token) return;
  try {
    const res = await fetch(`${API_URL}/notifications/respond-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notificationId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      Alert.alert("Başarılı", action === "ACCEPT" ? "Ekibe katıldınız!" : "Davet reddedildi.");
      fetchNotifications();
    } else {
      Alert.alert("Hata", data.error || "İşlem başarısız.");
    }
  } catch (e) {
    Alert.alert("Hata", "Sunucuya bağlanılamadı.");
  }
};

const renderItem = ({ item }: { item: NotificationItem }) => (
  <Pressable
    style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
    onPress={() => { if (!item.isRead) markAsRead(item.id); }}
  >
    <View style={styles.cardTopRow}>
      <View style={styles.cardTextArea}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.msg}>{item.message}</Text>

        {item.type === "INVITE" && !item.isRead && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              style={{ backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
              onPress={() => respondInvite(item.id, "ACCEPT")}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>Kabul Et</Text>
            </Pressable>
            <Pressable
              style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
              onPress={() => respondInvite(item.id, "REJECT")}
            >
              <Text style={{ color: "#DC2626", fontWeight: "800", fontSize: 13 }}>Reddet</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!item.isRead && item.type !== "INVITE" && (
        <Pressable style={styles.doneButton} onPress={() => markAsRead(item.id)}>
          <MaterialIcons name="done" size={18} color="#2563EB" />
        </Pressable>
      )}
    </View>
  </Pressable>
);

  if (firstLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.iconBox}>
              <MaterialIcons name="notifications-none" size={22} color="#2563EB" />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.headerTitle}>Bildirimler</Text>
              <Text style={styles.headerSub}>{allReadText}</Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.readAllButton,
              (notifications.length === 0 || loading) && { opacity: 0.5 },
            ]}
            onPress={markAllAsRead}
            disabled={notifications.length === 0 || loading}
          >
            <MaterialIcons name="done-all" size={16} color="#2563EB" />
            <Text style={styles.readAllButtonText}>Tümünü okundu say</Text>
          </Pressable>
        </View>

        <View style={styles.filtersWrap}>
          <Pressable style={styles.sortButton} onPress={toggleSort}>
            <MaterialIcons
              name={sortBy === "NEWEST" ? "swap-vert" : "sort"}
              size={18}
              color="#2563EB"
            />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            <Chip label="Hepsi" active={filter === "ALL"} onPress={() => setFilter("ALL")} />
            <Chip
              label="Okunmadı"
              active={filter === "UNREAD"}
              onPress={() => setFilter("UNREAD")}
            />
            <Chip
              label="Uyarılar"
              active={filter === "ALERTS"}
              onPress={() => setFilter("ALERTS")}
            />
          </ScrollView>
        </View>

        {filteredAndSorted.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <MaterialIcons name="notifications-none" size={34} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Hiç bildirim yok</Text>
            <Text style={styles.emptyDesc}>Şu an gösterilecek bir şey yok.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSorted}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },

  readAllButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readAllButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },

  filtersWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  chipsScroll: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipPassive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipTextPassive: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  listContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardUnread: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DBEAFE",
  },
  cardRead: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E5E7EB",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardTextArea: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  msg: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  doneButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  emptyIconBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyDesc: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
