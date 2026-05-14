import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

type Plan = {
  id: "starter" | "pro" | "enterprise";
  name: string;
  priceText: string;
  periodText: string;
  desc: string;
  features: string[];
  buttonText: string;
  variant: "ghost" | "primary" | "purple";
  popular?: boolean;
  action: () => void;
};

export default function Plans() {
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Başlangıç",
      priceText: "₺0",
      periodText: "/ay",
      desc: "Bireysel kullanım ve küçük projeler için ideal.",
      features: [
        "Sınırsız Görev",
        "2 Proje",
        "50 MB Depolama",
        "Temel Destek",
      ],
      buttonText: "Ücretsiz Başla",
      variant: "ghost",
      action: () =>
        router.push({
          pathname: "/payment",
          params: { planId: "starter", period: "monthly" },
        }),
    },
    {
      id: "pro",
      name: "Profesyonel",
      priceText: "₺99",
      periodText: "/ay",
      desc: "Büyüyen ekipler ve ciddi işler için güçlü plan.",
      features: [
        "Sınırsız Proje",
        "Sınırsız Ekip Üyesi",
        "10 GB Depolama",
        "Gelişmiş Raporlar",
        "Öncelikli Destek",
      ],
      buttonText: "Hemen Satın Al",
      variant: "primary",
      popular: true,
      action: () =>
        router.push({
          pathname: "/payment",
          params: { planId: "pro", period: "monthly" },
        }),
    },

    // 🔥 BUSINESS DÜZELTİLDİ
    {
      id: "enterprise",
      name: "Şirketler",
      priceText: "₺299",
      periodText: "/ay",
      desc: "Büyük organizasyonlar için tam kontrol ve özel çözümler.",
      features: [
        "Sınırsız Her Şey",
        "Özel Sunucu Seçenekleri",
        "SLA Garantisi",
        "7/24 Canlı Destek",
        "Yönetici Paneli",
      ],
      buttonText: "Business'a Geç",
      variant: "purple",
      action: () =>
        router.push({
          pathname: "/payment",
          params: {
            planId: "enterprise",
            period: "monthly",
          },
        }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Planınızı Seçin</Text>
            <Text style={styles.subtitle}>
              Şeffaf fiyatlandırma. İstediğiniz zaman iptal edebilirsiniz.
            </Text>
          </View>
        </View>

        <View style={{ gap: 14 }}>
          {plans.map((p) => (
            <View
              key={p.id}
              style={[
                styles.card,
                p.popular && styles.cardPopularBorder,
                p.id === "enterprise" && styles.cardPurpleBorder,
              ]}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>EN POPÜLER</Text>
                </View>
              )}

              <Text style={styles.planName}>{p.name}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{p.priceText}</Text>
                {!!p.periodText && (
                  <Text style={styles.period}>{p.periodText}</Text>
                )}
              </View>

              <Text style={styles.desc}>{p.desc}</Text>

              <View style={styles.featureList}>
                {p.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <View
                      style={[
                        styles.checkDot,
                        p.popular
                          ? styles.checkDotBlue
                          : styles.checkDotGreen,
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkText,
                          p.popular
                            ? styles.checkTextBlue
                            : styles.checkTextGreen,
                        ]}
                      >
                        ✓
                      </Text>
                    </View>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={p.action}
                style={[
                  styles.cta,
                  p.variant === "primary" && styles.ctaPrimary,
                  p.variant === "ghost" && styles.ctaGhost,
                  p.variant === "purple" && styles.ctaPurple,
                ]}
              >
                <Text
                  style={[
                    styles.ctaText,
                    p.variant === "primary" && styles.ctaTextPrimary,
                    p.variant === "ghost" && styles.ctaTextGhost,
                    p.variant === "purple" && styles.ctaTextPrimary,
                  ]}
                >
                  {p.buttonText}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },

  headerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, fontWeight: "900" },

  title: { fontSize: 22, fontWeight: "900" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280" },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
  },

  cardPopularBorder: { borderColor: "#2563EB", borderWidth: 2 },
  cardPurpleBorder: { borderColor: "#7C3AED", borderWidth: 2 },

  popularBadge: {
    backgroundColor: "#2563EB",
    padding: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  popularBadgeText: { color: "#fff", fontSize: 11 },

  planName: { fontSize: 16, fontWeight: "900" },

  priceRow: { flexDirection: "row", marginTop: 8 },
  price: { fontSize: 28, fontWeight: "900" },
  period: { marginLeft: 4 },

  desc: { marginTop: 8, fontSize: 13 },

  featureList: { marginTop: 10 },
  featureRow: { flexDirection: "row", alignItems: "center" },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkDotGreen: { backgroundColor: "#DCFCE7" },
  checkDotBlue: { backgroundColor: "#DBEAFE" },

  checkText: { fontSize: 12, fontWeight: "900" },
  checkTextGreen: { color: "#16A34A" },
  checkTextBlue: { color: "#2563EB" },

  featureText: { fontSize: 13 },

  cta: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPrimary: { backgroundColor: "#2563EB" },
  ctaPurple: { backgroundColor: "#7C3AED" },
  ctaGhost: { backgroundColor: "#F3F4F6" },

  ctaText: { fontWeight: "900" },
  ctaTextPrimary: { color: "#fff" },
  ctaTextGhost: { color: "#111827" },
});