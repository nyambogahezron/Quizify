import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/Colors';
import useColorSchema from '@/hooks/useColorSchema';
import useThemeStore from '@/store/themeStore';

export default function TmdStatusBar() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <StatusBar
      style={theme === 'light' ? 'dark' : 'light'}
      backgroundColor={Colors[useColorSchema('primary')].primary}
    />
  );
}
