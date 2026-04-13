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

const API_URL = "http://192.168.1.128:5001//10.158.192.96:5000/api";

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }
        if (!emailRegex.test(email)) {
            Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi girin.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
            return;
        }
        if (name.trim().split(' ').length < 2) {
            Alert.alert("Hata", "Lütfen adınızı ve soyadınızı tam giriniz.");
            return;
        }
        if (!agreeTerms) {
            Alert.alert("Hata", "Lütfen kullanım şartlarını kabul edin.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
            });
            const data = await response.json();
            if (!response.ok) {
                Alert.alert("Hata", data.error || "Kayıt başarısız.");
                return;
            }
            Alert.alert("Başarılı", "Hesabınız oluşturuldu!", [
                { text: "Tamam", onPress: () => router.push("/login") }
            ]);
        } catch (error) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>T</Text>
                        </View>
                        <Text style={styles.title}>TaskiFlow</Text>
                        <Text style={styles.subtitle}>Hemen hesabını oluştur ve başla.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Ad Soyad</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Adınız Soyadınız"
                            value={name}
                            onChangeText={setName}
                            autoComplete="off" // Listeyi kapatır
                            importantForAutofill="no"
                        />

                        <Text style={[styles.label, { marginTop: 16 }]}>E-posta</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="örnek@mail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            autoComplete="off" // Listeyi kapatır
                            importantForAutofill="no"
                        />

                        <Text style={[styles.label, { marginTop: 16 }]}>Şifre</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoComplete="off" // Listeyi kapatır
                                importantForAutofill="no"
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
                            </Pressable>
                        </View>

                        <View style={styles.termsRow}>
                            <Pressable
                                onPress={() => setAgreeTerms(!agreeTerms)}
                                style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
                            >
                                {agreeTerms && <MaterialIcons name="check" size={14} color="#fff" />}
                            </Pressable>
                            <View style={styles.termsTextContainer}>
                                <Text style={styles.termsText}>
                                    <Text onPress={() => setAgreeTerms(!agreeTerms)}>Okudum ve onaylıyorum: </Text>
                                    <Text style={styles.linkText} onPress={() => router.push("/terms")}>Kullanım Şartları</Text>
                                    <Text> ve </Text>
                                    <Text style={styles.linkText} onPress={() => router.push("/privacy")}>Gizlilik Politikası</Text>
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            style={[styles.button, (!agreeTerms || loading) && { backgroundColor: "#93C5FD", opacity: 0.8 }]}
                            onPress={handleRegister}
                            disabled={!agreeTerms || loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
                        </Pressable>
                    </View>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
                        <Pressable onPress={() => router.push("/login")}>
                            <Text style={styles.loginLink}>Giriş Yap</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { padding: 24, paddingTop: 60 },
    header: { alignItems: "center", marginBottom: 32 },
    logoBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    logoText: { color: "#fff", fontSize: 26, fontWeight: "800" },
    title: { fontSize: 28, fontWeight: "800", color: "#111827" },
    subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },
    card: { width: "100%", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 16 },
    label: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
    input: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, backgroundColor: "#F9FAFB", color: "#111827" },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
    passwordInput: { flex: 1, paddingHorizontal: 12, color: "#111827" },
    eyeIcon: { padding: 10 },
    termsRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 16, marginBottom: 10 },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#2563EB", alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 2 },
    checkboxChecked: { backgroundColor: "#2563EB" },
    termsTextContainer: { flex: 1 },
    termsText: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
    linkText: { color: "#2563EB", fontWeight: "700" },
    button: { marginTop: 16, height: 48, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
    loginText: { color: "#6B7280", fontSize: 14 },
    loginLink: { color: "#2563EB", fontWeight: "700", fontSize: 14 },
});