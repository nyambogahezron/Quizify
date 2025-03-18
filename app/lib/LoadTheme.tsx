import useThemeStore, { GetUserTheme } from '../store/themeStore';

export default async function LoadTheme() {
  const theme = await GetUserTheme();
  const setTheme = useThemeStore((state) => state.setTheme);

  setTheme(theme);
}
