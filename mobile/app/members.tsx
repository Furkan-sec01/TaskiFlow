import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.11:5000/api";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function MembersScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("Üyeler");

  useEffect(() => {
    loadMembers();
  }, []);

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 8000
  ) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("İstek zaman aşımına uğradı.")), timeout)
      ),
    ]) as Promise<Response>;
  };

  const buildFallbackMembers = (user: any, orgId: string) => {
    const orgs = Array.isArray(user?.organizations) ? user.organizations : [];
    const matchedOrg = orgs.find(
      (item: any) =>
        item?.organizationId === orgId || item?.organization?.id === orgId
    );

    return [
      {
        id: String(user?.id || "me"),
        name: user?.name || "Kullanıcı",
        email: user?.email || "E-posta yok",
        role: matchedOrg?.role || "OWNER",
        status: user?.status || "active",
      },
    ];
  };

  const loadMembers = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      const activeOrgId = await AsyncStorage.getItem("activeOrgId");

      console.log("MEMBERS SCREEN");
      console.log("TOKEN:", token);
      console.log("USER:", storedUser);
      console.log("ACTIVE ORG ID:", activeOrgId);

      if (!token) {
        Alert.alert("Hata", "Token bulunamadı.");
        setLoading(false);
        return;
      }

      if (!storedUser) {
        Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const orgId =
        activeOrgId ||
        user?.organizationId ||
        user?.organization?.id ||
        user?.orgId ||
        user?.organizations?.[0]?.organizationId ||
        user?.organizations?.[0]?.organization?.id ||
        null;

      if (!orgId) {
        Alert.alert("Hata", "Aktif organizasyon bulunamadı.");
        setLoading(false);
        return;
      }

      const matchedOrg = Array.isArray(user?.organizations)
        ? user.organizations.find(
            (item: any) =>
              item?.organizationId === orgId || item?.organization?.id === orgId
          )
        : null;

      if (matchedOrg?.organization?.name) {
        setOrgName(matchedOrg.organization.name);
      }

      console.log("MEMBERS REQUEST URL:", `${API_BASE_URL}/organizations/${orgId}/members`);

      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/organizations/${orgId}/members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
          8000
        );

        const text = await response.text();
        console.log("MEMBERS STATUS:", response.status);
        console.log("MEMBERS RAW RESPONSE:", text);

        let data: any = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.log("MEMBERS JSON PARSE ERROR:", e);
          throw new Error("Members endpoint geçerli JSON döndürmedi.");
        }

        if (!response.ok) {
          throw new Error(data?.message || data?.error || "Üyeler alınamadı.");
        }

        const rawMembers = Array.isArray(data) ? data : data?.members || [];
        console.log("RAW MEMBERS:", rawMembers);

        const normalized: Member[] = rawMembers.map((item: any, index: number) => ({
          id: String(item?.id ?? item?._id ?? index),
          name: item?.name ?? item?.user?.name ?? "İsimsiz Üye",
          email: item?.email ?? item?.user?.email ?? "E-posta yok",
          role: item?.role ?? "MEMBER",
          status: item?.status ?? item?.user?.status ?? "active",
        }));

        if (normalized.length > 0) {
          setMembers(normalized);
        } else {
          setMembers(buildFallbackMembers(user, orgId));
        }
      } catch (endpointError: any) {
        console.log("MEMBERS ENDPOINT ERROR:", endpointError);
        console.log("FALLBACK MEMBER LIST USED");
        setMembers(buildFallbackMembers(user, orgId));
      }
    } catch (error: any) {
      console.log("MEMBERS SCREEN ERROR:", error);
      Alert.alert("Hata", error?.message || "Üyeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) => {
      const name = (member.name || "").toLowerCase();
      const email = (member.email || "").toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [members, search]);

  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "??";

    const clean = nameOrEmail.trim();
    const parts = clean.split(" ").filter(Boolean);

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return clean.slice(0, 1).toUpperCase();
  };

  const getRoleConfig = (role: string) => {
    if (role === "OWNER") {
      return {
        icon: "workspace-premium" as const,
        iconColor: "#D97706",
        badgeBg: "#FEF3C7",
        badgeText: "#B45309",
      };
    }

    if (role === "ADMIN") {
      return {
        icon: "shield" as const,
        iconColor: "#2563EB",
        badgeBg: "#DBEAFE",
        badgeText: "#1D4ED8",
      };
    }

    return {
      icon: "groups" as const,
      iconColor: "#6B7280",
      badgeBg: "#F3F4F6",
      badgeText: "#4B5563",
    };
  };

  const getStatusConfig = (status: string) => {
    if ((status || "").toLowerCase() === "active") {
      return {
        text: "Aktif",
        bg: "#DCFCE7",
        color: "#15803D",
      };
    }

    return {
      text: "Pasif",
      bg: "#F3F4F6",
      color: "#6B7280",
    };
  };

  const renderMemberItem = ({ item, index }: { item: Member; index: number }) => {
    const role = getRoleConfig(item.role);
    const status = getStatusConfig(item.status);

    return (
      <View
        style={[
          styles.memberRow,
          index !== filteredMembers.length - 1 && styles.memberRowBorder,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.name || item.email)}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName} numberOfLines={1}>
            {item.name || "—"}
          </Text>

          <View style={styles.emailRow}>
            <MaterialIcons name="mail-outline" size={13} color="#9CA3AF" />
            <Text style={styles.memberEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        <View style={styles.rightMeta}>
          <View style={[styles.roleBadge, { backgroundColor: role.badgeBg }]}>
            <MaterialIcons name={role.icon} size={13} color={role.iconColor} />
            <Text style={[styles.roleBadgeText, { color: role.badgeText }]}>
              {item.role}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#111827" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Üyeler</Text>
          <Text style={styles.headerSubtitle}>
            {orgName} · {members.length} üye
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadMembers}>
          <MaterialIcons name="refresh" size={20} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="İsim veya e-posta ile ara"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.centerText}>Üyeler yükleniyor...</Text>
            </View>
          ) : filteredMembers.length === 0 ? (
            <View style={styles.centerState}>
              <MaterialIcons name="groups-2" size={42} color="#9CA3AF" />
              <Text style={styles.stateTitle}>Üye bulunamadı</Text>
              <Text style={styles.stateDesc}>
                Bu takım için gösterilecek üye bulunmuyor.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBox: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  listCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    overflow: "hidden",
  },
  flatListContent: {
    paddingVertical: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  memberEmail: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
  },
  rightMeta: {
    alignItems: "flex-end",
    gap: 8,
    marginLeft: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerText: {
    marginTop: 14,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  stateDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
});