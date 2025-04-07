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

interface Level {
	id: number;
	number: number;
	status: 'locked' | 'unlocked' | 'completed';
	stars: number;
}
const levelsData: Level[] = [
	{ id: 1, number: 1, status: 'locked', stars: 5 },
	{ id: 2, number: 2, status: 'locked', stars: 5 },
	{ id: 3, number: 3, status: 'locked', stars: 5 },
	{ id: 4, number: 4, status: 'locked', stars: 5 },
	{ id: 5, number: 5, status: 'locked', stars: 0 },
	{ id: 6, number: 6, status: 'completed', stars: 3 },
	{ id: 7, number: 7, status: 'completed', stars: 4 },
	{ id: 8, number: 8, status: 'completed', stars: 1 },
	{ id: 9, number: 9, status: 'unlocked', stars: 0 },
	{ id: 10, number: 10, status: 'locked', stars: 0 },
];

const width = Dimensions.get('window').width;

export default function WordMakerLevels() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [levels, setLevels] = useState<Level[]>(levelsData);

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
					onPress={() => {
						if (item.status === 'unlocked') {
							navigation.navigate('WordGame' as 'WordFill' | 'WordGame', {
								levelId: item.id,
							});
						}
					}}
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
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
