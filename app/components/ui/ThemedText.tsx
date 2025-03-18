import { Text, StyleSheet } from 'react-native';
import useThemeColor from '../../hooks/useThemeColor';

type TextUI = {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';
  style?: any;
} & React.ComponentProps<typeof Text>;

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: TextUI) {
  const color = useThemeColor({
    props: { light: lightColor || '', dark: darkColor || '', dim: '' },
    elementName: 'primary',
  });

  return <Text style={[{ color }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
