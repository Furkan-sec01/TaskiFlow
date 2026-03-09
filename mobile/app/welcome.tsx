import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* ── Logo & Branding ── */}
                <View style={styles.brandSection}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>T</Text>
                    </View>
                    <Text style={styles.title}>TaskiFlow</Text>
                    <Text style={styles.subtitle}>
                        Projelerini ve görevlerini kolayca yönet.
                    </Text>
                </View>

                {/* ── Buttons ── */}
                <View style={styles.buttonsCard}>
                    <Pressable
                        style={styles.registerBtn}
                        onPress={() => router.push("/register")}
                    >
                        <Text style={styles.registerBtnText}>Kayıt Ol</Text>
                    </Pressable>

                    <Pressable
                        style={styles.loginBtn}
                        onPress={() => router.push("/login")}
                    >
                        <Text style={styles.loginBtnText}>Giriş Yap</Text>
                    </Pressable>

                    <Text style={styles.terms}>
                        Devam ederek kullanım koşullarını kabul etmiş olursun.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    /* ── Brand ── */
    brandSection: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    logoText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "800",
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#111827",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
    },

    /* ── Buttons ── */
    buttonsCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    registerBtn: {
        width: "100%",
        height: 52,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    registerBtnText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "800",
    },
    loginBtn: {
        width: "100%",
        height: 52,
        borderRadius: 14,
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    loginBtnText: {
        color: "#111827",
        fontSize: 17,
        fontWeight: "700",
    },
    terms: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
    },
});
