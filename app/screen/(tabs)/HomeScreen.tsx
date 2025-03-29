import React, { useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from 'constants/Colors';
import GameCard from 'components/GameCard';
import DailyTask from 'components/DailyTask';
import { useAuthStore, useAchievementStore } from '@/store/useStore';
import {
	useDailyTasks,
	useCategories,
	useUserRankings,
} from '@/services/ApiQuery';
import { moreGames } from '@/lib/data';
import Ionicons from '@expo/vector-icons/Ionicons';
import { socketService } from '@/lib/socket';
import { RootStackParamList } from '..';

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}

export default function HomeScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { user } = useAuthStore();
	const { setUserRankings, initialize } = useAchievementStore();

	const { data: dailyTasks, isLoading: isLoadingTasks } = useDailyTasks();
	const { data: categories, isLoading: isLoadingCategories } = useCategories();
	const { data: userRankings, isLoading: isLoadingUserRankings } =
		useUserRankings();

	useEffect(() => {
		initialize();
		if (userRankings && !isLoadingUserRankings) {
			setUserRankings(userRankings);
		}
	}, [userRankings]);

	console.log('userRankings from store', userRankings);
	//test connection
	socketService.testConnection();

	// Listen for points updates
	useEffect(() => {
		const socket = socketService.getSocket();
		if (socket) {
			socket.on('quiz:answer-feedback', (data) => {
				if (data.points > 0) {
					// Update user points in the store
					useAuthStore.getState().updatePoints(data.points);
				}
			});
		}

		return () => {
			const socket = socketService.getSocket();
			if (socket) {
				socket.off('quiz:answer-feedback');
			}
		};
	}, []);

	if (isLoadingTasks || isLoadingCategories) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.white} />
			</View>
		);
	}

	const CategoryLoadingSkeleton = () => {
		return (
			<View style={styles.categoryCard}>
				{Array.from({ length: 10 }).map((_, index) => (
					<View key={index} style={styles.categoryCardSkeleton} />
				))}
			</View>
		);
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity
							onPress={() => navigation.navigate('Profile')}
							style={styles.profile}
						>
							<View style={styles.avatar}>
								<Text style={{ fontSize: 20, color: 'white' }}>
									{user?.avatar || user?.name?.charAt(0).toUpperCase()}
								</Text>
							</View>
							<View>
								<Text style={styles.username}>{user?.name}</Text>
								<Text style={styles.level}>{`Level : ${
									user?.level ?? '0'
								}`}</Text>
							</View>
						</TouchableOpacity>
						<View style={styles.coins}>
							<Ionicons name='flash' size={20} color={Colors.red1} />
							<Text style={styles.coinsText}>
								{userRankings?.global?.totalScore || 0}
							</Text>
						</View>
					</View>

					{/* Daily Tasks */}
					<DailyTask
						task={dailyTasks?.[0]}
						onPress={() => navigation.navigate('DailyTasks')}
					/>

					{/* Quiz Categories */}
					<View style={[styles.section, { padding: 3 }]}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Quiz Categories</Text>
							<TouchableOpacity
								onPress={() =>
									navigation.navigate('QuizList', {
										categories: categories || [],
									})
								}
							>
								<Text style={styles.viewAll}>View All</Text>
							</TouchableOpacity>
						</View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{isLoadingCategories ? (
								<CategoryLoadingSkeleton />
							) : (
								<View style={styles.categories}>
									{(categories || [])
										.slice(0, 10)
										.map((category: Category, index: number) => (
											<TouchableOpacity
												key={index}
												style={styles.categoryCard}
												onPress={() =>
													navigation.navigate('Quiz', {
														category: category.name,
													})
												}
											>
												<Text style={styles.categoryIcon}>{category.icon}</Text>
												<Text style={styles.categoryName}>{category.name}</Text>
											</TouchableOpacity>
										))}
								</View>
							)}
						</ScrollView>
					</View>

					{/* More Games */}
					<View style={[styles.section, { marginBottom: 80, marginTop: 20 }]}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>More Games</Text>
							<TouchableOpacity
								onPress={() =>
									navigation.navigate('QuizList', {
										categories: categories || [],
									})
								}
							>
								<Text style={styles.viewAll}>View All</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.moreGames}>
							{moreGames.map((game) => (
								<GameCard
									key={game.id}
									game={game}
									handleOnPress={() => navigation.navigate('WordGame')}
								/>
							))}
						</View>
					</View>
				</ScrollView>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	header: {
		padding: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	profile: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: Colors.background2,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
	},
	username: {
		fontSize: 18,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	level: {
		color: Colors.textLight,
		fontSize: 14,
	},
	coins: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.background2,
		padding: 8,
		paddingHorizontal: 15,
		borderRadius: 20,
	},
	coinsText: {
		color: 'white',
		marginLeft: 4,
		fontWeight: '600',
	},
	section: {
		padding: 2,
	},
	sectionTitle: {
		fontSize: 20,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginBottom: 15,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 16,
		marginTop: 10,
	},

	viewAll: {
		color: Colors.textLight,
		fontSize: 14,
	},
	tasksContainer: {
		marginBottom: 20,
	},
	categoriesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	categories: {
		flexDirection: 'row',
		paddingHorizontal: 16,
	},
	categoryCard: {
		width: 120,
		height: 120,
		overflow: 'hidden',
		backgroundColor: Colors.background3,
		borderRadius: 16,
		marginHorizontal: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	categoryIcon: {
		fontSize: 34,
		marginBottom: 8,
		color: Colors.text,
		fontFamily: 'Rb-bold',
		backgroundColor: Colors.grayLight,
		padding: 15,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	categoryName: {
		color: 'white',
		fontSize: 12,
	},
	moreGames: {
		paddingHorizontal: 10,
	},
	categoryCardSkeleton: {
		width: 120,
		height: 120,
		backgroundColor: Colors.grayLight,
		borderRadius: 16,
	},
});
