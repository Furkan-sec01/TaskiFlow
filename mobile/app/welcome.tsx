import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GridBackground = ({ isDark }: { isDark: boolean }) => {
  const lineColor = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)";
  const step = 30;
  const horizontalLines = Math.ceil(SCREEN_HEIGHT / step);
  const verticalLines = Math.ceil(SCREEN_WIDTH / step);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: horizontalLines }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            { top: i * step, left: 0, right: 0, height: 1, backgroundColor: lineColor },
          ]}
        />
      ))}
      {Array.from({ length: verticalLines }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            { left: i * step, top: 0, bottom: 0, width: 1, backgroundColor: lineColor },
          ]}
        />
      ))}
    </View>
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeStyles = {
    safe: { backgroundColor: isDark ? "#0B111E" : "#F8FAFC" },
    badge: {
      backgroundColor: isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.05)",
      borderColor: isDark ? "rgba(37, 99, 235, 0.3)" : "rgba(37, 99, 235, 0.2)",
    },
    badgeText: { color: "#3B82F6" },
    logoOuterFrame: { borderColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.15)" },
    logoInnerFrame: { borderColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(37, 99, 235, 0.1)" },
    featureText: { color: isDark ? "#6B7280" : "#9CA3AF" },
    title: { color: isDark ? "#FFFFFF" : "#0F172A" },
    subtitle: { color: isDark ? "#9CA3AF" : "#6B7280" },
    loginBtn: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(37, 99, 235, 0.15)",
    },
    loginBtnText: { color: isDark ? "#FFFFFF" : "#1E293B" },
  };

  return (
    <SafeAreaView style={[styles.safe, themeStyles.safe]}>
      <GridBackground isDark={isDark} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, themeStyles.badge]}>
              <View style={styles.badgeDot} />
              <Text style={[styles.badgeText, themeStyles.badgeText]}>PROJE YÖNETİMİ</Text>
            </View>
          </View>

          <View style={styles.logoSection}>
            <View style={[styles.outerFrame, themeStyles.logoOuterFrame, { transform: [{ rotate: "15deg" }] }]} />
            <View style={[styles.innerFrame, themeStyles.logoInnerFrame, { transform: [{ rotate: "-10deg" }] }]} />
            
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>
          </View>

          <View style={styles.featuresRow}>
            <Text style={[styles.featureText, themeStyles.featureText]}>Panolar</Text>
            <View style={styles.featureDot} />
            <Text style={[styles.featureText, themeStyles.featureText]}>Görevler</Text>
            <View style={styles.featureDot} />
            <Text style={[styles.featureText, themeStyles.featureText]}>Ekip</Text>
          </View>

          <View style={styles.textSection}>
            <Text style={[styles.title, themeStyles.title]}>
              Projelerini yönet,{"\n"}
              <Text style={styles.titleBlue}>ekibinle ilerle</Text>
            </Text>

            <Text style={[styles.subtitle, themeStyles.subtitle]}>
              Görevlerini, ekip süreçlerini ve proje akışını tek bir yerden kolayca takip et.
            </Text>
          </View>

          <View style={styles.actionsSection}>
            <Pressable
              style={styles.registerBtn}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerBtnText}>Kayıt ol</Text>
            </Pressable>

            <Pressable
              style={[styles.loginBtn, themeStyles.loginBtn]}
              onPress={() => router.push("/login")}
            >
              <Text style={[styles.loginBtnText, themeStyles.loginBtnText]}>Giriş yap</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gridLine: {
    position: "absolute",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  badgeContainer: {
    alignItems: "flex-start",
    marginTop: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logoSection: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  outerFrame: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 48,
    borderWidth: 1,
  },
  innerFrame: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 42,
    borderWidth: 1.2,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
  },
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
  },
  featureDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#9CA3AF",
    marginHorizontal: 12,
  },
  textSection: {
    alignItems: "flex-start",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: "left",
  },
  titleBlue: {
    color: "#2563EB",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  actionsSection: {
    width: "100%",
    gap: 14,
  },
  registerBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});