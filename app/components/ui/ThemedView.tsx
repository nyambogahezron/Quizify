import { View, type ViewProps } from 'react-native';
import useThemeColor from '../../hooks/useThemeColor';

type ThemedViewProps = {
  lightColor?: string;
  darkColor?: string;
} & ViewProps;

export default function ThemedView({
  lightColor,
  darkColor,
  style,
  ...props
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({
    props: { light: lightColor || '', dark: darkColor || '', dim: '' },
    elementName: 'primary',
  });

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
