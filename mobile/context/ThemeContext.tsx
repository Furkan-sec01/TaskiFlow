import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'Açık' | 'Koyu' | 'Sistem';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  colors: typeof ThemeColors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeColors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#2563EB',
    tint: '#2563EB',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#F3F4F6',
    statusBadgeBg: '#EEF2FF',
    statusBadgeText: '#4F46E5',
    inputBg: '#FFFFFF',
    inputBorder: '#E5E7EB',
    inputText: '#111827',
    placeholder: '#9CA3AF',
    headerBg: '#FFFFFF',
    headerBorder: '#E5E7EB',
    modalBg: '#FFFFFF',
    modalBorder: '#E5E7EB',
    line: '#E5E7EB',
    cardLight: '#EEF2FF',
    avatarBg: '#EEF2FF',
    avatarText: '#4F46E5',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
    dangerCardBg: '#FFFDFD',
    trackBg: '#F3F4F6',
  },
  dark: {
    background: '#0B121F',      // Exact dark background from screenshot
    card: '#172237',            // Slightly lighter slate/navy container background
    text: '#FFFFFF',            // White text for high visibility
    textSecondary: '#94A3B8',   // Light blue-grey for description/labels
    border: '#1E293B',          // Dark slate border
    primary: '#2563EB',         // Accent blue
    tint: '#2563EB',
    tabBarBg: '#0B121F',        // Same as background
    tabBarBorder: '#1E293B',
    statusBadgeBg: '#1E293B',   // Darker badge
    statusBadgeText: '#94A3B8',
    inputBg: '#172237',         // Lighter input box background
    inputBorder: '#1E293B',
    inputText: '#FFFFFF',
    placeholder: '#64748B',
    headerBg: '#0B121F',        // Header matches main dark bg
    headerBorder: '#1E293B',
    modalBg: '#172237',
    modalBorder: '#1E293B',
    line: '#1E293B',
    cardLight: '#1E293B',
    avatarBg: '#1E293B',
    avatarText: '#94A3B8',
    dangerBg: '#2D1515',
    dangerBorder: '#7F1D1D',
    dangerCardBg: '#1A1212',
    trackBg: '#1E293B',
  }
};

const THEME_STORAGE_KEY = 'profile_theme';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>('Açık');
  const deviceColorScheme = useDeviceColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'Açık' || savedTheme === 'Koyu' || savedTheme === 'Sistem') {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDark = theme === 'Sistem' ? deviceColorScheme === 'dark' : theme === 'Koyu';
  const colors = isDark ? ThemeColors.dark : ThemeColors.light;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
