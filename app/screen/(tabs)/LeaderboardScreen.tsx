import React, { useRef, useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	FlatList,
	TouchableOpacity,
	Animated,
	ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/interface/index.d';
import Colors from 'constants/Colors';
import { socketService } from '@/lib/socket';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
};

const rankColors = {
	0: Colors.warning, // Gold
	1: '#C0C0C0', // Silver
	2: '#CD7F32', // Bronze
};

interface LeaderboardItem {
	id: string;
	username: string;
	avatar?: string;
	score: number;
	position: number;
}

const HEADER_MAX_HEIGHT = 230;
const HEADER_MIN_HEIGHT = 100;

const AnimatedFlatList = Animated.createAnimatedComponent(
	FlatList
) as unknown as typeof FlatList;

export default function LeaderboardScreen({ navigation }: Props) {
	const scrollY = useRef(new Animated.Value(0)).current;
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
	const fadeAnimations = useRef<Animated.Value[]>([]);

	useEffect(() => {
		// Request leaderboard data
		socketService.getLeaderboard();

		// Listen for leaderboard updates
		const handleLeaderboardData = (data: any) => {
			const transformedData = data.leaderboard.map((item: any) => ({
				id: item.user.id,
				username: item.user.username,
				avatar: item.user.avatar,
				score: item.score,
				position: item.position,
			}));
			setLeaderboardData(transformedData);
		};

		socketService.onLeaderboardData(handleLeaderboardData);

		return () => {
			socketService.offLeaderboardData(handleLeaderboardData);
		};
	}, []);

	// Update fadeAnimations when data changes
	useEffect(() => {
		fadeAnimations.current = leaderboardData
			.slice(3)
			.map(() => new Animated.Value(0));
	}, [leaderboardData]);

	const headerTranslateY = scrollY.interpolate({
		inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
		outputRange: [0, -HEADER_MAX_HEIGHT + HEADER_MIN_HEIGHT],
		extrapolate: 'clamp',
	});

	const headerOpacity = scrollY.interpolate({
		inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
		outputRange: [1, 0],
		extrapolate: 'clamp',
	});

	const miniHeaderOpacity = scrollY.interpolate({
		inputRange: [
			HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - 50,
			HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
		],
		outputRange: [0, 1],
		extrapolate: 'clamp',
	});

	const imageScale = scrollY.interpolate({
		inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
		outputRange: [1, 0.5],
		extrapolate: 'clamp',
	});

	const renderItem: ListRenderItem<LeaderboardItem> = ({ item, index }) => {
		const animation = fadeAnimations.current[index] || new Animated.Value(0);
		return (
			<Animated.View
				style={{
					opacity: animation,
					transform: [
						{
							translateY: animation.interpolate({
								inputRange: [0, 1],
								outputRange: [50, 0],
							}),
						},
					],
				}}
			>
				<TouchableOpacity activeOpacity={0.8} style={styles.leaderboardItem}>
					<View style={styles.rankContainer}>
						<Text style={styles.rankText}>{item.position}</Text>
					</View>
					<View style={styles.userInfo}>
						<View style={styles.avatar}>
							{item.avatar ? (
								<Image
									source={{ uri: item.avatar }}
									style={styles.avatarImage}
								/>
							) : (
								<Text style={styles.avatarText}>
									{item.username.charAt(0).toUpperCase()}
								</Text>
							)}
						</View>
						<Text style={styles.username}>{item.username}</Text>
					</View>
					<View style={styles.scoreContainer}>
						<Ionicons name='star' size={20} color={Colors.warning} />
						<Text style={styles.scoreText}>{item.score}</Text>
					</View>
				</TouchableOpacity>
			</Animated.View>
		);
	};

	const FirstThreeItem = ({ index }: { index: number }) => {
		const item = leaderboardData[index];
		if (!item) return null;

		return (
			<Animated.View
				style={[
					styles.topConWrapper,
					{ top: index === 0 ? 0 : index === 1 ? -40 : 20 },
				]}
			>
				<Animated.View
					style={[
						styles.topThreeItem,
						{
							transform: [{ scale: imageScale }],
						},
					]}
				>
					{item.avatar ? (
						<Image
							source={{ uri: item.avatar }}
							style={[
								styles.avatarImage,
								{ width: '100%', height: '100%', borderRadius: 50 },
							]}
						/>
					) : (
						<Text style={styles.avatarText}>
							{item.username.charAt(0).toUpperCase()}
						</Text>
					)}
					<Text
						style={[
							styles.topThreeText,
							{
								color: rankColors[index as 0 | 1 | 2],
							},
						]}
					>
						{index + 1}
					</Text>
				</Animated.View>
				<Text style={styles.topThreeText2}>{item.username}</Text>
				<Text style={styles.topThreeText3}>{item.score}</Text>
			</Animated.View>
		);
	};

	const MiniFirstThreeItem = ({ index }: { index: number }) => {
		const item = leaderboardData[index];
		if (!item) return null;

		return (
			<View style={styles.miniTopConWrapper}>
				<View style={styles.miniTopThreeItem}>
					{item.avatar ? (
						<Image
							source={{ uri: item.avatar }}
							style={styles.miniAvatarImage}
						/>
					) : (
						<Text style={styles.avatarText}>
							{item.username.charAt(0).toUpperCase()}
						</Text>
					)}
					<Text
						style={[
							styles.miniTopThreeText,
							{
								color: rankColors[index as 0 | 1 | 2],
							},
						]}
					>
						{index + 1}
					</Text>
				</View>
				<View style={styles.miniUserInfo}>
					<Text style={styles.miniUsername}>{item.username}</Text>
					<Text style={styles.miniScore}>{item.score}</Text>
				</View>
			</View>
		);
	};

	if (leaderboardData.length === 0) {
		return (
			<SafeAreaView style={styles.container}>
				<LinearGradient
					colors={[Colors.background3, Colors.background2]}
					style={styles.gradient}
				>
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading leaderboard...</Text>
					</View>
				</LinearGradient>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={styles.gradient}
			>
				<Animated.View
					style={[
						styles.topThreeContainer,
						{
							transform: [{ translateY: headerTranslateY }],
							opacity: headerOpacity,
						},
					]}
				>
					{leaderboardData.slice(0, 3).map((_, index) => (
						<FirstThreeItem key={index} index={index} />
					))}
				</Animated.View>

				<Animated.View
					style={[
						styles.miniTopThreeContainer,
						{
							opacity: miniHeaderOpacity,
						},
					]}
				>
					{leaderboardData.slice(0, 3).map((_, index) => (
						<MiniFirstThreeItem key={index} index={index} />
					))}
				</Animated.View>

				<AnimatedFlatList
					data={leaderboardData.slice(3)}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={[
						styles.listContainer,
						{ paddingTop: HEADER_MAX_HEIGHT },
					]}
					showsVerticalScrollIndicator={false}
					onScroll={Animated.event(
						[{ nativeEvent: { contentOffset: { y: scrollY } } }],
						{ useNativeDriver: true }
					)}
					scrollEventThrottle={16}
				/>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	loadingText: {
		fontSize: 18,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	listContainer: {
		paddingHorizontal: 5,
		paddingBottom: 80,
	},
	leaderboardItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		borderRadius: 5,
		marginBottom: 5,
	},
	rankContainer: {
		width: 40,
		alignItems: 'center',
	},
	rankBadge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	rankText: {
		fontSize: 18,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	userInfo: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	avatarImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	avatarText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	username: {
		fontSize: 16,
		fontFamily: 'Rb-medium',
		color: Colors.text,
	},
	scoreContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 8,
		borderRadius: 20,
	},
	scoreText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 4,
	},
	topThreeContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		height: HEADER_MAX_HEIGHT,
		backgroundColor: Colors.background3,
		borderRadius: 20,
		marginHorizontal: 5,
		marginTop: 10,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	topThreeContainerCollapsed: {
		height: 100,
		marginTop: 0,
		borderRadius: 0,
	},
	topConWrapper: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
	},
	topThreeItem: {
		borderTopWidth: 1,
		borderRightWidth: 2,
		borderTopColor: Colors.yellow,
		borderRightColor: Colors.background,
		borderBottomWidth: 0.5,
		borderBottomColor: Colors.background,
		borderLeftWidth: 0.7,
		borderLeftColor: Colors.yellow,
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		width: 80,
		height: 80,
		borderRadius: 50,
	},
	topThreeItemCollapsed: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	topThreeText: {
		position: 'absolute',
		textAlign: 'center',
		marginHorizontal: 'auto',
		bottom: -10,
		backgroundColor: Colors.grayLight,
		width: 30,
		height: 30,
		borderRadius: 15,
		borderTopWidth: 1,
		borderRightWidth: 1,
		borderColor: Colors.white,
		fontSize: 24,
		fontFamily: 'Rb-bold',
		color: Colors.yellow,
	},
	topThreeText2: {
		textAlign: 'center',
		marginHorizontal: 'auto',
		bottom: 2,
		color: Colors.white2,
		fontSize: 16,
		fontFamily: 'Rb-bold',
		marginTop: 10,
		shadowColor: Colors.yellow,
	},
	topThreeText3: {
		textAlign: 'center',
		marginHorizontal: 'auto',
		bottom: 2,
		color: Colors.yellow,
		fontSize: 16,
		fontFamily: 'Rb-bold',
	},
	miniTopThreeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 60,
		backgroundColor: Colors.background3,
		position: 'absolute',
		top: 15,
		left: 0,
		right: 0,
		zIndex: 1,
		paddingHorizontal: 10,
	},
	miniTopConWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	miniTopThreeItem: {
		position: 'relative',
		width: 40,
		height: 40,
		marginRight: 8,
	},
	miniAvatarImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: Colors.yellow,
	},
	miniTopThreeText: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: Colors.grayLight,
		width: 20,
		height: 20,
		borderRadius: 10,
		textAlign: 'center',
		fontSize: 12,
		fontFamily: 'Rb-bold',
		color: Colors.yellow,
	},
	miniUserInfo: {
		flex: 1,
	},
	miniUsername: {
		fontSize: 14,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	miniScore: {
		fontSize: 12,
		fontFamily: 'Rb-medium',
		color: Colors.yellow,
	},
});
