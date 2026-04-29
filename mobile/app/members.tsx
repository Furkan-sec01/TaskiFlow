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
import { API_URL } from "@/constants/api"; // ✅ EKLENDİ

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
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]) as Promise<Response>;
  };

  const loadMembers = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      const activeOrgId = await AsyncStorage.getItem("activeOrgId");

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const orgId =
        activeOrgId ||
        user?.organizationId ||
        user?.organization?.id ||
        user?.organizations?.[0]?.organizationId ||
        user?.organizations?.[0]?.organization?.id;

      if (!orgId) {
        setLoading(false);
        return;
      }

      const response = await fetchWithTimeout(
        `${API_URL}/organizations/${orgId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Üyeler alınamadı");
      }

      const list = Array.isArray(data) ? data : data?.members || [];

      setMembers(
        list.map((item: any, i: number) => ({
          id: String(item?.id ?? i),
          name: item?.name ?? "İsimsiz",
          email: item?.email ?? "-",
          role: item?.role ?? "MEMBER",
          status: item?.status ?? "active",
        }))
      );
    } catch (e) {
      console.log("MEMBERS ERROR:", e);
      Alert.alert("Hata", "Üyeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(keyword) ||
        m.email.toLowerCase().includes(keyword)
    );
  }, [members, search]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} />
        </Pressable>

        <Text style={styles.title}>
          {orgName} ({members.length})
        </Text>

        <Pressable onPress={loadMembers}>
          <MaterialIcons name="refresh" size={20} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Ara..."
          style={{ flex: 1 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },

  title: { fontSize: 18, fontWeight: "800" },

  searchBox: {
    flexDirection: "row",
    borderWidth: 1,
    margin: 16,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  name: { fontWeight: "700" },
  email: { color: "#6B7280" },
});