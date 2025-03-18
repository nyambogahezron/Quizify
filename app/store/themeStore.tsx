import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetSystemTheme } from '../lib/systemTheme';

type Theme = 'light' | 'dark' | 'dim';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export async function GetUserTheme() {
  const systemTheme = GetSystemTheme();
  try {
    const theme = await AsyncStorage.getItem('theme');

    if (!theme) {
      return systemTheme as Theme;
    }
    return theme as Theme;
  } catch (error) {
    console.error(error);
    return systemTheme as Theme;
  }
}

export async function SetUserTheme(theme: Theme) {
  try {
    await AsyncStorage.setItem('theme', theme);
  } catch (error) {
    console.error(error);
  }
}

export async function GetTheme() {
  const userTheme = await GetUserTheme();
  return userTheme;
}

const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  setTheme: async (theme) => {
    set({ theme });
    await SetUserTheme(theme);
  },
}));

export default useThemeStore;
