import { create } from 'zustand';
import { useColorScheme } from 'react-native';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ThemeState {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  primaryLight: '#E6F2FF',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E5E5E5',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryLight: '#1C1C1E',
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
};

export const useThemeStore = create<ThemeState>((set) => ({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => set((state) => ({
    isDark: !state.isDark,
    colors: !state.isDark ? darkColors : lightColors,
  })),
}));

// Hook to use theme
export const useTheme = () => {
  const { colors, isDark, toggleTheme } = useThemeStore();
  const systemColorScheme = useColorScheme();

  return {
    colors,
    isDark,
    toggleTheme,
  };
}; 