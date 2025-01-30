import Colors from '../constants/Colors';
import useThemeColor from './useThemeColor';

export default function useColorSchema(
  elementName: keyof typeof Colors.light &
    keyof typeof Colors.dark &
    keyof typeof Colors.dim
) {
  return useThemeColor({
    props: { light: 'light', dark: 'dark', dim: 'dim' },
    elementName: elementName || 'background',
  }) as 'light' | 'dark' | 'dim';
}
