import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { quizCategories, moreGames } from '../lib/data';
import { RootStackParamList } from '@/lib/types';
import Colors from '@/constants/Colors';
import GameCard from '@/components/GameCard';
import DailyTask from '@/components/DailyTask';
import { useUserStore } from '@/store';

export default function HomeScreen() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	const user = useUserStore((state) => state.user);

	React.useEffect(() => {
		if (!user) {
			navigation.push('CreateAccount');
		}
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
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
								<Text style={{ fontSize: 20 }}>{user?.avatar}</Text>
							</View>
							<View>
								<Text style={styles.username}>{user?.name}</Text>
								<Text style={styles.level}>{`Level : ${
									user?.level ?? ''
								}`}</Text>
							</View>
						</TouchableOpacity>
						<View style={styles.coins}>
							<Ionicons name='flash' size={20} color={Colors.red1} />
							<Text style={styles.coinsText}>{user?.points}</Text>
						</View>
					</View>

					{/* Daily Task */}
					<DailyTask />

					{/* Quiz Categories */}
					<View style={[styles.section, { padding: 3 }]}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Quiz</Text>
							<TouchableOpacity onPress={() => navigation.navigate('QuizList')}>
								<Text style={styles.viewAll}>View All</Text>
							</TouchableOpacity>
						</View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View style={styles.categories}>
								{quizCategories.slice(0, 10).map((category) => (
									<TouchableOpacity
										key={category.id}
										style={styles.categoryCard}
										onPress={() =>
											navigation.navigate('Quiz', { category: category.name })
										}
									>
										<Text style={styles.categoryIcon}>{category.icon}</Text>
										<Text style={styles.categoryName}>{category.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
					</View>

					{/* More Games */}
					<View style={[styles.section, { marginBottom: 80 }]}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>More Games</Text>
							<TouchableOpacity onPress={() => navigation.navigate('QuizList')}>
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
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
	},
	profile: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
		borderWidth: 1,
		borderColor: Colors.grayLight,
		boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
	},
	username: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	level: {
		color: Colors.textLight,
		fontSize: 14,
	},
	coins: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
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
		marginBottom: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 16,
		marginTop: 10,
	},
	sectionTitle: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	viewAll: {
		color: Colors.textLight,
		fontSize: 14,
	},
	categories: {
		flexDirection: 'row',
		paddingHorizontal: 16,
	},
	categoryCard: {
		width: 80,
		height: 80,
		backgroundColor: Colors.grayLight,
		borderRadius: 16,
		marginHorizontal: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	categoryIcon: {
		fontSize: 24,
		marginBottom: 4,
	},
	categoryName: {
		color: 'white',
		fontSize: 12,
	},
	moreGames: {
		paddingHorizontal: 10,
	},
});
