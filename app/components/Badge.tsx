import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/Colors';

interface BadgeProps {
	count: number;
	style?: any;
}

export const Badge: React.FC<BadgeProps> = ({ count, style }) => {
	const scale = new Animated.Value(1);

	React.useEffect(() => {
		// Animate the badge when count changes
		Animated.sequence([
			Animated.timing(scale, {
				toValue: 1.2,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scale, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();
	}, [count]);

	return (
		<Animated.View
			style={[
				styles.badge,
				style,
				{
					transform: [{ scale }],
				},
			]}
		>
			<Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	badge: {
		backgroundColor: Colors.red1,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 4,
	},
	text: {
		color: Colors.white,
		fontSize: 12,
		fontWeight: 'bold',
	},
});
