import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Pressable, ActivityIndicator, Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Linking } from "react-native";

const API_URL = "http://192.168.1.128:5000/api";

export default function DocumentsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const url = projectId
        ? `${API_URL}/documents?projectId=${projectId}`
        : `${API_URL}/documents`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch (e) {
      console.log("Belge yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);
      formData.append("title", file.name);
      if (projectId) formData.append("projectId", projectId as string);

      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Başarılı ✅", "Belge yüklendi.");
        fetchDocuments();
      } else {
        Alert.alert("Hata", data.error || "Yüklenemedi.");
      }
    } catch (e) {
      Alert.alert("Hata", "Dosya seçilemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    Alert.alert("Belgeyi Sil", "Bu belgeyi silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil", style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await fetch(`${API_URL}/documents/${docId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchDocuments();
          } catch (e) {
            Alert.alert("Hata", "Silinemedi.");
          }
        }
      }
    ]);
  };

  const handleDownload = (fileUrl: string) => {
  if (!fileUrl) {
    Alert.alert("Hata", "Dosya bulunamadı.");
    return;
  }
  const url = `http://192.168.1.128:5000${fileUrl}`;
  console.log("İndirme URL:", url);
  Linking.openURL(url);
};
  const filtered = documents.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileMeta = (type: string) => {
    if (type?.includes("pdf")) return { icon: "picture-as-pdf" as const, color: "#EF4444", bg: "#FEE2E2" };
    if (type?.includes("sheet") || type?.includes("excel") || type?.includes("csv")) return { icon: "table-chart" as const, color: "#22C55E", bg: "#DCFCE7" };
    if (type?.includes("presentation") || type?.includes("powerpoint")) return { icon: "slideshow" as const, color: "#F59E0B", bg: "#FEF3C7" };
    if (type?.includes("word") || type?.includes("document")) return { icon: "description" as const, color: "#3B82F6", bg: "#DBEAFE" };
    if (type?.includes("image")) return { icon: "image" as const, color: "#A855F7", bg: "#F3E8FF" };
    return { icon: "insert-drive-file" as const, color: "#64748B", bg: "#E2E8F0" };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Belgeler</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Belge ara..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
        </View>

        <Pressable style={styles.uploadBox} onPress={handleUpload} disabled={uploading}>
          <View style={styles.uploadIcon}>
            <MaterialIcons name="cloud-upload" size={28} color="#2563EB" />
          </View>
          {uploading
            ? <ActivityIndicator color="#2563EB" />
            : <Text style={styles.uploadTitle}>Dosya Yükle</Text>
          }
          <Text style={styles.uploadSub}>PDF, Word, Excel, Görsel</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="folder-open" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>Henüz belge yok</Text>
          </View>
        ) : (
          filtered.map((doc) => {
            const meta = getFileMeta(doc.mimeType || doc.type || "");
            const isActive = activeCardId === doc.id;
            return (
              <View key={doc.id} style={styles.cardWrap}>
                <Pressable
                  style={[styles.card, isActive && styles.cardActive]}
                  onPress={() => {
                    setActiveCardId(isActive ? null : doc.id);
                    if (!isActive && doc.fileUrl) {
                      const url = `http://192.168.1.128:5000${doc.fileUrl}`;
                      Linking.openURL(url);
                    }
                  }}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.fileIcon, { backgroundColor: meta.bg }]}>
                      <MaterialIcons name={meta.icon} size={20} color={meta.color} />
                    </View>
                    <View style={styles.cardActions}>
                      <Pressable onPress={() => handleDownload(doc.fileUrl)} style={styles.actionBtn}>
                        <MaterialIcons name="file-download" size={20} color="#2563EB" />
                      </Pressable>
                      <Pressable onPress={() => handleDelete(doc.id)} style={styles.actionBtn}>
                        <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{doc.title || doc.originalName}</Text>
                  <Text style={styles.cardMeta}>{doc.size || ""} · {doc.project?.title || ""}</Text>
                  <Text style={styles.cardDate}>{new Date(doc.createdAt).toLocaleDateString("tr-TR")}</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  content: { padding: 16, paddingBottom: 40 },
  topBar: { marginBottom: 14 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#111827" },
  uploadBox: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#BFDBFE", padding: 24, alignItems: "center", marginBottom: 20 },
  uploadIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 4 },
  uploadSub: { fontSize: 12, color: "#9CA3AF" },
  emptyBox: { alignItems: "center", marginTop: 40, gap: 8 },
  emptyText: { fontSize: 14, color: "#9CA3AF" },
  cardWrap: { marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  cardActive: { borderColor: "#2563EB", backgroundColor: "#F8FBFF" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  fileIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionBtn: { padding: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardMeta: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  cardDate: { fontSize: 11, color: "#D1D5DB", marginTop: 4 },
});