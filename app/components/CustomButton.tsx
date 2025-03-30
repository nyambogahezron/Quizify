import { playSound } from '@/lib/utils/sounds';
import * as Haptics from 'expo-haptics';

import {
	TouchableOpacity,
	Text,
	StyleSheet,
	StyleProp,
	ViewStyle,
	TextStyle,
	ActivityIndicator,
} from 'react-native';

interface CustomButtonProps {
	label: string;
	onPress: () => void;
	disabled?: boolean;
	customStyle?: StyleProp<ViewStyle>;
	isLoading?: boolean;
	textStyle?: StyleProp<TextStyle>;
}

export default function CustomButton({
	label,
	onPress,
	disabled,
	customStyle,
	isLoading,
	textStyle,
}: CustomButtonProps) {
	const handlePress = () => {
		playSound('button');
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};
	return (
		<TouchableOpacity
			style={[styles.button, customStyle]}
			onPress={onPress}
			disabled={disabled}
		>
			{isLoading ? (
				<ActivityIndicator color='#FFFFFF' />
			) : (
				<Text style={[styles.buttonText, textStyle]}>{label}</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		height: 56,
		borderRadius: 12,
		backgroundColor: '#6C63FF',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	buttonText: {
		fontFamily: 'Poppins-SemiBold',
		fontSize: 16,
		color: '#FFFFFF',
	},
});
