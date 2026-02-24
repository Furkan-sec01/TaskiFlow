import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

function CenterTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.centerBtn} onPress={onPress}>
      <View style={styles.centerBtnInner}>
        <IconSymbol size={28} name="plus" color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F3F4F6',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="genel-bakis"
        options={{
          title: 'Genel Bakış',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Görevler',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.centerBtn}>
              <View style={styles.centerBtnInner}>
                <IconSymbol size={28} name="plus" color="#fff" />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirim',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -16,
  },
  centerBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
