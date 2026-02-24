import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Pressable,
    TextInput,
    ImageBackground,
    Dimensions,
    Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width * 0.75;

export default function ProjePanosuScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("HEPSİ");

    const FILTERS = ["HEPSİ", "YÜKSEK", "ORTA", "DÜŞÜK"];

    const KANBAN_DATA = [
        {
            title: "YAPILACAKLAR",
            count: 1,
            color: "#6366F1",
            tasks: [
                {
                    id: "1",
                    priority: "YÜKSEK",
                    priorityColor: "#EF4444",
                    title: "DB Bağlanacak",
                    owner: "deneme",
                    assigneeIcon: "F",
                    assigneeName: "@furkan",
                    date: "26.02.2026"
                }
            ]
        },
        {
            title: "YAPILIYOR",
            count: 0,
            color: "#6366F1",
            tasks: []
        },
        {
            title: "TAMAMLANDI",
            count: 0,
            color: "#6366F1",
            tasks: []
        },
        {
            title: "HATALAR",
            count: 1,
            color: "#6366F1",
            tasks: [
                {
                    id: "2",
                    priority: "ORTA",
                    priorityColor: "#F59E0B",
                    title: "trello sayfası yapılacak",
                    owner: "deneme",
                    assigneeIcon: "A",
                    assigneeName: "@aleyna",
                    date: ""
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070' }}
                style={styles.background}
            >
                <SafeAreaView style={styles.safe}>
                    {/* Header Bar */}
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <Text style={styles.backBtnText}>← Geri Dön</Text>
                        </Pressable>

                        <Text style={styles.headerTitle}>PROJE PANOSU</Text>

                        <View style={styles.searchBox}>
                            <MaterialIcons name="search" size={18} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Görevlerde ara..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <View style={styles.topActions}>
                            <View style={styles.filterGroup}>
                                {FILTERS.map(f => (
                                    <Pressable
                                        key={f}
                                        style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                                        onPress={() => setActiveFilter(f)}
                                    >
                                        <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>{f}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View style={styles.userAvatars}>
                                <View style={[styles.avatar, { backgroundColor: '#3B82F6' }]}><Text style={styles.avatarText}>F</Text></View>
                                <View style={[styles.avatar, { backgroundColor: '#10B981' }]}><Text style={styles.avatarText}>A</Text></View>
                                <View style={[styles.avatar, { backgroundColor: '#F59E0B' }]}><Text style={styles.avatarText}>T</Text></View>
                            </View>

                            <Pressable style={styles.actionBtn}><Text style={styles.actionBtnText}>TEMİZLE</Text></Pressable>
                            <Pressable style={[styles.actionBtn, styles.resimBtn]}><Text style={[styles.actionBtnText, { color: '#2563EB' }]}>RESİM</Text></Pressable>
                        </View>
                    </View>

                    {/* Kanban Board */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.boardScroll}
                        snapToInterval={COLUMN_WIDTH + 16}
                        decelerationRate="fast"
                    >
                        {KANBAN_DATA.map((col, idx) => (
                            <View key={idx} style={styles.column}>
                                <View style={styles.columnHeader}>
                                    <View style={styles.columnHeaderLeft}>
                                        <Text style={styles.columnTitle}>{col.title}</Text>
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countText}>{col.count}</Text>
                                        </View>
                                    </View>
                                    <MaterialIcons name="wb-sunny" size={16} color="#A5B4FC" />
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.taskList}>
                                    {col.tasks.map(task => (
                                        <View key={task.id} style={styles.taskCard}>
                                            <View style={[styles.priorityTag, { backgroundColor: task.priorityColor }]}>
                                                <Text style={styles.priorityTagText}>{task.priority}</Text>
                                            </View>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={styles.taskOwner}>{task.owner}</Text>

                                            <View style={styles.taskFooter}>
                                                <View style={styles.assigneeRow}>
                                                    <View style={[styles.miniAvatar, { backgroundColor: '#6366F1' }]}>
                                                        <Text style={styles.miniAvatarText}>{task.assigneeIcon}</Text>
                                                    </View>
                                                    <Text style={styles.assigneeName}>{task.assigneeName}</Text>
                                                </View>
                                                <Text style={styles.taskDate}>{task.date}</Text>
                                            </View>
                                        </View>
                                    ))}

                                    <Pressable style={styles.addCardBtnInner}>
                                        <Text style={styles.addCardText}>+ YENİ KART</Text>
                                    </Pressable>
                                </ScrollView>

                                <Pressable style={styles.addCardBtnOuter}>
                                    <Text style={styles.addCardText}>+ YENİ KART</Text>
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1 },
    safe: { flex: 1, backgroundColor: 'rgba(255,255,255,0.4)' },

    header: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { alignSelf: 'flex-start', marginBottom: 10 },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center', letterSpacing: 1, marginBottom: 16 },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#111827' },

    topActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        flexWrap: 'wrap',
        gap: 8
    },
    filterGroup: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 4,
    },
    filterBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    filterBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filterBtnText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
    filterBtnTextActive: { color: '#6366F1' },

    userAvatars: { flexDirection: 'row', gap: -8, marginLeft: 8 },
    avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },

    actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    actionBtnText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
    resimBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16 },

    boardScroll: { paddingHorizontal: 16, paddingTop: 20 },
    column: {
        width: COLUMN_WIDTH,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 24,
        padding: 16,
        marginRight: 16,
        maxHeight: '85%',
    },
    columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    columnHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    columnTitle: { fontSize: 14, fontWeight: '900', color: '#111827', letterSpacing: 0.5 },
    countBadge: { backgroundColor: '#E0E7FF', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 10, fontWeight: '800', color: '#6366F1' },

    taskList: { flex: 1 },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    priorityTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 12 },
    priorityTagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
    taskTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
    taskOwner: { fontSize: 12, color: '#6B7280', marginBottom: 24 },

    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    miniAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    miniAvatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    assigneeName: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
    taskDate: { fontSize: 10, color: '#9CA3AF' },

    addCardBtnInner: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    addCardBtnOuter: {
        marginTop: 20,
        alignItems: 'center',
    },
    addCardText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
});
