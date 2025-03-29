import React, { useRef } from 'react';
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
import { RootStackParamList } from '../../lib/types';
import Colors from 'constants/Colors';

const dummyData = [
	{
		id: '1',
		username: 'John Doe',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 100,
		rank: '🥇',
	},
	{
		id: '2',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: '🥈',
	},
	{
		id: '3',
		username: 'John Doe',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 100,
		rank: '🥉',
	},
	{
		id: '4',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '5',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '6',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '7',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '8',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '9',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
	{
		id: '10',
		username: 'Jane Smith',
		avatar:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
		score: 80,
		rank: 2,
	},
];
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
	rank: number | string;
}

const HEADER_MAX_HEIGHT = 230;
const HEADER_MIN_HEIGHT = 100;

const AnimatedFlatList = Animated.createAnimatedComponent(
	FlatList
) as unknown as typeof FlatList;

export default function LeaderboardScreen({ navigation }: Props) {
	const scrollY = useRef(new Animated.Value(0)).current;
	const fadeAnimations = useRef(
		dummyData.slice(3).map(() => new Animated.Value(0))
	).current;

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

	React.useEffect(() => {
		// Stagger the animations
		const animations = fadeAnimations.map((anim, index) => {
			return Animated.timing(anim, {
				toValue: 1,
				duration: 500,
				delay: index * 100, // 100ms delay between each item
				useNativeDriver: true,
			});
		});

		Animated.stagger(100, animations).start();
	}, []);

	const renderItem: ListRenderItem<LeaderboardItem> = ({ item, index }) => {
		return (
			<Animated.View
				style={{
					opacity: fadeAnimations[index],
					transform: [
						{
							translateY: fadeAnimations[index].interpolate({
								inputRange: [0, 1],
								outputRange: [50, 0],
							}),
						},
					],
				}}
			>
				<TouchableOpacity activeOpacity={0.8} style={styles.leaderboardItem}>
					<View style={styles.rankContainer}>
						<Text style={styles.rankText}>{index + 4}</Text>
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
					<Image
						source={{ uri: dummyData[index].avatar }}
						style={[
							styles.avatarImage,
							{ width: '100%', height: '100%', borderRadius: 50 },
						]}
					/>
					<Text
						style={[
							styles.topThreeText,
							{
								color: rankColors[index as 0 | 1 | 2],
							},
						]}
					>
						{dummyData[index].rank}
					</Text>
				</Animated.View>
				<Text style={styles.topThreeText2}>{dummyData[index].username}</Text>
				<Text style={styles.topThreeText3}>{dummyData[index].score}</Text>
			</Animated.View>
		);
	};

	const MiniFirstThreeItem = ({ index }: { index: number }) => {
		return (
			<View style={styles.miniTopConWrapper}>
				<View style={styles.miniTopThreeItem}>
					<Image
						source={{ uri: dummyData[index].avatar }}
						style={styles.miniAvatarImage}
					/>
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
					<Text style={styles.miniUsername}>{dummyData[index].username}</Text>
					<Text style={styles.miniScore}>{dummyData[index].score}</Text>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
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
					{dummyData.slice(0, 3).map((item, index) => (
						<FirstThreeItem key={item.id} index={index} />
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
					{dummyData.slice(0, 3).map((item, index) => (
						<MiniFirstThreeItem key={item.id} index={index} />
					))}
				</Animated.View>

				<AnimatedFlatList
					data={dummyData.slice(3)}
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
		backgroundColor: Colors.background,
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
		backgroundColor: Colors.background,
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
