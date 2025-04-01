import React, { useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useAchievementStore, useAuthStore } from '@/store/useStore';
import { useAchievements } from '@/services/ApiQuery';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 80;

export default function ProfileScreen() {
	const { user, logout } = useAuthStore();
	const { userRankings } = useAchievementStore();
	const scrollY = useRef(new Animated.Value(0)).current;

	const navigation = useNavigation();

	const { data: achievements, isLoading: isLoadingAchievements } =
		useAchievements();

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

	if (isLoadingAchievements) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	return (
		<LinearGradient
			colors={[Colors.background3, Colors.background2]}
			style={styles.container}
		>
			<SafeAreaView style={styles.safeArea}>
				<Animated.View
					style={[
						styles.header,
						{
							transform: [{ translateY: headerTranslateY }],
							opacity: headerOpacity,
						},
					]}
				>
					{/* back btn */}
					<TouchableOpacity
						style={styles.backBtn}
						onPress={() => navigation.goBack()}
					>
						<Ionicons name='arrow-back' size={24} color={Colors.white2} />
					</TouchableOpacity>

					<View style={styles.profileHeader}>
						<View style={styles.profileImage}>
							<Text style={styles.profileImageText}>
								{user?.name.charAt(0).toUpperCase()}
							</Text>
						</View>
						<Text style={styles.profileName}>{user?.name}</Text>
						<Text style={styles.profileLevel}>Level {user?.level || 1}</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>
								{userRankings?.global?.quizzesCompleted || 0}
							</Text>
							<Text style={styles.statLabel}>Quizzes</Text>
						</View>
						<View style={[styles.statItem, styles.statBorder]}>
							<Text style={styles.statNumber}>
								#{userRankings?.global?.rank || 'N/A'}
							</Text>
							<Text style={styles.statLabel}>Rank</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={styles.statNumber}>
								{userRankings?.global?.totalScore || 0}
							</Text>
							<Text style={styles.statLabel}>Points</Text>
						</View>
					</View>
				</Animated.View>

				{/* mini header */}

				<Animated.View
					style={[
						styles.miniHeader,
						{
							opacity: miniHeaderOpacity,
						},
					]}
				>
					<View style={styles.miniProfileHeader}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{/* back btn */}
							<TouchableOpacity
								style={{ marginRight: 4 }}
								onPress={() => navigation.goBack()}
							>
								<Ionicons name='arrow-back' size={24} color={Colors.white2} />
							</TouchableOpacity>

							<View style={styles.miniProfileImage}>
								<Text style={styles.miniProfileImageText}>
									{user?.name.charAt(0).toUpperCase()}
								</Text>
							</View>
							<View style={styles.miniProfileInfo}>
								<Text style={styles.miniProfileName}>{user?.name}</Text>
								<Text style={styles.miniProfileLevel}>
									Level {user?.level || 1}
								</Text>
							</View>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<View style={[styles.miniStats, { marginRight: 10 }]}>
								<Text style={styles.miniStatNumber}>
									#{userRankings?.global?.rank || 0}
								</Text>
								<Text style={styles.miniStatLabel}>Rank</Text>
							</View>
							<View style={styles.miniStats}>
								<Text style={styles.miniStatNumber}>
									{userRankings?.global?.totalScore || 0}
								</Text>
								<Text style={styles.miniStatLabel}>Points</Text>
							</View>
						</View>

						{/* //logout btn  */}
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<TouchableOpacity style={styles.miniLogoutBtn} onPress={logout}>
								<Ionicons name='log-out' size={24} color={Colors.red1} />
							</TouchableOpacity>
						</View>
					</View>
				</Animated.View>

				<Animated.ScrollView
					showsVerticalScrollIndicator={false}
					onScroll={Animated.event(
						[{ nativeEvent: { contentOffset: { y: scrollY } } }],
						{ useNativeDriver: true }
					)}
					scrollEventThrottle={16}
					contentContainerStyle={[
						styles.content,
						{ paddingTop: HEADER_MAX_HEIGHT },
					]}
				>
					{/* Achievements  */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Achievements</Text>
						{achievements?.length === 0 ? (
							<Text style={styles.noAchievements}>No achievements yet</Text>
						) : (
							userRankings?.quizzes?.map((quiz: any) => (
								<View key={quiz.quiz._id} style={styles.achievementCard}>
									<View style={styles.achievementIcon}>
										<Text style={styles.iconText}>{quiz.rank}</Text>
									</View>
									<View style={styles.achievementInfo}>
										<Text style={styles.achievementTitle}>
											{quiz.quiz.category}
										</Text>
										<Text style={styles.achievementDescription}>
											{quiz.quiz.title}
										</Text>
										<View style={styles.progressBar}>
											<View
												style={[
													styles.progress,
													{
														width: `${
															(quiz.score / quiz.totalPossibleScore) * 100
														}%`,
													},
												]}
											/>
										</View>
										<Text style={styles.progressText}>
											{quiz.score}/{quiz.totalPossibleScore} Completed
										</Text>
									</View>
								</View>
							))
						)}
					</View>

					{/* attempted quizs  */}

					{/* Logout Button */}
					<TouchableOpacity style={styles.editButton} onPress={logout}>
						<Text style={styles.editButtonText}>Logout</Text>
					</TouchableOpacity>
				</Animated.ScrollView>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: HEADER_MAX_HEIGHT,
		zIndex: 1,
	},
	profileHeader: {
		alignItems: 'center',
		marginBottom: 20,
	},
	profileImage: {
		alignContent: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: Colors.white2,
	},
	profileImageText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: Colors.white2,
	},
	profileName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: Colors.white2,
		marginBottom: 4,
	},
	profileLevel: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	statsContainer: {
		flexDirection: 'row',
		backgroundColor: Colors.background3,
		borderRadius: 20,
		padding: 20,
		marginTop: 20,
		marginHorizontal: 10,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statBorder: {
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderColor: Colors.background,
	},
	statNumber: {
		fontSize: 20,
		fontWeight: 'bold',
		color: Colors.white2,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	miniHeader: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: HEADER_MIN_HEIGHT,
		backgroundColor: Colors.background,
		zIndex: 1,
		paddingHorizontal: 10,
		width: '100%',
	},
	miniProfileHeader: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		alignItems: 'center',
		height: '100%',
	},
	miniProfileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: Colors.background3,
		justifyContent: 'center',
		alignItems: 'center',
	},
	miniProfileImageText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: Colors.white2,
	},
	miniProfileInfo: {
		marginLeft: 12,
	},
	miniProfileName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.white2,
	},
	miniProfileLevel: {
		fontSize: 12,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	miniStats: {
		alignItems: 'center',
	},
	miniStatNumber: {
		fontSize: 16,
		fontWeight: 'bold',
		color: Colors.warning,
	},
	miniStatLabel: {
		fontSize: 12,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	content: {
		paddingBottom: HEADER_MAX_HEIGHT * 1.4,
		paddingHorizontal: 15,
	},
	section: {
		marginTop: 35,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: Colors.textLight,
		marginBottom: 16,
	},
	achievementCard: {
		flexDirection: 'row',
		backgroundColor: Colors.background3,
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	iconText: {
		fontSize: 24,
		color: Colors.textLight,
	},
	achievementInfo: {
		flex: 1,
	},
	achievementTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.textLight,
		marginLeft: 10,
	},
	achievementDescription: {
		fontSize: 14,
		color: Colors.textLight,
		marginBottom: 8,
		marginLeft: 10,
	},
	noAchievements: {
		fontSize: 16,
		color: Colors.textLight,
		marginBottom: 8,
		marginLeft: 10,
	},
	progressBar: {
		height: 4,
		backgroundColor: '#E9ECEF',
		borderRadius: 2,
		marginBottom: 4,
		marginLeft: 10,
	},
	progress: {
		height: '100%',
		backgroundColor: '#7C3AED',
		borderRadius: 2,
	},
	progressText: {
		fontSize: 12,
		color: '#666',
	},
	activityCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F8F9FA',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	activityIcon: {
		width: 40,
		height: 40,
		backgroundColor: Colors.white2,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	activityInfo: {
		flex: 1,
	},
	activityTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	activityScore: {
		fontSize: 14,
		color: '#666',
	},
	activityDate: {
		fontSize: 12,
		color: '#999',
	},
	editButton: {
		position: 'relative',
		bottom: 20,
		left: 0,
		right: 0,
		backgroundColor: Colors.red1,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 40,
	},
	editButtonText: {
		color: Colors.white2,
		fontSize: 16,
		fontWeight: '600',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backBtn: {
		position: 'absolute',
		top: 10,
		left: 20,
		zIndex: 1,
	},
	backBtnText: {
		fontSize: 24,
		color: Colors.white2,
	},
	miniLogoutBtn: {
		backgroundColor: Colors.background,
		padding: 10,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	achievementIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 40,
		height: 40,
		backgroundColor: Colors.background2,
		borderRadius: 20,
	},
});
