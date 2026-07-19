import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "connected_accounts";

type ProviderId = "google" | "apple" | "microsoft" | "github";

type Provider = {
  id: ProviderId;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

const PROVIDERS: Provider[] = [
  { id: "google", name: "Google", icon: "mail", color: "#EA4335" },
  { id: "apple", name: "Apple", icon: "phone-iphone", color: "#111827" },
  { id: "microsoft", name: "Microsoft", icon: "desktop-windows", color: "#2563EB" },
  { id: "github", name: "GitHub", icon: "code", color: "#24292F" },
];

export default function ConnectedAccountsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [linked, setLinked] = useState<Record<ProviderId, boolean>>({
    google: false,
    apple: false,
    microsoft: false,
    github: false,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setLinked((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    });
  }, []);

  const persist = async (next: Record<ProviderId, boolean>) => {
    setLinked(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggleProvider = (provider: Provider) => {
    const isLinked = linked[provider.id];
    Alert.alert(
      provider.name,
      isLinked ? t("connected.unlink") : t("connected.link"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: isLinked ? t("connected.unlink") : t("connected.link"),
          onPress: async () => {
            const next = { ...linked, [provider.id]: !isLinked };
            await persist(next);
            Alert.alert(
              t("common.success"),
              (isLinked ? t("connected.unlinkedOk") : t("connected.linkedOk")).replace(
                "{provider}",
                provider.name
              )
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.headerBg }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.cardLight }]}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t("connected.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("connected.subtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {PROVIDERS.map((provider) => {
          const isLinked = linked[provider.id];
          return (
            <View
              key={provider.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }]}>
                <MaterialIcons name={provider.icon} size={22} color={provider.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
                <Text style={{ color: isLinked ? "#10B981" : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {isLinked ? t("connected.linked") : t("connected.notLinked")}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.actionBtn,
                  { backgroundColor: isLinked ? colors.dangerBg : colors.primary },
                ]}
                onPress={() => toggleProvider(provider)}
              >
                <Text style={[styles.actionText, { color: isLinked ? "#DC2626" : "#fff" }]}>
                  {isLinked ? t("connected.unlink") : t("connected.link")}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <Text style={[styles.note, { color: colors.textSecondary }]}>{t("connected.note")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  content: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: { fontSize: 15, fontWeight: "800" },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: "700" },
  note: { marginTop: 8, fontSize: 12, lineHeight: 18 },
});
