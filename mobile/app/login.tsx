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
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = "http://192.168.1.12:5000/api";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            router.replace("/(tabs)/genel-bakis");
        } catch (error) {
            Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <View style={styles.logoBox}><Text style={styles.logoText}>T</Text></View>
                        <Text style={styles.title}>TaskiFlow</Text>
                        <Text style={styles.subtitle}>Hesabına giriş yap</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>E-posta</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ornek@email.com"
                            autoComplete="off"
                            importantForAutofill="no"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Şifre</Text>
                            <Pressable onPress={() => Alert.alert("Bilgi", "Şifre sıfırlama yakında aktif olacak.")}>
                                <Text style={styles.forgotBtn}>Şifremi Unuttum?</Text>
                            </Pressable>
                        </View>
                        
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="******"
                                secureTextEntry={!showPassword}
                                autoComplete="off"
                                importantForAutofill="no"
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
                        </Pressable>

                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Hesabın yok mu?</Text>
                            <Pressable onPress={() => router.push("/register")}><Text style={styles.footerLink}> Kayıt Ol</Text></Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 16 },
    header: { alignItems: "center", marginBottom: 18 },
    logoBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    logoText: { color: "#fff", fontSize: 26, fontWeight: "800" },
    title: { fontSize: 28, fontWeight: "800", color: "#111827" },
    subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },
    card: { width: "100%", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 16 },
    label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    forgotBtn: { color: "#2563EB", fontSize: 12, fontWeight: "700", marginBottom: 8 },
    input: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, backgroundColor: "#F9FAFB", color: "#111827" },
    passwordWrapper: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
    passwordInput: { flex: 1, paddingHorizontal: 12, color: "#111827" },
    eyeBtn: { padding: 10 },
    button: { marginTop: 16, height: 48, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
    footerText: { color: "#6B7280", fontSize: 14 },
    footerLink: { color: "#2563EB", fontWeight: "700", fontSize: 14 },
});