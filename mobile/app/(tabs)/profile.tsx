import React, { useEffect, useState } from "react";
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
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  theme: "profile_theme",
  language: "profile_language",
  notifications: "profile_notifications",
};

export default function ProfileScreen() {
  const router = useRouter();
  const deviceTheme = useColorScheme();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [theme, setTheme] = useState("Açık");
  const [language, setLanguage] = useState("Türkçe");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userUsername, setUserUsername] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [userLocation, setUserLocation] = useState("");

  const isDark = theme === "Sistem" ? deviceTheme === "dark" : theme === "Koyu";

  const [profileModal, setProfileModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [securityModal, setSecurityModal] = useState(false);
  const [openSecuritySection, setOpenSecuritySection] = useState<string | null>("password");
  const [emailVerified, setEmailVerified] = useState(true);
  const [authenticatorEnabled, setAuthenticatorEnabled] = useState(false);
  const [sms2FAEnabled, setSms2FAEnabled] = useState(true);

  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [tempDepartment, setTempDepartment] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [sessions, setSessions] = useState([
    { id: 1, device: "Windows · Chrome", location: "İstanbul, TR · Şu an aktif", current: true },
    { id: 2, device: "iPhone · Safari", location: "İstanbul, TR · 2 saat önce", current: false },
    { id: 3, device: "MacBook · Firefox", location: "Ankara, TR · 3 gün önce", current: false },
  ]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setUserName(user.name || "");
          setUserEmail(user.email || "");
        }
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.theme);
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.language);
        const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.notifications);
        if (savedTheme) setTheme(savedTheme);
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedNotifications !== null) setNotifEnabled(savedNotifications === "true");
      } catch (error) {
        console.log("Tercihler yüklenemedi:", error);
      }
    };
    loadPreferences();
  }, []);

  const showComingSoon = (title: string) => Alert.alert(title, "Bu alan şimdilik hazırlanıyor.");
  const toggleSecuritySection = (key: string) => setOpenSecuritySection((prev) => (prev === key ? null : key));

  const handleThemeChange = async (selectedTheme: string) => {
    setTheme(selectedTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, selectedTheme);
    setThemeModal(false);
  };

  const handleLanguageChange = async (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    await AsyncStorage.setItem(STORAGE_KEYS.language, selectedLanguage);
    setLangModal(false);
  };

  const handleNotificationChange = async (value: boolean) => {
    setNotifEnabled(value);
    await AsyncStorage.setItem(STORAGE_KEYS.notifications, String(value));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni vermeniz gerekiyor."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const saveProfile = () => {
    if (!tempName.trim()) { Alert.alert("Hata", "Ad Soyad boş olamaz."); return; }
    if (!tempEmail.trim() || !tempEmail.includes("@")) { Alert.alert("Hata", "Geçerli bir e-posta girin."); return; }
    if (!tempUsername.trim()) { Alert.alert("Hata", "Kullanıcı adı boş olamaz."); return; }
    setUserName(tempName.trim()); setUserEmail(tempEmail.trim()); setUserUsername(tempUsername.trim());
    setUserPhone(tempPhone.trim()); setUserBio(tempBio.trim()); setUserDepartment(tempDepartment.trim()); setUserLocation(tempLocation.trim());
    setProfileModal(false);
    Alert.alert("Başarılı ✅", "Profil bilgileri güncellendi.");
  };

  const saveSecurityPassword = () => {
    if (!currentPass) { Alert.alert("Hata", "Mevcut şifrenizi girin."); return; }
    if (newPass.length < 6) { Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalı."); return; }
    if (newPass !== confirmPass) { Alert.alert("Hata", "Şifreler eşleşmiyor."); return; }
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    Alert.alert("Başarılı ✅", "Şifre güncellendi.");
  };

  const handleLogout = () => Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinize emin misiniz?", [
    { text: "İptal", style: "cancel" },
    { text: "Çıkış Yap", style: "destructive", onPress: () => router.replace("/welcome") },
  ]);

  const handleEndSession = (id: number) => {
    setSessions((prev) => prev.filter((item) => item.id !== id));
    Alert.alert("Oturum Sonlandırıldı", "Seçilen cihazın oturumu kapatıldı.");
  };

  const handleEndAllSessions = () => Alert.alert("Tüm Oturumları Sonlandır", "Bu cihaz dışındaki tüm oturumlar kapatılacak.", [
    { text: "İptal", style: "cancel" },
    { text: "Sonlandır", style: "destructive", onPress: () => { setSessions((prev) => prev.filter((item) => item.current)); Alert.alert("Başarılı", "Diğer tüm oturumlar kapatıldı."); } },
  ]);

  const handleDeleteAccount = () => Alert.alert("Hesabı Sil", "Bu işlem geri alınamaz.", [
    { text: "İptal", style: "cancel" },
    { text: "Hesabı Sil", style: "destructive", onPress: () => Alert.alert("Bilgi", "Bu işlem backend bağlanınca aktif edilebilir.") },
  ]);

  const MENU_SECTIONS = [
    {
      title: "Organizasyon",
      items: [
        { icon: "business-center", label: "Çalışma Alanı", color: "#2563EB", value: "Detaylar", onPress: () => router.push("/workspace") },
        { icon: "groups", label: "Takımlar", color: "#0EA5E9", onPress: () => router.push("/teams") },
        { icon: "people", label: "Üyeler", color: "#14B8A6", onPress: () => router.push("/members") },
      ],
    },
    {
      title: "Hesap",
      items: [
        { icon: "person", label: "Profil Bilgileri", color: "#2563EB", onPress: () => { setTempName(userName); setTempEmail(userEmail); setTempUsername(userUsername); setTempPhone(userPhone); setTempBio(userBio); setTempDepartment(userDepartment); setTempLocation(userLocation); setProfileModal(true); } },
        { icon: "security", label: "Güvenlik ve Erişim", color: "#DC2626", onPress: () => { setCurrentPass(""); setNewPass(""); setConfirmPass(""); setSecurityModal(true); } },
        { icon: "link", label: "Bağlı Hesaplar", color: "#8B5CF6", onPress: () => showComingSoon("Bağlı Hesaplar") },
        { icon: "credit-card", label: "Abonelik ve Planlar", color: "#2563EB", onPress: () => router.push("/plans") },
      ],
    },
    {
      title: "Tercihler",
      items: [
        { icon: "notifications", label: "Bildirim Ayarları", color: "#F59E0B", value: notifEnabled ? "Açık" : "Kapalı", onPress: () => setNotifModal(true) },
        { icon: "dark-mode", label: "Tema", color: "#6366F1", value: theme, onPress: () => setThemeModal(true) },
        { icon: "language", label: "Dil", color: "#2563EB", value: language, onPress: () => setLangModal(true) },
      ],
    },
    {
      title: "Diğer",
      items: [
        { icon: "help", label: "Yardım & Destek", color: "#8B5CF6", onPress: () => Alert.alert("Yardım & Destek", "support@ndmsoftware.com") },
        { icon: "description", label: "Gizlilik Politikası", color: "#6B7280", onPress: () => Alert.alert("Gizlilik Politikası", "Verileriniz güvende.") },
        { icon: "star", label: "Uygulamayı Değerlendir", color: "#F59E0B", onPress: () => Alert.alert("Teşekkürler ⭐", "Geri bildiriminiz için teşekkür ederiz.") },
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

  const SecurityAccordionItem = ({ sectionKey, icon, title, subtitle, children, danger = false }: { sectionKey: string; icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; children: React.ReactNode; danger?: boolean }) => {
    const isOpen = openSecuritySection === sectionKey;
    return (
      <View style={[styles.securityAccordionCard, danger && styles.securityAccordionDanger]}>
        <Pressable style={styles.securityAccordionHeader} onPress={() => toggleSecuritySection(sectionKey)}>
          <View style={[styles.securityAccordionIconWrap, danger && styles.securityAccordionIconWrapDanger]}>
            <MaterialIcons name={icon} size={20} color={danger ? "#DC2626" : "#2563EB"} />
          </View>
          <View style={styles.securityAccordionTextWrap}>
            <Text style={[styles.securityAccordionTitle, danger && styles.securityAccordionTitleDanger]}>{title}</Text>
            <Text style={styles.securityAccordionSubtitle}>{subtitle}</Text>
          </View>
          <MaterialIcons name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#9CA3AF" />
        </Pressable>
        {isOpen ? <View style={styles.securityAccordionBody}>{children}</View> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? "#000" : "#F8FAFC" }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          <View style={styles.roleRow}>
            <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>Stajyer</Text></View>
            <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>TaskiFlow Ekibi</Text></View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}><Text style={styles.profileStatValue}>4</Text><Text style={styles.profileStatLabel}>Proje</Text></View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}><Text style={styles.profileStatValue}>12</Text><Text style={styles.profileStatLabel}>Görev</Text></View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}><Text style={styles.profileStatValue}>28</Text><Text style={styles.profileStatLabel}>Tamamlanan</Text></View>
          </View>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planInfo}>
            <Text style={styles.planLabel}>Mevcut Plan</Text>
            <Text style={styles.planName}>Ücretsiz Başlangıç</Text>
          </View>
          <Pressable style={styles.planBadge} onPress={() => router.push("/plans")}>
            <Text style={styles.planBadgeText}>Yükselt</Text>
          </Pressable>
        </View>

        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, ii) => (
                <Pressable key={ii} style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + "18" }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {"value" in item && item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
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

      <Sheet visible={profileModal} onClose={() => setProfileModal(false)} title="Profil Bilgileri">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          <Text style={styles.inputLabel}>Ad Soyad</Text>
          <TextInput style={styles.sheetInput} value={tempName} onChangeText={setTempName} placeholder="Ad Soyad" />
          <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
          <TextInput style={styles.sheetInput} value={tempUsername} onChangeText={setTempUsername} placeholder="kullaniciadi" autoCapitalize="none" />
          <Text style={styles.inputLabel}>E-posta</Text>
          <TextInput style={styles.sheetInput} value={tempEmail} onChangeText={setTempEmail} keyboardType="email-address" autoCapitalize="none" placeholder="ornek@mail.com" />
          <Text style={styles.inputLabel}>Telefon</Text>
          <TextInput style={styles.sheetInput} value={tempPhone} onChangeText={setTempPhone} keyboardType="phone-pad" placeholder="+90 5xx xxx xx xx" />
          <Text style={styles.inputLabel}>Biyografi</Text>
          <TextInput style={[styles.sheetInput, styles.sheetTextArea]} value={tempBio} onChangeText={setTempBio} placeholder="Kendiniz hakkında kısa bir açıklama" multiline textAlignVertical="top" />
          <Text style={styles.inputLabel}>Departman / Rol</Text>
          <TextInput style={styles.sheetInput} value={tempDepartment} onChangeText={setTempDepartment} placeholder="Mobil Geliştirme" />
          <Text style={styles.inputLabel}>Şehir / Konum</Text>
          <TextInput style={styles.sheetInput} value={tempLocation} onChangeText={setTempLocation} placeholder="Şehir / Ülke" />
          <View style={styles.sheetButtons}>
            <Pressable style={styles.sheetCancelBtn} onPress={() => setProfileModal(false)}><Text style={styles.sheetCancelText}>İptal</Text></Pressable>
            <Pressable style={styles.sheetSaveBtn} onPress={saveProfile}><Text style={styles.sheetSaveText}>Kaydet</Text></Pressable>
          </View>
        </ScrollView>
      </Sheet>

      <Sheet visible={notifModal} onClose={() => setNotifModal(false)} title="Bildirim Ayarları">
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Push Bildirimleri</Text>
          <Switch value={notifEnabled} onValueChange={handleNotificationChange} trackColor={{ true: "#2563EB" }} />
        </View>
        <Pressable style={styles.sheetDoneBtn} onPress={() => setNotifModal(false)}><Text style={styles.sheetSaveText}>Tamam</Text></Pressable>
      </Sheet>

      <Sheet visible={themeModal} onClose={() => setThemeModal(false)} title="Tema Seç">
        {["Açık", "Koyu", "Sistem"].map((t) => (
          <Pressable key={t} style={[styles.optionRow, theme === t && styles.optionRowActive]} onPress={() => handleThemeChange(t)}>
            <Text style={[styles.optionText, theme === t && styles.optionTextActive]}>{t}</Text>
            {theme === t && <IconSymbol name="checkmark" size={18} color="#2563EB" />}
          </Pressable>
        ))}
      </Sheet>

      <Sheet visible={langModal} onClose={() => setLangModal(false)} title="Dil Seç">
        {["Türkçe", "English", "العربية"].map((l) => (
          <Pressable key={l} style={[styles.optionRow, language === l && styles.optionRowActive]} onPress={() => handleLanguageChange(l)}>
            <Text style={[styles.optionText, language === l && styles.optionTextActive]}>{l}</Text>
            {language === l && <IconSymbol name="checkmark" size={18} color="#2563EB" />}
          </Pressable>
        ))}
      </Sheet>

      <Modal visible={securityModal} animationType="slide" onRequestClose={() => setSecurityModal(false)}>
        <SafeAreaView style={styles.securityScreen}>
          <View style={styles.securityHeader}>
            <Pressable style={styles.securityBackBtn} onPress={() => setSecurityModal(false)}>
              <MaterialIcons name="arrow-back-ios-new" size={20} color="#111827" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityHeaderTitle}>Güvenlik ve Erişim</Text>
              <Text style={styles.securityHeaderSubtitle}>Hesap güvenliğini ve erişim ayarlarını yönet</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.securityScroll}>
            <SecurityAccordionItem sectionKey="password" icon="lock-outline" title="Şifre değiştir" subtitle="En az 6 karakter, bir büyük harf ve rakam içermelidir">
              <Text style={styles.securityInputLabel}>Mevcut şifre</Text>
              <TextInput style={styles.securityInput} value={currentPass} onChangeText={setCurrentPass} secureTextEntry placeholder="••••••••" placeholderTextColor="#9CA3AF" />
              <Text style={styles.securityInputLabel}>Yeni şifre</Text>
              <TextInput style={styles.securityInput} value={newPass} onChangeText={setNewPass} secureTextEntry placeholder="••••••••" placeholderTextColor="#9CA3AF" />
              <Text style={styles.securityInputLabel}>Şifre tekrar</Text>
              <TextInput style={styles.securityInput} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry placeholder="••••••••" placeholderTextColor="#9CA3AF" />
              <Pressable style={styles.securityPrimaryButton} onPress={saveSecurityPassword}>
                <Text style={styles.securityPrimaryButtonText}>Şifreyi güncelle</Text>
              </Pressable>
            </SecurityAccordionItem>

            <SecurityAccordionItem sectionKey="2fa" icon="verified-user" title="İki faktörlü doğrulama" subtitle="Hesabını ek bir güvenlik katmanıyla koru">
              <View style={styles.securitySettingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.securitySettingTitle}>Authenticator uygulaması</Text>
                  <Text style={styles.securitySettingDesc}>Google Authenticator, Authy vb.</Text>
                </View>
                <View style={styles.securityStatusSwitch}>
                  <Text style={[styles.securityStatusText, authenticatorEnabled ? styles.statusActive : styles.statusPassive]}>{authenticatorEnabled ? "Aktif" : "Kurulmadı"}</Text>
                  <Switch value={authenticatorEnabled} onValueChange={setAuthenticatorEnabled} trackColor={{ true: "#2563EB", false: "#D1D5DB" }} />
                </View>
              </View>
              <View style={[styles.securitySettingRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.securitySettingTitle}>SMS doğrulama</Text>
                  <Text style={styles.securitySettingDesc}>Telefon numarası ile giriş koruması</Text>
                </View>
                <View style={styles.securityStatusSwitch}>
                  <Text style={[styles.securityStatusText, sms2FAEnabled ? styles.statusActive : styles.statusPassive]}>{sms2FAEnabled ? "Aktif" : "Kapalı"}</Text>
                  <Switch value={sms2FAEnabled} onValueChange={setSms2FAEnabled} trackColor={{ true: "#2563EB", false: "#D1D5DB" }} />
                </View>
              </View>
            </SecurityAccordionItem>

            <SecurityAccordionItem sectionKey="email" icon="mark-email-read" title="E-posta doğrulama" subtitle={userEmail}>
              <View style={[styles.securitySettingRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.securitySettingTitle}>Hesap e-postası</Text>
                  <Text style={styles.securitySettingDesc}>{userEmail}</Text>
                </View>
                <View style={styles.securityStatusSwitch}>
                  <Text style={[styles.securityStatusText, emailVerified ? styles.statusActive : styles.statusPassive]}>{emailVerified ? "Aktif" : "Doğrulanmadı"}</Text>
                  <Switch value={emailVerified} onValueChange={setEmailVerified} trackColor={{ true: "#2563EB", false: "#D1D5DB" }} />
                </View>
              </View>
            </SecurityAccordionItem>

            <SecurityAccordionItem sectionKey="sessions" icon="devices" title="Aktif oturumlar" subtitle="Hesabınıza bağlı tüm cihazlar">
              {sessions.map((session, index) => (
                <View key={session.id} style={[styles.sessionRow, index < sessions.length - 1 && styles.sessionRowBorder]}>
                  <View style={styles.sessionIcon}><MaterialIcons name="devices" size={18} color="#6B7280" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionDevice}>{session.device}</Text>
                    <Text style={styles.sessionLocation}>{session.location}</Text>
                  </View>
                  {session.current ? (
                    <View style={styles.currentDeviceBadge}><Text style={styles.currentDeviceBadgeText}>Bu cihaz</Text></View>
                  ) : (
                    <Pressable style={styles.sessionDangerBtn} onPress={() => handleEndSession(session.id)}>
                      <Text style={styles.sessionDangerBtnText}>Sonlandır</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </SecurityAccordionItem>

            <SecurityAccordionItem sectionKey="danger" icon="warning-amber" title="Tehlike bölgesi" subtitle="Bu işlemler geri alınamaz" danger>
              <View style={styles.dangerActionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerActionTitle}>Tüm oturumları sonlandır</Text>
                  <Text style={styles.dangerActionDesc}>Bu cihaz dışındaki tüm oturumları kapat</Text>
                </View>
                <Pressable style={styles.dangerSmallBtn} onPress={handleEndAllSessions}>
                  <Text style={styles.dangerSmallBtnText}>Sonlandır</Text>
                </Pressable>
              </View>
              <View style={[styles.dangerActionRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerActionTitle}>Hesabı sil</Text>
                  <Text style={styles.dangerActionDesc}>Tüm veriler kalıcı olarak silinir</Text>
                </View>
                <Pressable style={styles.dangerOutlineBtn} onPress={handleDeleteAccount}>
                  <Text style={styles.dangerOutlineBtnText}>Hesabı sil</Text>
                </Pressable>
              </View>
            </SecurityAccordionItem>
            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 24 },
  profileCard: { backgroundColor: "#2563EB", marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 28, alignItems: "center" },
  avatarContainer: { position: "relative", marginBottom: 14 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarLargeText: { color: "#fff", fontSize: 34, fontWeight: "800" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#fff", width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", elevation: 4, borderWidth: 2, borderColor: "#2563EB" },
  profileName: { color: "#fff", fontSize: 24, fontWeight: "800" },
  profileEmail: { color: "#DBEAFE", fontSize: 14, marginTop: 4 },
  roleRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" },
  roleBadge: { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  roleBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  profileStats: { flexDirection: "row", alignItems: "center", marginTop: 22, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, width: "100%" },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
  profileStatLabel: { color: "#DBEAFE", fontSize: 11, marginTop: 2, fontWeight: "600" },
  profileStatDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  planCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 20, elevation: 2, borderWidth: 1, borderColor: "#E5E7EB" },
  planInfo: { flex: 1 },
  planLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "700", textTransform: "uppercase" },
  planName: { fontSize: 16, fontWeight: "800", color: "#111827", marginTop: 2 },
  planBadge: { backgroundColor: "#2563EB", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  planBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  menuSection: { marginTop: 24, paddingHorizontal: 20 },
  menuSectionTitle: { fontSize: 13, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  menuCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", elevation: 2 },
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
  sheetContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: "92%" },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8, marginTop: 12 },
  sheetInput: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#F9FAFB", fontSize: 14, color: "#111827" },
  sheetTextArea: { minHeight: 96 },
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
  securityScreen: { flex: 1, backgroundColor: "#F8FAFC" },
  securityHeader: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEF2F7" },
  securityBackBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2 },
  securityHeaderTitle: { fontSize: 21, fontWeight: "800", color: "#111827" },
  securityHeaderSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  securityScroll: { padding: 16, paddingBottom: 40 },
  securityAccordionCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14, overflow: "hidden" },
  securityAccordionDanger: { borderColor: "#FECACA", backgroundColor: "#FFFDFD" },
  securityAccordionHeader: { flexDirection: "row", alignItems: "center", padding: 16 },
  securityAccordionIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
  securityAccordionIconWrapDanger: { backgroundColor: "#FEE2E2" },
  securityAccordionTextWrap: { flex: 1 },
  securityAccordionTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  securityAccordionTitleDanger: { color: "#B91C1C" },
  securityAccordionSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 4, lineHeight: 17 },
  securityAccordionBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  securityInputLabel: { fontSize: 12, color: "#6B7280", fontWeight: "700", textTransform: "uppercase", marginTop: 14, marginBottom: 8 },
  securityInput: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", paddingHorizontal: 14, fontSize: 14, color: "#111827" },
  securityPrimaryButton: { marginTop: 18, height: 46, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", paddingHorizontal: 18 },
  securityPrimaryButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  securitySettingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", gap: 12 },
  securitySettingTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  securitySettingDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  securityStatusSwitch: { alignItems: "flex-end", gap: 6 },
  securityStatusText: { fontSize: 12, fontWeight: "700" },
  statusActive: { color: "#16A34A" },
  statusPassive: { color: "#D97706" },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  sessionRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  sessionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  sessionDevice: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sessionLocation: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  currentDeviceBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  currentDeviceBadgeText: { color: "#16A34A", fontSize: 11, fontWeight: "800" },
  sessionDangerBtn: { backgroundColor: "#FEE2E2", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  sessionDangerBtnText: { color: "#DC2626", fontSize: 11, fontWeight: "800" },
  dangerActionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#FEE2E2" },
  dangerActionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  dangerActionDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  dangerSmallBtn: { backgroundColor: "#FEE2E2", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  dangerSmallBtnText: { color: "#DC2626", fontSize: 12, fontWeight: "800" },
  dangerOutlineBtn: { borderWidth: 1, borderColor: "#FCA5A5", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: "#FFF" },
  dangerOutlineBtnText: { color: "#DC2626", fontSize: 12, fontWeight: "800" },
});