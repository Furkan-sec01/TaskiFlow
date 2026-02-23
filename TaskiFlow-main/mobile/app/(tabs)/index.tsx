import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";

// --- EKİP ÜYELERİ ---
const TEAM_MEMBERS: Record<string, string[]> = {
  "1": ["Helin", "Semra", "Abdulbaki"],
  "2": ["Talha", "Aleyna", "Feyza"],
  "3": ["Furkan"],
};

// --- ÖRNEK VERİLER ---
const initialProjects = [
  {
    id: "1",
    name: "Mobil Uygulama",
    color: "#2563EB",
    tasks: [
      { id: "t1", title: "Login ekranı", status: "done", assignee: "Helin" },
      { id: "t2", title: "Register ekranı", status: "done", assignee: "Semra" },
      { id: "t3", title: "Anasayfa tasarımı", status: "inprogress", assignee: "Abdulbaki" },
      { id: "t4", title: "API bağlantısı", status: "todo", assignee: "" },
    ],
  },
  {
    id: "2",
    name: "Web Sitesi",
    color: "#7C3AED",
    tasks: [
      { id: "t5", title: "Landing page", status: "done", assignee: "Feyza" },
      { id: "t6", title: "Dashboard", status: "inprogress", assignee: "Aleyna" },
      { id: "t7", title: "Kullanıcı ayarları", status: "todo", assignee: "Talha" },
    ],
  },
  {
    id: "3",
    name: "Backend API",
    color: "#059669",
    tasks: [
      { id: "t8", title: "Auth endpoint", status: "done", assignee: "Furkan" },
      { id: "t9", title: "Task CRUD", status: "inprogress", assignee: "Furkan" },
      { id: "t10", title: "Bildirim servisi", status: "todo", assignee: "" },
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  todo: "Yapılacak",
  inprogress: "Devam Ediyor",
  done: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "#F59E0B",
  inprogress: "#3B82F6",
  done: "#10B981",
};

const COLUMNS = ["todo", "inprogress", "done"];

const getInitials = (name: string) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function HomeScreen() {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(initialProjects[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addToColumn, setAddToColumn] = useState("todo");

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todo");

  const allTasks = projects.flatMap((p) => p.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "inprogress").length;

  const openModal = (col: string) => {
    setAddToColumn(col);
    setSelectedStatus(col);
    setTaskTitle("");
    setSelectedAssignee("");
    setModalVisible(true);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert("Uyarı", "Görev adı boş olamaz!");
      return;
    }

    const newTask = {
      id: "t" + Date.now(),
      title: taskTitle.trim(),
      status: selectedStatus,
      assignee: selectedAssignee,
    };

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find((p) => p.id === selectedProject.id)!);
    setModalVisible(false);
  };

  const teamMembers = TEAM_MEMBERS[selectedProject.id] || [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>Helin</Text>
        </View>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>H</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ÖZET KARTLAR */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#EFF6FF" }]}>
            <Text style={[styles.statNumber, { color: "#2563EB" }]}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Toplam{"\n"}Görev</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F0FDF4" }]}>
            <Text style={[styles.statNumber, { color: "#10B981" }]}>{doneTasks}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF7ED" }]}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{inProgressTasks}</Text>
            <Text style={styles.statLabel}>Devam{"\n"}Eden</Text>
          </View>
        </View>

        {/* PROJELER */}
        <Text style={styles.sectionTitle}>Projeler</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.projectsScroll}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {projects.map((project) => (
            <Pressable
              key={project.id}
              style={[
                styles.projectChip,
                selectedProject.id === project.id && {
                  backgroundColor: project.color,
                },
              ]}
              onPress={() => setSelectedProject(project)}
            >
              <View
                style={[
                  styles.projectDot,
                  {
                    backgroundColor:
                      selectedProject.id === project.id ? "#fff" : project.color,
                  },
                ]}
              />
              <Text
                style={[
                  styles.projectChipText,
                  selectedProject.id === project.id && { color: "#fff" },
                ]}
              >
                {project.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* EKİP ÜYELERİ */}
        <Text style={styles.sectionTitle}>Ekip</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          style={{ marginBottom: 4 }}
        >
          {teamMembers.map((member) => (
            <View key={member} style={styles.memberCard}>
              <View style={[styles.memberAvatar, { backgroundColor: selectedProject.color }]}>
                <Text style={styles.memberAvatarText}>{getInitials(member)}</Text>
              </View>
              <Text style={styles.memberName}>{member}</Text>
              <Text style={styles.memberTaskCount}>
                {selectedProject.tasks.filter((t) => t.assignee === member).length} görev
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* KANBAN BOARD */}
        <Text style={styles.sectionTitle}>Görev Panosu</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        >
          {COLUMNS.map((col) => (
            <View key={col} style={styles.kanbanColumn}>
              {/* Kolon Başlığı */}
              <View style={styles.columnHeader}>
                <View style={[styles.columnDot, { backgroundColor: STATUS_COLORS[col] }]} />
                <Text style={styles.columnTitle}>{STATUS_LABELS[col]}</Text>
                <View style={[styles.columnBadge, { backgroundColor: STATUS_COLORS[col] + "33" }]}>
                  <Text style={[styles.columnBadgeText, { color: STATUS_COLORS[col] }]}>
                    {selectedProject.tasks.filter((t) => t.status === col).length}
                  </Text>
                </View>
              </View>

              {/* Görev Kartları */}
              {selectedProject.tasks
                .filter((t) => t.status === col)
                .map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.assignee ? (
                      <View style={styles.taskAssigneeRow}>
                        <View style={[styles.taskAvatar, { backgroundColor: selectedProject.color }]}>
                          <Text style={styles.taskAvatarText}>{getInitials(task.assignee)}</Text>
                        </View>
                        <Text style={styles.taskAssigneeName}>{task.assignee}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.taskBadge, { backgroundColor: STATUS_COLORS[col] + "22" }]}>
                      <Text style={[styles.taskBadgeText, { color: STATUS_COLORS[col] }]}>
                        {STATUS_LABELS[col]}
                      </Text>
                    </View>
                  </View>
                ))}

              {/* Görev Ekle */}
              <Pressable style={styles.addTaskBtn} onPress={() => openModal(col)}>
                <Text style={styles.addTaskText}>+ Görev Ekle</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ALT NAVİGASYON */}
      <View style={styles.bottomNav}>
        {[
          { key: "home", icon: "⊞", label: "Anasayfa" },
          { key: "tasks", icon: "✓", label: "Görevler" },
          { key: "add", icon: "+", label: "Ekle", special: true },
          { key: "notifications", icon: "🔔", label: "Bildirim" },
          { key: "profile", icon: "👤", label: "Profil" },
        ].map((tab) => (
          <Pressable key={tab.key} style={styles.navItem} onPress={tab.special ? () => openModal("todo") : undefined}>
            {tab.special ? (
              <View style={styles.navAddBtn}>
                <Text style={styles.navAddIcon}>{tab.icon}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.navIcon}>{tab.icon}</Text>
                <Text style={styles.navLabel}>{tab.label}</Text>
              </>
            )}
          </Pressable>
        ))}
      </View>

      {/* GÖREV EKLEME MODALI */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Yeni Görev Ekle</Text>
            <Text style={styles.modalProject}>📁 {selectedProject.name}</Text>

            {/* Görev Adı */}
            <Text style={styles.modalLabel}>Görev Adı</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Görev adını yaz..."
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            {/* Kişi Atama */}
            <Text style={styles.modalLabel}>Kişi Ata</Text>
            <View style={styles.assigneeRow}>
              <Pressable
                style={[
                  styles.assigneeChip,
                  selectedAssignee === "" && styles.assigneeChipActive,
                ]}
                onPress={() => setSelectedAssignee("")}
              >
                <Text style={[styles.assigneeChipText, selectedAssignee === "" && { color: "#fff" }]}>
                  Yok
                </Text>
              </Pressable>
              {teamMembers.map((member) => (
                <Pressable
                  key={member}
                  style={[
                    styles.assigneeChip,
                    selectedAssignee === member && styles.assigneeChipActive,
                  ]}
                  onPress={() => setSelectedAssignee(member)}
                >
                  <Text style={[styles.assigneeChipText, selectedAssignee === member && { color: "#fff" }]}>
                    {member}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Durum Seçimi */}
            <Text style={styles.modalLabel}>Durum</Text>
            <View style={styles.statusRow}>
              {COLUMNS.map((col) => (
                <Pressable
                  key={col}
                  style={[
                    styles.statusChip,
                    { borderColor: STATUS_COLORS[col] },
                    selectedStatus === col && { backgroundColor: STATUS_COLORS[col] },
                  ]}
                  onPress={() => setSelectedStatus(col)}
                >
                  <Text style={[styles.statusChipText, { color: selectedStatus === col ? "#fff" : STATUS_COLORS[col] }]}>
                    {STATUS_LABELS[col]}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Butonlar */}
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAddTask}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  greeting: { fontSize: 13, color: "#6B7280" },
  userName: { fontSize: 22, fontWeight: "800", color: "#111827" },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  statNumber: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 4, textAlign: "center" },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  projectsScroll: { marginBottom: 4 },
  projectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  projectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectChipText: { fontSize: 13, fontWeight: "600", color: "#374151" },

  memberCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  memberAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  memberName: { fontSize: 12, fontWeight: "700", color: "#1E293B" },
  memberTaskCount: { fontSize: 10, color: "#94A3B8", marginTop: 2 },

  kanbanColumn: {
    width: 220,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  columnDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  columnTitle: { fontSize: 13, fontWeight: "700", color: "#374151", flex: 1 },
  columnBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  columnBadgeText: { fontSize: 12, fontWeight: "700" },

  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 8 },
  taskAssigneeRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  taskAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  taskAvatarText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  taskAssigneeName: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  taskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskBadgeText: { fontSize: 11, fontWeight: "600" },

  addTaskBtn: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  addTaskText: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: "#94A3B8", marginTop: 3 },
  navAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navAddIcon: { fontSize: 24, color: "#fff", fontWeight: "300" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  modalProject: { fontSize: 13, color: "#6B7280", marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
  modalInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginBottom: 16,
    fontSize: 14,
  },
  assigneeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  assigneeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  assigneeChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  assigneeChipText: { fontSize: 13, fontWeight: "600", color: "#374151" },

  statusRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statusChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  statusChipText: { fontSize: 11, fontWeight: "700" },

  modalButtons: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});