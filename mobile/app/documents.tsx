import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Image,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { API_URL } from "@/constants/api";

type FileType = "Tümü" | "PDF" | "Excel" | "Sunu" | "Word" | "Görsel" | "Dosya";

type FileItem = {
  id: string;
  title: string;
  originalName?: string | null;
  type: FileType;
  mimeType?: string | null;
  size?: string | null;
  fileUrl?: string | null;
  filePath?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ProjectItem = {
  id: string;
  title: string;
};

const FILTERS: FileType[] = ["Tümü", "PDF", "Word", "Excel", "Sunu", "Görsel", "Dosya"];

export default function DocumentsScreen() {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<FileItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FileType>("Tümü");
  const [selectedDocument, setSelectedDocument] = useState<FileItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Hata", "Oturum bulunamadı. Lütfen tekrar giriş yap.");
      return null;
    }

    return token;
  };

  const getFullFileUrl = (fileUrl?: string | null) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http")) return encodeURI(fileUrl);
    return encodeURI(`${SERVER_URL}${fileUrl}`);
  };

  const getSafeFileName = (item: FileItem) => {
    const rawName = item.originalName || item.title || "belge";
    return rawName.replace(/[\\/:*?"<>|]/g, "_");
  };

  const downloadToCache = async (item: FileItem) => {
    const fullUrl = getFullFileUrl(item.fileUrl);

    if (!fullUrl) {
      Alert.alert("Bilgi", "Bu belge için dosya bağlantısı yok.");
      return null;
    }

    const fileName = getSafeFileName(item);
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;

    const downloaded = await FileSystem.downloadAsync(fullUrl, localUri);

    console.log("DOWNLOADED FILE:", downloaded);

    if (downloaded.status !== 200) {
      Alert.alert("Hata", "Dosya indirilemedi. Sunucu dosyaya erişemiyor olabilir.");
      return null;
    }

    return downloaded.uri;
  };

  const handleDownloadDocument = async (item: FileItem) => {
  try {
    setDownloadingId(item.id);

    const localUri = await downloadToCache(item);
    if (!localUri) return;

    // 👇 kullanıcı klasör seçiyor
    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Bilgi", "Klasör seçilmedi.");
      return;
    }

    const fileName = getSafeFileName(item);

    // 👇 BURASI ÖNEMLİ
    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permission.directoryUri,
      fileName,
      item.mimeType || "application/octet-stream"
    );

    // 👇 direkt kopyala (base64 yerine)
    await FileSystem.copyAsync({
      from: localUri,
      to: fileUri,
    });

    Alert.alert("Başarılı", "Belge seçtiğin klasöre kaydedildi.");
  } catch (error) {
    console.log("Download hatası:", error);
    Alert.alert("Hata", "Belge indirilemedi.");
  } finally {
    setDownloadingId(null);
  }
};
  const handleShareDocument = async (item: FileItem) => {
    try {
      setSharingId(item.id);

      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert("Hata", "Bu cihazda paylaşım desteklenmiyor.");
        return;
      }

      const localUri = await downloadToCache(item);
      if (!localUri) return;

      await Sharing.shareAsync(localUri, {
        mimeType: item.mimeType || "application/octet-stream",
        dialogTitle: "Belgeyi dışa aktar",
      });
    } catch (error) {
      console.log("Share hatası:", error);
      Alert.alert("Hata", "Belge dışa aktarılamadı.");
    } finally {
      setSharingId(null);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      console.log("DOCUMENTS RESPONSE:", data);

      if (!res.ok) {
        Alert.alert("Hata", data?.error || data?.message || "Belgeler getirilemedi.");
        return;
      }

      const normalizedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            title: item.title || item.originalName || "İsimsiz belge",
            type: normalizeFileType(item.mimeType || item.type || item.title),
          }))
        : [];

      setDocuments(normalizedData);
    } catch (error) {
      console.log("Documents fetch hatası:", error);
      Alert.alert("Hata", "Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/project`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      console.log("PROJECTS RESPONSE:", data);

      if (!res.ok) return;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setProjects(
        list.map((item: any) => ({
          id: item.id,
          title: item.title || item.name || "İsimsiz proje",
        }))
      );
    } catch (error) {
      console.log("Projects fetch hatası:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return documents.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const originalName = item.originalName?.toLowerCase() || "";
      const type = item.type?.toLowerCase() || "";
      const projectTitle = item.projectTitle?.toLowerCase() || "";
      const projectId = item.projectId?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        title.includes(q) ||
        originalName.includes(q) ||
        type.includes(q) ||
        projectTitle.includes(q) ||
        projectId.includes(q);

      const matchesFilter = selectedFilter === "Tümü" || item.type === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, documents, selectedFilter]);

  const handleCardPress = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  const handlePickAndUploadDocument = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "image/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];

      if (!file) {
        Alert.alert("Hata", "Dosya seçilemedi.");
        return;
      }

      setUploading(true);

      const formData = new FormData();

      formData.append("file", {
        uri: file.uri,
        name: file.name || "document",
        type: file.mimeType || "application/octet-stream",
      } as any);

      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      console.log("UPLOAD DOCUMENT RESPONSE:", data);

      if (!res.ok) {
        Alert.alert("Hata", data?.error || data?.message || "Belge yüklenemedi.");
        return;
      }

      Alert.alert("Başarılı", "Belge yüklendi.");
      fetchDocuments();
    } catch (error) {
      console.log("Document upload hatası:", error);
      Alert.alert("Hata", "Belge yüklenirken sunucu hatası oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = async (item: FileItem) => {
    const fullUrl = getFullFileUrl(item.fileUrl);

    if (!fullUrl) {
      Alert.alert("Bilgi", "Bu belge için dosya bağlantısı yok.");
      return;
    }

    const supported = await Linking.canOpenURL(fullUrl);

    if (!supported) {
      Alert.alert("Hata", "Bu dosya bağlantısı açılamıyor.");
      return;
    }

    Linking.openURL(fullUrl);
  };

  const openPreviewModal = (item: FileItem) => {
    setSelectedDocument(item);
    setPreviewModalVisible(true);
  };

  const openProjectModal = (item: FileItem) => {
    setSelectedDocument(item);
    setProjectModalVisible(true);
    fetchProjects();
  };

  const handleAttachProject = async (projectId: string | null, doc?: FileItem) => {
    const targetDocument = doc || selectedDocument;
    if (!targetDocument) return;

    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/documents/${targetDocument.id}/project`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json().catch(() => null);

      console.log("ATTACH PROJECT RESPONSE:", data);

      if (!res.ok) {
        Alert.alert(
          "Hata",
          data?.error || data?.message || "Proje bağlantısı güncellenemedi."
        );
        return;
      }

      setDocuments((prev) =>
        prev.map((document) =>
          document.id === targetDocument.id
            ? {
                ...document,
                projectId: data?.projectId || null,
                projectTitle: data?.projectTitle || null,
              }
            : document
        )
      );

      setProjectModalVisible(false);
      setSelectedDocument(null);

      Alert.alert(
        "Başarılı",
        projectId ? "Belge projeye eklendi." : "Belge projeden çıkarıldı."
      );
    } catch (error) {
      console.log("Attach project hatası:", error);
      Alert.alert("Hata", "Proje bağlantısı güncellenirken hata oluştu.");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    Alert.alert("Belgeyi Sil", "Bu belgeyi silmek istediğine emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}/documents/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await res.json().catch(() => null);

            console.log("DELETE DOCUMENT RESPONSE:", data);

            if (!res.ok) {
              Alert.alert("Hata", data?.error || data?.message || "Belge silinemedi.");
              return;
            }

            setDocuments((prev) => prev.filter((item) => item.id !== id));
            setActiveCardId(null);
            Alert.alert("Başarılı", "Belge silindi.");
          } catch (error) {
            console.log("Document delete hatası:", error);
            Alert.alert("Hata", "Belge silinirken sunucu hatası oluştu.");
          }
        },
      },
    ]);
  };

  const formatDate = (date?: string) => {
    if (!date) return "Bilinmiyor";

    try {
      return new Date(date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Bilinmiyor";
    }
  };

  const previewUrl = selectedDocument ? getFullFileUrl(selectedDocument.fileUrl) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Belgeler</Text>
        <Text style={styles.pageSubtitle}>
          Belgelerini yükle, filtrele, projeye ekle, indir ve dışa aktar.
        </Text>

        <View style={styles.topBar}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Belge veya proje ara..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          <Pressable style={styles.filterButton} onPress={fetchDocuments}>
            <Text style={styles.filterButtonText}>Yenile</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => {
            const active = selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                style={[styles.typeFilterButton, active && styles.typeFilterButtonActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.typeFilterText,
                    active && styles.typeFilterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[styles.uploadBox, uploading && styles.uploadBoxDisabled]}
          onPress={handlePickAndUploadDocument}
          disabled={uploading}
        >
          <View style={styles.uploadIconWrapper}>
            {uploading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <MaterialIcons name="cloud-upload" size={28} color="#3B82F6" />
            )}
          </View>

          <Text style={styles.uploadTitle}>
            {uploading ? "Belge yükleniyor..." : "Belge yükle"}
          </Text>

          <Text style={styles.uploadSubtitle}>
            PDF, Word, Excel, PowerPoint ve görsel dosyaları desteklenir.
          </Text>
        </Pressable>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.centerText}>Belgeler yükleniyor...</Text>
          </View>
        ) : filteredFiles.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="folder-open" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Belge bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              Filtreyi değiştirebilir veya yeni belge yükleyebilirsin.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredFiles.map((item) => {
              const isActive = activeCardId === item.id;
              const fileMeta = getFileMeta(item.type);
              const isDownloading = downloadingId === item.id;
              const isSharing = sharingId === item.id;

              return (
                <View key={item.id} style={styles.cardWrapper}>
                  <Pressable
                    onPress={() => handleCardPress(item.id)}
                    style={[styles.card, isActive && styles.cardActive]}
                  >
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.fileIconBox,
                          { backgroundColor: fileMeta.softColor },
                        ]}
                      >
                        <MaterialIcons
                          name={fileMeta.icon}
                          size={20}
                          color={fileMeta.color}
                        />
                      </View>

                      <Pressable
                        style={styles.moreButton}
                        onPress={() => handleCardPress(item.id)}
                      >
                        <MaterialIcons name="more-horiz" size={20} color="#64748B" />
                      </Pressable>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={styles.cardType}>
                      {item.type} • {item.size || "Boyut yok"}
                    </Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardProject} numberOfLines={1}>
                        {item.projectTitle
                          ? `Proje: ${item.projectTitle}`
                          : "Genel belge"}
                      </Text>
                      <View style={styles.statusDot} />
                    </View>
                  </Pressable>

                  {isActive && (
                    <View style={styles.expandedPanel}>
                      <InfoRow label="Dosya adı" value={item.title} />
                      <InfoRow label="Tür" value={item.type} />
                      <InfoRow label="Boyut" value={item.size || "Yok"} />
                      <InfoRow
                        label="Proje"
                        value={item.projectTitle || "Genel belge"}
                      />
                      <InfoRow label="Oluşturulma" value={formatDate(item.createdAt)} />
                      <InfoRow label="Güncelleme" value={formatDate(item.updatedAt)} />

                      <View style={styles.actionRow}>
                        <Pressable
                          style={styles.primaryAction}
                          onPress={() => openPreviewModal(item)}
                        >
                          <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
                          <Text style={styles.primaryActionText}>Önizle</Text>
                        </Pressable>

                        <Pressable
                          style={styles.secondaryAction}
                          onPress={() => handleOpenDocument(item)}
                        >
                          <MaterialIcons name="open-in-new" size={18} color="#334155" />
                          <Text style={styles.secondaryActionText}>Aç</Text>
                        </Pressable>

                        <Pressable
                          style={styles.secondaryAction}
                          onPress={() => handleDownloadDocument(item)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <ActivityIndicator size="small" color="#334155" />
                          ) : (
                            <MaterialIcons
                              name="file-download"
                              size={18}
                              color="#334155"
                            />
                          )}
                          <Text style={styles.secondaryActionText}>
                            {isDownloading ? "İndiriliyor" : "İndir"}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.secondaryAction}
                          onPress={() => handleShareDocument(item)}
                          disabled={isSharing}
                        >
                          {isSharing ? (
                            <ActivityIndicator size="small" color="#334155" />
                          ) : (
                            <MaterialIcons name="ios-share" size={18} color="#334155" />
                          )}
                          <Text style={styles.secondaryActionText}>
                            {isSharing ? "Hazırlanıyor" : "Dışa aktar"}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.secondaryAction}
                          onPress={() => openProjectModal(item)}
                        >
                          <MaterialIcons name="folder" size={18} color="#334155" />
                          <Text style={styles.secondaryActionText}>Projeye ekle</Text>
                        </Pressable>

                        {item.projectId && (
                          <Pressable
                            style={styles.warningAction}
                            onPress={() => handleAttachProject(null, item)}
                          >
                            <MaterialIcons name="link-off" size={18} color="#B45309" />
                            <Text style={styles.warningActionText}>Projeden çıkar</Text>
                          </Pressable>
                        )}

                        <Pressable
                          style={styles.deleteAction}
                          onPress={() => handleDeleteDocument(item.id)}
                        >
                          <MaterialIcons name="delete" size={18} color="#DC2626" />
                          <Text style={styles.deleteActionText}>Sil</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={projectModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProjectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Projeye Ekle</Text>
              <Pressable onPress={() => setProjectModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              {selectedDocument?.title || "Belge"} için proje seç.
            </Text>

            <ScrollView style={styles.projectList}>
              {projects.length === 0 ? (
                <Text style={styles.emptyProjectText}>Henüz proje bulunamadı.</Text>
              ) : (
                projects.map((project) => (
                  <Pressable
                    key={project.id}
                    style={[
                      styles.projectItem,
                      selectedDocument?.projectId === project.id &&
                        styles.projectItemActive,
                    ]}
                    onPress={() => handleAttachProject(project.id)}
                  >
                    <MaterialIcons name="folder" size={20} color="#2563EB" />
                    <Text style={styles.projectItemText}>{project.title}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>

            {selectedDocument?.projectId && (
              <Pressable
                style={styles.removeProjectButton}
                onPress={() => handleAttachProject(null)}
              >
                <MaterialIcons name="link-off" size={18} color="#B45309" />
                <Text style={styles.removeProjectButtonText}>Projeden çıkar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={previewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedDocument?.title || "Önizleme"}
              </Text>
              <Pressable onPress={() => setPreviewModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            {selectedDocument?.type === "Görsel" && previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <MaterialIcons name="insert-drive-file" size={54} color="#64748B" />
                <Text style={styles.previewTitle}>{selectedDocument?.type}</Text>
                <Text style={styles.previewText}>
                  Bu dosya türü için cihaz uygulamasıyla açma daha uygundur.
                </Text>
              </View>
            )}

            {selectedDocument && (
              <View style={styles.previewActions}>
                <Pressable
                  style={styles.primaryAction}
                  onPress={() => handleOpenDocument(selectedDocument)}
                >
                  <MaterialIcons name="open-in-new" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>Aç</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryAction}
                  onPress={() => handleShareDocument(selectedDocument)}
                >
                  <MaterialIcons name="ios-share" size={18} color="#334155" />
                  <Text style={styles.secondaryActionText}>Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.expandedRow}>
      <Text style={styles.expandedLabel}>{label}</Text>
      <Text style={styles.expandedValue}>{value}</Text>
    </View>
  );
}

function normalizeFileType(type: string): FileType {
  const value = String(type || "").toLowerCase();

  if (value.includes("pdf")) return "PDF";
  if (value.includes("excel") || value.includes("xls") || value.includes("spreadsheet")) {
    return "Excel";
  }
  if (value.includes("sunu") || value.includes("ppt") || value.includes("presentation")) {
    return "Sunu";
  }
  if (value.includes("word") || value.includes("doc")) return "Word";
  if (
    value.includes("görsel") ||
    value.includes("image") ||
    value.includes("png") ||
    value.includes("jpg") ||
    value.includes("jpeg")
  ) {
    return "Görsel";
  }

  return "Dosya";
}

function getFileMeta(type: FileType) {
  switch (type) {
    case "PDF":
      return { icon: "picture-as-pdf" as const, color: "#EF4444", softColor: "#FEE2E2" };
    case "Excel":
      return { icon: "table-chart" as const, color: "#22C55E", softColor: "#DCFCE7" };
    case "Sunu":
      return { icon: "slideshow" as const, color: "#F59E0B", softColor: "#FEF3C7" };
    case "Word":
      return { icon: "description" as const, color: "#3B82F6", softColor: "#DBEAFE" };
    case "Görsel":
      return { icon: "image" as const, color: "#A855F7", softColor: "#F3E8FF" };
    default:
      return { icon: "insert-drive-file" as const, color: "#64748B", softColor: "#E2E8F0" };
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 18 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchBox: {
    flex: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, color: "#0F172A", fontSize: 14 },
  filterButton: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  filterButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  filterScroll: { gap: 8, paddingBottom: 14 },
  typeFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeFilterButtonActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  typeFilterText: { fontSize: 13, color: "#475569", fontWeight: "700" },
  typeFilterTextActive: { color: "#FFFFFF" },
  uploadBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  uploadBoxDisabled: { opacity: 0.7 },
  uploadIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  uploadSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center" },
  centerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: { marginTop: 10, color: "#64748B", fontSize: 14, fontWeight: "600" },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "800", color: "#0F172A" },
  emptySubtitle: { marginTop: 6, fontSize: 13, color: "#64748B", textAlign: "center" },
  grid: { gap: 14 },
  cardWrapper: { width: "100%" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#F8FBFF",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { marginTop: 14, fontSize: 16, fontWeight: "700", color: "#0F172A" },
  cardType: { marginTop: 6, fontSize: 13, color: "#64748B" },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardProject: { fontSize: 12, color: "#94A3B8", fontWeight: "600", flex: 1 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginLeft: 8,
  },
  expandedPanel: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 16,
    padding: 14,
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  expandedLabel: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  expandedValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    maxWidth: "58%",
    textAlign: "right",
  },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: { color: "#FFFFFF", fontWeight: "700", marginLeft: 6 },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryActionText: { color: "#334155", fontWeight: "700", marginLeft: 6 },
  warningAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  warningActionText: { color: "#B45309", fontWeight: "700", marginLeft: 6 },
  deleteAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deleteActionText: { color: "#DC2626", fontWeight: "700", marginLeft: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: "75%",
  },
  previewBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  modalSubtitle: { marginTop: 8, fontSize: 13, color: "#64748B" },
  projectList: { marginTop: 14 },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  projectItemActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  projectItemText: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  emptyProjectText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  removeProjectButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 13,
  },
  removeProjectButtonText: { color: "#B45309", fontWeight: "800", marginLeft: 8 },
  previewImage: {
    width: "100%",
    height: 360,
    resizeMode: "contain",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginTop: 16,
  },
  previewPlaceholder: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  previewTitle: { marginTop: 10, fontSize: 16, fontWeight: "800", color: "#0F172A" },
  previewText: { marginTop: 6, fontSize: 13, color: "#64748B", textAlign: "center" },
  previewActions: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
});