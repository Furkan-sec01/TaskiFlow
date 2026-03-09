import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    Alert,
    Switch,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
    const router = useRouter();

    /* ── User State (Tüm ayarların korunuyor) ── */
    const [userName, setUserName] = useState("Abdelbaky");
    const [userEmail, setUserEmail] = useState("abdelbaky@email.com");
    const [theme, setTheme] = useState("Açık");
    const [language, setLanguage] = useState("Türkçe");
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    /* ── Modal States (Senin orijinallerin) ── */
    const [profileModal, setProfileModal] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const [emailModal, setEmailModal] = useState(false);
    const [notifModal, setNotifModal] = useState(false);
    const [themeModal, setThemeModal] = useState(false);
    const [langModal, setLangModal] = useState(false);

    /* ── Temp form values ── */
    const [tempName, setTempName] = useState(userName);
    const [tempEmail, setTempEmail] = useState(userEmail);
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    /* ── Handlers ── */
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni vermeniz gerekiyor.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true, // Kırpma ekranını açar
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const saveProfile = () => {
        if (!tempName.trim()) { Alert.alert("Hata", "Ad boş olamaz."); return; }
        setUserName(tempName.trim());
        setProfileModal(false);
        Alert.alert("Başarılı ✅", "Profil güncellendi.");
    };

    const saveEmail = () => {
        if (!tempEmail.trim() || !tempEmail.includes("@")) { Alert.alert("Hata", "Geçerli bir e-posta girin."); return; }
        setUserEmail(tempEmail.trim());
        setEmailModal(false);
        Alert.alert("Başarılı ✅", "E-posta güncellendi.");
    };

    const savePassword = () => {
        if (!currentPass) { Alert.alert("Hata", "Mevcut şifrenizi girin."); return; }
        if (newPass.length < 6) { Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalı."); return; }
        if (newPass !== confirmPass) { Alert.alert("Hata", "Şifreler eşleşmiyor."); return; }
        setPasswordModal(false);
        setCurrentPass(""); setNewPass(""); setConfirmPass("");
        Alert.alert("Başarılı ✅", "Şifre değiştirildi.");
    };

    const handleLogout = () => {
        Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinize emin misiniz?", [
            { text: "İptal", style: "cancel" },
            { text: "Çıkış Yap", style: "destructive", onPress: () => router.replace("/welcome") },
        ]);
    };

    /* ── Menu Sections (Entegre Edilmiş Hali) ── */
    const MENU_SECTIONS = [
        {
            title: "Hesap",
            items: [
                { icon: "person.fill" as const, label: "Profil Bilgileri", color: "#2563EB", onPress: () => { setTempName(userName); setProfileModal(true); } },
                { icon: "lock.fill" as const, label: "Şifre Değiştir", color: "#7C3AED", onPress: () => { setCurrentPass(""); setNewPass(""); setConfirmPass(""); setPasswordModal(true); } },
                { icon: "envelope.fill" as const, label: "E-posta Ayarları", color: "#059669", onPress: () => { setTempEmail(userEmail); setEmailModal(true); } },
                { icon: "creditcard.fill" as const, label: "Abonelik ve Planlar", color: "#2563EB", onPress: () => router.push("/plans") },
            ],
        },
        {
            title: "Tercihler",
            items: [
                { icon: "bell.fill" as const, label: "Bildirim Ayarları", color: "#F59E0B", value: notifEnabled ? "Açık" : "Kapalı", onPress: () => setNotifModal(true) },
                { icon: "moon.fill" as const, label: "Tema", color: "#6366F1", value: theme, onPress: () => setThemeModal(true) },
                { icon: "globe" as const, label: "Dil", color: "#2563EB", value: language, onPress: () => setLangModal(true) },
            ],
        },
        {
            title: "Diğer",
            items: [
                { icon: "questionmark.circle.fill" as const, label: "Yardım & Destek", color: "#8B5CF6", onPress: () => Alert.alert("Yardım", "support@taskiflow.com") },
                { icon: "star.fill" as const, label: "Uygulamayı Değerlendir", color: "#F59E0B", onPress: () => Alert.alert("Teşekkürler ⭐") },
                { icon: "doc.text.fill" as const, label: "Gizlilik Politikası", color: "#6B7280", onPress: () => Alert.alert("Gizlilik", "Verileriniz güvende.") },
            ],
        },
    ];

    const Sheet = ({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.sheetOverlay}>
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>{title}</Text>
                    {children}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* ── Profile Card (Modernize Edilmiş ve Fotoğraflı) ── */}
                <View style={styles.profileCard}>
                    <Pressable onPress={pickImage} style={styles.avatarContainer}>
                        <View style={styles.avatarLarge}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                            ) : (
                                <Text style={styles.avatarLargeText}>{userName.charAt(0).toUpperCase()}</Text>
                            )}
                        </View>
                        <View style={styles.cameraBadge}>
                            <IconSymbol name="camera.fill" size={14} color="#2563EB" />
                        </View>
                    </Pressable>
                    <Text style={styles.profileName}>{userName}</Text>
                    <Text style={styles.profileEmail}>{userEmail}</Text>

                    <View style={styles.profileStats}>
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>4</Text>
                            <Text style={styles.profileStatLabel}>Proje</Text>
                        </View>
                        <View style={styles.profileStatDivider} />
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>12</Text>
                            <Text style={styles.profileStatLabel}>Görev</Text>
                        </View>
                        <View style={styles.profileStatDivider} />
                        <View style={styles.profileStat}>
                            <Text style={styles.profileStatValue}>28</Text>
                            <Text style={styles.profileStatLabel}>Tamamlanan</Text>
                        </View>
                    </View>
                </View>

                {/* Mevcut Plan Kartı */}
                <View style={styles.planCard}>
                    <View style={styles.planInfo}>
                        <Text style={styles.planLabel}>Mevcut Plan</Text>
                        <Text style={styles.planName}>Ücretsiz Başlangıç</Text>
                    </View>
                    <Pressable style={styles.planBadge} onPress={() => router.push("/plans")}>
                        <Text style={styles.planBadgeText}>Yükselt</Text>
                    </Pressable>
                </View>

                {/* Organizasyon Kartı */}
                <Pressable style={styles.orgCard} onPress={() => Alert.alert("Organizasyon", "TaskiFlow Ekibi")}>
                    <View style={styles.orgIcon}>
                        <IconSymbol name="building.2.fill" size={22} color="#2563EB" />
                    </View>
                    <View style={styles.orgInfo}>
                        <Text style={styles.orgTitle}>Organizasyon</Text>
                        <Text style={styles.orgName}>TaskiFlow Ekibi</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
                </Pressable>

                {/* Menü Bölümleri */}
                {MENU_SECTIONS.map((section, si) => (
                    <View key={si} style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, ii) => (
                                <Pressable key={ii} style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
                                    <View style={[styles.menuIconWrap, { backgroundColor: item.color + "18" }]}>
                                        <IconSymbol name={item.icon} size={18} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <View style={styles.menuRight}>
                                        {"value" in item && item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                        <IconSymbol name="chevron.right" size={14} color="#D1D5DB" />
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}

                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </Pressable>

                <Text style={styles.version}>TaskiFlow v1.0.0</Text>
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ═══════ MODALLARIN (Senin Tüm Orijinallerin) ═══════ */}
            <Sheet visible={profileModal} onClose={() => setProfileModal(false)} title="Profil Bilgileri">
                <Text style={styles.inputLabel}>Ad Soyad</Text>
                <TextInput style={styles.sheetInput} value={tempName} onChangeText={setTempName} placeholder="Adınız" />
                <View style={styles.sheetButtons}>
                    <Pressable style={styles.sheetCancelBtn} onPress={() => setProfileModal(false)}><Text style={styles.sheetCancelText}>İptal</Text></Pressable>
                    <Pressable style={styles.sheetSaveBtn} onPress={saveProfile}><Text style={styles.sheetSaveText}>Kaydet</Text></Pressable>
                </View>
            </Sheet>

            <Sheet visible={passwordModal} onClose={() => setPasswordModal(false)} title="Şifre Değiştir">
                <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                <TextInput style={styles.sheetInput} value={currentPass} onChangeText={setCurrentPass} secureTextEntry placeholder="••••••" />
                <Text style={styles.inputLabel}>Yeni Şifre</Text>
                <TextInput style={styles.sheetInput} value={newPass} onChangeText={setNewPass} secureTextEntry />
                <View style={styles.sheetButtons}>
                    <Pressable style={styles.sheetCancelBtn} onPress={() => setPasswordModal(false)}><Text style={styles.sheetCancelText}>İptal</Text></Pressable>
                    <Pressable style={styles.sheetSaveBtn} onPress={savePassword}><Text style={styles.sheetSaveText}>Kaydet</Text></Pressable>
                </View>
            </Sheet>

            <Sheet visible={emailModal} onClose={() => setEmailModal(false)} title="E-posta Ayarları">
                <Text style={styles.inputLabel}>E-posta Adresi</Text>
                <TextInput style={styles.sheetInput} value={tempEmail} onChangeText={setTempEmail} keyboardType="email-address" />
                <View style={styles.sheetButtons}>
                    <Pressable style={styles.sheetCancelBtn} onPress={() => setEmailModal(false)}><Text style={styles.sheetCancelText}>İptal</Text></Pressable>
                    <Pressable style={styles.sheetSaveBtn} onPress={saveEmail}><Text style={styles.sheetSaveText}>Kaydet</Text></Pressable>
                </View>
            </Sheet>

            <Sheet visible={notifModal} onClose={() => setNotifModal(false)} title="Bildirim Ayarları">
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Push Bildirimleri</Text>
                    <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: "#2563EB" }} />
                </View>
                <Pressable style={styles.sheetDoneBtn} onPress={() => setNotifModal(false)}><Text style={styles.sheetSaveText}>Tamam</Text></Pressable>
            </Sheet>

            <Sheet visible={themeModal} onClose={() => setThemeModal(false)} title="Tema Seç">
                {["Açık", "Koyu", "Sistem"].map((t) => (
                    <Pressable key={t} style={[styles.optionRow, theme === t && styles.optionRowActive]} onPress={() => { setTheme(t); setThemeModal(false); }}>
                        <Text style={[styles.optionText, theme === t && styles.optionTextActive]}>{t}</Text>
                        {theme === t && <IconSymbol name="checkmark" size={18} color="#2563EB" />}
                    </Pressable>
                ))}
            </Sheet>

            <Sheet visible={langModal} onClose={() => setLangModal(false)} title="Dil Seç">
                {["Türkçe", "English", "العربية"].map((l) => (
                    <Pressable key={l} style={[styles.optionRow, language === l && styles.optionRowActive]} onPress={() => { setLanguage(l); setLangModal(false); }}>
                        <Text style={[styles.optionText, language === l && styles.optionTextActive]}>{l}</Text>
                        {language === l && <IconSymbol name="checkmark" size={18} color="#2563EB" />}
                    </Pressable>
                ))}
            </Sheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    scrollContent: { paddingBottom: 24 },

    profileCard: { backgroundColor: "#2563EB", marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 28, alignItems: "center" },
    avatarContainer: { position: 'relative', marginBottom: 14 },
    avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", overflow: 'hidden', borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
    avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    avatarLargeText: { color: "#fff", fontSize: 34, fontWeight: "800" },
    
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 5, elevation: 4, borderWidth: 2, borderColor: '#2563EB' },

    profileName: { color: "#fff", fontSize: 24, fontWeight: "800" },
    profileEmail: { color: "#DBEAFE", fontSize: 14, marginTop: 4 },
    profileStats: { flexDirection: "row", alignItems: "center", marginTop: 22, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, width: "100%" },
    profileStat: { flex: 1, alignItems: "center" },
    profileStatValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
    profileStatLabel: { color: "#DBEAFE", fontSize: 11, marginTop: 2, fontWeight: "600" },
    profileStatDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },

    planCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: "#E5E7EB" },
    planInfo: { flex: 1 },
    planLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "700", textTransform: "uppercase" },
    planName: { fontSize: 16, fontWeight: "800", color: "#111827", marginTop: 2 },
    planBadge: { backgroundColor: "#2563EB", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
    planBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },

    orgCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    orgIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center", marginRight: 12 },
    orgInfo: { flex: 1 },
    orgTitle: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase" },
    orgName: { fontSize: 15, fontWeight: "700", color: "#111827", marginTop: 2 },

    menuSection: { marginTop: 24, paddingHorizontal: 20 },
    menuSectionTitle: { fontSize: 13, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
    menuCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 14 },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#111827" },
    menuRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    menuValue: { fontSize: 13, color: "#9CA3AF" },

    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginTop: 28, height: 50, borderRadius: 14, backgroundColor: "#FEE2E2" },
    logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
    version: { textAlign: "center", color: "#D1D5DB", fontSize: 12, marginTop: 20 },

    sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    sheetContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 20 },

    inputLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8, marginTop: 12 },
    sheetInput: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 14, backgroundColor: "#F9FAFB", fontSize: 14, color: "#111827" },

    sheetButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
    sheetCancelBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
    sheetCancelText: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
    sheetSaveBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
    sheetSaveText: { color: "#fff", fontSize: 15, fontWeight: "800" },
    sheetDoneBtn: { height: 50, borderRadius: 14, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginTop: 24 },

    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    switchLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },

    optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: "#F9FAFB" },
    optionRowActive: { backgroundColor: "#EFF6FF", borderWidth: 1.5, borderColor: "#2563EB" },
    optionText: { fontSize: 15, fontWeight: "600", color: "#374151" },
    optionTextActive: { color: "#2563EB", fontWeight: "700" },
});