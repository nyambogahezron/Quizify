import React, { useRef } from 'react';
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	Animated,
	TouchableOpacityProps,
	ViewStyle,
	TextStyle,
} from 'react-native';
import { playSound } from '@/lib/utils/sounds';
import { pulse, triggerHapticFeedback } from '@/lib/utils/animations';
import Colors, { RADIUS, SHADOWS } from '@/constants/Colors';

interface AnimatedButtonProps extends TouchableOpacityProps {
	title: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'text';
	size?: 'small' | 'medium' | 'large';
	containerStyle?: ViewStyle;
	textStyle?: TextStyle;
	hapticFeedback?:
		| 'light'
		| 'medium'
		| 'heavy'
		| 'success'
		| 'warning'
		| 'error'
		| 'none';
	playSound?: boolean;
}

const AnimatedButton = ({
	title,
	variant = 'primary',
	size = 'medium',
	containerStyle,
	textStyle,
	hapticFeedback = 'light',
	playSound: playSoundEffect = true,
	onPress,
	...rest
}: AnimatedButtonProps) => {
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePress = async (event: any) => {
		// Play animation
		pulse(scaleAnim).start();

		// Trigger haptic feedback
		if (hapticFeedback !== 'none') {
			triggerHapticFeedback[hapticFeedback]();
		}

		// Play sound effect
		if (playSoundEffect) {
			playSound('button');
		}

		// Call the original onPress handler
		if (onPress) {
			onPress(event);
		}
	};

	// Get button styles based on variant and size
	const getButtonStyles = (): ViewStyle => {
		// Base styles
		const baseStyle: ViewStyle = {
			...styles.button,
			...SHADOWS.medium,
		};

		// Variant styles
		switch (variant) {
			case 'primary':
				return {
					...baseStyle,
					backgroundColor: Colors.primary,
				};
			case 'secondary':
				return {
					...baseStyle,
					backgroundColor: Colors.secondary,
				};
			case 'outline':
				return {
					...baseStyle,
					backgroundColor: Colors.grayLight,
					borderWidth: 2,
					borderColor: Colors.primary,
				};
			case 'text':
				return {
					...baseStyle,
					backgroundColor: Colors.grayLight,
					shadowColor: Colors.grayLight,
					elevation: 0,
				};
			default:
				return baseStyle;
		}
	};

	// Get text styles based on variant and size
	const getTextStyles = (): TextStyle => {
		// Base styles
		const baseStyle: TextStyle = {
			...styles.text,
		};

		// Variant styles
		switch (variant) {
			case 'primary':
			case 'secondary':
				return {
					...baseStyle,
					color: Colors.white,
				};
			case 'outline':
			case 'text':
				return {
					...baseStyle,
					color: Colors.primary,
				};
			default:
				return baseStyle;
		}
	};

	// Get size styles
	const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
		switch (size) {
			case 'small':
				return {
					container: {
						paddingVertical: 8,
						paddingHorizontal: 16,
					},
					text: {
						fontSize: 14,
					},
				};
			case 'large':
				return {
					container: {
						paddingVertical: 16,
						paddingHorizontal: 32,
					},
					text: {
						fontSize: 18,
					},
				};
			case 'medium':
			default:
				return {
					container: {
						paddingVertical: 12,
						paddingHorizontal: 24,
					},
					text: {
						fontSize: 16,
					},
				};
		}
	};

	const buttonStyles = getButtonStyles();
	const textStyles = getTextStyles();
	const sizeStyles = getSizeStyles();

	return (
		<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
			<TouchableOpacity
				style={[buttonStyles, sizeStyles.container, containerStyle]}
				onPress={handlePress}
				activeOpacity={0.8}
				{...rest}
			>
				<Text style={[textStyles, sizeStyles.text, textStyle]}>{title}</Text>
			</TouchableOpacity>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: RADIUS.md,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontWeight: 'bold',
		textAlign: 'center',
	},
});

export default AnimatedButton;
