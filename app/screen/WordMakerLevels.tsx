import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	FlatList,
	TouchableOpacity,
	Animated,
	Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '.';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LevelDetailsModal } from '../components/LevelDetailsModal';
import { useUserWordMakerProgress } from '@/services/ApiQuery';
import { socketService } from '../lib/socket';

interface Level {
	id: number;
	number: number;
	status: 'locked' | 'unlocked' | 'completed';
	stars: number;
	score?: number;
	wordsFound?: Array<{ word: string; foundAt: Date }>;
	timeSpent?: number;
}

const width = Dimensions.get('window').width;

export default function WordMakerLevels() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
	const [showLevelDetails, setShowLevelDetails] = useState(false);

	const { data, isLoading } = useUserWordMakerProgress();

	const slideFromRight = useRef(new Animated.Value(width)).current;
	const slideIn = () => {
		Animated.timing(slideFromRight, {
			toValue: 0,
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	useEffect(() => {
		slideIn();
	}, []);

	const handleLevelPress = (level: Level) => {
		if (level.status === 'locked') return;

		setSelectedLevel(level);
		if (level.status === 'completed') {
			setShowLevelDetails(true);
		} else {
			socketService.startWordMakerLevel(level.id.toString());
			navigation.navigate('WordGame', { levelId: level.id });
		}
	};

	const handlePlayLevel = () => {
		if (selectedLevel) {
			setShowLevelDetails(false);
			navigation.navigate('WordGame', { levelId: selectedLevel.id });
		}
	};

	const LevelItem = ({ item }: { item: Level }) => {
		const borderAnimation = useRef(new Animated.Value(0)).current;

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

		const borderColor = borderAnimation.interpolate({
			inputRange: [0, 1],
			outputRange: ['#4F66EB', '#FFD700'],
		});

		return (
			<Animated.View
				style={[
					styles.levelItem,
					item.status === 'locked' && styles.lockedLevelItem,
					item.status === 'unlocked' && {
						borderColor: borderColor,
					},
				]}
			>
				<TouchableOpacity
					activeOpacity={0.4}
					style={styles.levelTouchable}
					disabled={item.status === 'locked'}
					onPress={() => handleLevelPress(item)}
				>
					<LinearGradient
						colors={
							item.status === 'locked'
								? [Colors.background3, Colors.background2]
								: [Colors.background2, Colors.background]
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

	if (isLoading || !data) {
		return (
			<SafeAreaView style={styles.container}>
				<LinearGradient
					colors={[Colors.background3, Colors.background2]}
					style={{ flex: 1 }}
				>
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading levels...</Text>
					</View>
				</LinearGradient>
			</SafeAreaView>
		);
	}

	// Create levels array based on totalLevels and userProgress
	const levels = Array.from({ length: data.totalLevels }, (_, index) => {
		const levelNumber = index + 1;
		const userProgress = data.userProgress.find((p) => p.level === levelNumber);

		return {
			id: levelNumber,
			number: levelNumber,
			status:
				userProgress?.status || (levelNumber === 1 ? 'unlocked' : 'locked'),
			stars: userProgress?.stars || 0,
			score: userProgress?.score,
			wordsFound: userProgress?.wordsFound,
			timeSpent: userProgress?.timeSpent,
		};
	});

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<Animated.View
					style={[
						styles.levelsContainer,
						{ transform: [{ translateX: slideFromRight }] },
					]}
				>
					<FlatList
						data={levels}
						renderItem={renderLevelItem}
						keyExtractor={(item) => item.id.toString()}
						numColumns={3}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.levelsList}
					/>
				</Animated.View>

				{selectedLevel && (
					<LevelDetailsModal
						visible={showLevelDetails}
						onClose={() => setShowLevelDetails(false)}
						onPlay={handlePlayLevel}
						level={{
							number: selectedLevel.number,
							score: selectedLevel.score || 0,
							wordsFound: selectedLevel.wordsFound || [],
							stars: selectedLevel.stars,
							timeSpent: selectedLevel.timeSpent || 0,
						}}
					/>
				)}
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: 'white',
		fontSize: 18,
	},
	levelsContainer: {
		flex: 1,
		paddingHorizontal: 10,
		width: width,
	},
	levelsList: {
		paddingBottom: 20,
		marginTop: 10,
	},
	levelItem: {
		padding: 8,
		width: width / 3 - 15,
		margin: 4,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: Colors.background2,
	},
	lockedLevelItem: {
		opacity: 0.8,
	},
	levelTouchable: {
		flex: 1,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%',
	},
	levelGradient: {
		position: 'relative',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
		paddingVertical: 35,
		width: '100%',
		height: '100%',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.5,
		borderColor: 'transparent',
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
		top: 10,
		flexDirection: 'row',
	},
	starIcon: {
		marginHorizontal: 2,
	},
});
