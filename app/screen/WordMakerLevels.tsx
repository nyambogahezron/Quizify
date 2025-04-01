import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	FlatList,
	TouchableOpacity,
	Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Level {
	id: number;
	number: number;
	status: 'locked' | 'unlocked' | 'completed';
	stars: number;
}
const levelsData: Level[] = [
	{ id: 1, number: 1, status: 'unlocked', stars: 0 },
	{ id: 2, number: 2, status: 'locked', stars: 0 },
	{ id: 3, number: 3, status: 'locked', stars: 0 },
	{ id: 4, number: 4, status: 'locked', stars: 0 },
	{ id: 5, number: 5, status: 'locked', stars: 0 },
	{ id: 6, number: 6, status: 'locked', stars: 0 },
	{ id: 7, number: 7, status: 'locked', stars: 0 },
	{ id: 8, number: 8, status: 'locked', stars: 0 },
	{ id: 9, number: 9, status: 'locked', stars: 0 },
	{ id: 10, number: 10, status: 'locked', stars: 0 },
];

export default function WordMakerLevels() {
	const [levels, setLevels] = useState<Level[]>(levelsData);

	// Create a separate component for the LevelItem
	const LevelItem = ({ item }: { item: Level }) => {
		const borderAnimation = useRef(new Animated.Value(0)).current;

		// Start the animation for the current level
		useEffect(() => {
			if (item.status === 'unlocked') {
				Animated.loop(
					Animated.timing(borderAnimation, {
						toValue: 1,
						duration: 2000,
						useNativeDriver: false,
					})
				).start();
			}
		}, [item.status]);

		// Interpolate the border color and width
		const borderColor = borderAnimation.interpolate({
			inputRange: [0, 1],
			outputRange: ['#4F66EB', '#FFD700'], // Colors for the animation
		});
		const borderWidth = borderAnimation.interpolate({
			inputRange: [0, 1],
			outputRange: [2, 6], // Border width range
		});

		return (
			<Animated.View
				style={[
					styles.levelItem,
					item.status === 'locked' && styles.lockedLevelItem,
					item.status === 'unlocked' && {
						borderColor: borderColor,
						borderWidth: borderWidth,
					},
				]}
			>
				<TouchableOpacity
					style={styles.levelTouchable}
					disabled={item.status === 'locked'}
				>
					<LinearGradient
						colors={
							item.status === 'locked'
								? ['#3A3E4D', '#252A37']
								: ['#4F66EB', '#3A4CBA']
						}
						style={styles.levelGradient}
					>
						<Text style={styles.levelNumber}>{item.number}</Text>

						{item.status === 'locked' && (
							<View style={styles.levelLock}>
								<Ionicons name='lock-closed' size={18} color='#8E8E93' />
							</View>
						)}

						{item.status === 'completed' && (
							<View style={styles.starsContainer}>
								{[1, 2, 3].map((star) => (
									<Ionicons
										key={star}
										name={star <= item.stars ? 'star' : 'star-outline'}
										size={12}
										color={star <= item.stars ? '#FFD700' : '#8E8E93'}
										style={styles.starIcon}
									/>
								))}
							</View>
						)}
					</LinearGradient>
				</TouchableOpacity>
			</Animated.View>
		);
	};

	const renderLevelItem = ({ item }: { item: Level }) => {
		return <LevelItem item={item} />;
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Levels grid */}
			<View style={styles.levelsContainer}>
				<FlatList
					data={levels}
					renderItem={renderLevelItem}
					keyExtractor={(item) => item.id.toString()}
					numColumns={3}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.levelsList}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121421',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	backButton: {
		padding: 8,
	},
	title: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
	},
	settingsButton: {
		padding: 8,
	},
	worldSelector: {
		marginBottom: 20,
	},
	worldList: {
		paddingHorizontal: 16,
	},
	worldItem: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginRight: 10,
		borderRadius: 20,
		backgroundColor: '#252A37',
		flexDirection: 'row',
		alignItems: 'center',
	},
	selectedWorldItem: {
		backgroundColor: '#4F66EB',
	},
	lockedWorldItem: {
		backgroundColor: '#1E2330',
	},
	worldText: {
		color: 'white',
		fontWeight: '500',
	},
	selectedWorldText: {
		fontWeight: 'bold',
	},
	lockedWorldText: {
		color: '#8E8E93',
	},
	lockIcon: {
		marginLeft: 6,
	},
	progressContainer: {
		paddingHorizontal: 16,
		marginBottom: 20,
	},
	progressInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	progressLabel: {
		color: 'white',
		fontWeight: 'bold',
	},
	progressValue: {
		color: '#8E8E93',
	},
	progressBarBackground: {
		height: 8,
		backgroundColor: '#252A37',
		borderRadius: 4,
	},
	progressBar: {
		height: 8,
		backgroundColor: '#4F66EB',
		borderRadius: 4,
	},
	levelsContainer: {
		flex: 1,
		paddingHorizontal: 16,
	},
	levelsList: {
		paddingBottom: 20,
	},
	levelItem: {
		flex: 1 / 3,
		aspectRatio: 1,
		padding: 8,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	lockedLevelItem: {
		opacity: 0.8,
	},
	levelTouchable: {
		flex: 1,
		borderRadius: 16,
	},
	levelGradient: {
		flex: 1,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	levelNumber: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
	},
	levelLock: {
		position: 'absolute',
		bottom: 10,
		right: 10,
	},
	starsContainer: {
		position: 'absolute',
		bottom: 10,
		flexDirection: 'row',
	},
	starIcon: {
		marginHorizontal: 2,
	},
});
