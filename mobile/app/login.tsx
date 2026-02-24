import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

const API_URL = "http://192.168.100.18:5000/api";

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Hata", data.error || "Giriş başarısız.");
                return;
            }

            Alert.alert("Başarılı ✅", `Hoş geldin ${data.user?.name || ""}!`);
            router.replace("/(tabs)");
        } catch (error) {
            Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>T</Text>
                        </View>

                        <Text style={styles.title}>TaskiFlow</Text>
                        <Text style={styles.subtitle}>Hesabına giriş yap</Text>
                    </View>

                    {/* FORM CARD */}
                    <View style={styles.card}>
                        <Text style={styles.label}>E-posta</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ornek@email.com"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="******"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                        />

                        <Pressable
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Giriş Yap</Text>
                            )}
                        </Pressable>

                        {/* REGISTER LINK */}
                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Hesabın yok mu?</Text>
                            <Pressable onPress={() => router.push("/register")}>
                                <Text style={styles.registerLink}> Kayıt Ol</Text>
                            </Pressable>
                        </View>

                        {/* BACK TO WELCOME */}
                        <Pressable
                            style={styles.backRow}
                            onPress={() => router.replace("/welcome")}
                        >
                            <Text style={styles.backText}>← Karşılama</Text>
                        </Pressable>
                    </View>

                    <View style={{ height: 24 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },

    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 24,
    },

    header: {
        alignItems: "center",
        marginBottom: 18,
    },

    logoBox: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    logoText: { color: "#fff", fontSize: 26, fontWeight: "800" },

    title: { fontSize: 28, fontWeight: "800", color: "#111827" },
    subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },

    card: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        padding: 16,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
    },

    input: {
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        backgroundColor: "#F9FAFB",
        color: "#111827",
    },

    button: {
        marginTop: 16,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

    registerRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 18,
    },

    registerText: { color: "#6B7280", fontSize: 14 },

    registerLink: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 14,
    },

    backRow: {
        alignItems: "center",
        marginTop: 14,
    },

    backText: {
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "600",
    },
});
