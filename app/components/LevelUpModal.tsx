import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

interface LevelUpModalProps {
	isVisible: boolean;
	newLevel: number;
	previousLevel: number;
	onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
	isVisible,
	newLevel,
	previousLevel,
	onClose,
}) => {
	const scaleAnim = new Animated.Value(0);
	const opacityAnim = new Animated.Value(0);

	useEffect(() => {
		if (isVisible) {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 500,
					easing: Easing.elastic(1),
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();

			// Auto close after 3 seconds
			const timer = setTimeout(() => {
				onClose();
			}, 3000);

			return () => clearTimeout(timer);
		} else {
			scaleAnim.setValue(0);
			opacityAnim.setValue(0);
		}
	}, [isVisible]);

	if (!isVisible) return null;

	return (
		<View style={styles.container}>
			<BlurView intensity={80} style={styles.blurContainer}>
				<Animated.View
					style={[
						styles.modalContent,
						{
							transform: [{ scale: scaleAnim }],
							opacity: opacityAnim,
						},
					]}
				>
					<MaterialIcons name='emoji-events' size={80} color='#FFD700' />
					<Text style={styles.title}>Level Up!</Text>
					<Text style={styles.levelText}>
						{previousLevel} → {newLevel}
					</Text>
					<Text style={styles.congratsText}>
						Congratulations on reaching level {newLevel}!
					</Text>
				</Animated.View>
			</BlurView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	blurContainer: {
		flex: 1,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		padding: 20,
		borderRadius: 20,
		alignItems: 'center',
		width: '80%',
		maxWidth: 300,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#2C3E50',
		marginTop: 10,
	},
	levelText: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#FFD700',
		marginVertical: 10,
	},
	congratsText: {
		fontSize: 16,
		color: '#2C3E50',
		textAlign: 'center',
		marginTop: 10,
	},
});

export default LevelUpModal;
