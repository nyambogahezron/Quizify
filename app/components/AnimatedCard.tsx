import React, { useRef, useEffect } from 'react';
import {
	View,
	StyleSheet,
	Animated,
	ViewStyle,
	TouchableOpacity,
} from 'react-native';
import Colors, { RADIUS, SHADOWS } from '@/constants/Colors';

interface AnimatedCardProps {
	children: React.ReactNode;
	style?: ViewStyle;
	onPress?: () => void;
	animateOnMount?: boolean;
	delay?: number;
}

const AnimatedCard = ({
	children,
	style,
	onPress,
	animateOnMount = true,
	delay = 0,
}: AnimatedCardProps) => {
	const scaleAnim = useRef(new Animated.Value(0.9)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (animateOnMount) {
			Animated.sequence([
				Animated.delay(delay),
				Animated.parallel([
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}),
					Animated.timing(opacityAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}),
				]),
			]).start();
		} else {
			// If not animating on mount, set to final values
			scaleAnim.setValue(1);
			opacityAnim.setValue(1);
		}
	}, []);

	const handlePress = () => {
		if (onPress) {
			Animated.sequence([
				Animated.timing(scaleAnim, {
					toValue: 0.95,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();

			onPress();
		}
	};

	const CardComponent = onPress ? TouchableOpacity : View;

	return (
		<Animated.View
			style={[
				styles.container,
				{
					opacity: opacityAnim,
					transform: [{ scale: scaleAnim }],
				},
				style,
			]}
		>
			<CardComponent
				style={styles.innerContainer}
				onPress={handlePress}
				activeOpacity={0.9}
			>
				{children}
			</CardComponent>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: RADIUS.lg,
		backgroundColor: Colors.white,
		...SHADOWS.medium,
		overflow: 'hidden',
	},
	innerContainer: {
		width: '100%',
		height: '100%',
	},
});

export default AnimatedCard;
