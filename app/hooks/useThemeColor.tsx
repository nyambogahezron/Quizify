import Colors from '../constants/Colors';
import useThemeStore from '../store/themeStore';

type Theme = 'light' | 'dark' | 'dim';
type ThemeProps = {
  props: { [key in Theme]: string };
  elementName: keyof typeof Colors.light &
    keyof typeof Colors.dark &
    keyof typeof Colors.dim;
};

export default function useThemeColor({ props, elementName }: ThemeProps) {
  const theme = useThemeStore((state) => state.theme);

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][elementName];
  }
}
