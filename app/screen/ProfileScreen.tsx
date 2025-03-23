import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { achievements, recentActivity } from '../lib/data';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
	const { user } = useAuth();
	return (
		<LinearGradient
			colors={[Colors.background, Colors.background2]}
			style={styles.container}
		>
			<SafeAreaView style={styles.safeArea}>
				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<View style={styles.profileHeader}>
							<View style={styles.profileImage}>
								<Text style={styles.profileImageText}>
									{user?.name.charAt(0).toUpperCase()}
								</Text>
							</View>
							<Text style={styles.profileName}>{user?.name}</Text>
							<Text style={styles.profileLevel}>Level {user?.level || 1}</Text>
						</View>

						{/* Stats */}
						<View style={styles.statsContainer}>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>156</Text>
								<Text style={styles.statLabel}>Quizzes</Text>
							</View>
							<View style={[styles.statItem, styles.statBorder]}>
								<Text style={styles.statNumber}>432</Text>
								<Text style={styles.statLabel}>Rank</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>1.2K</Text>
								<Text style={styles.statLabel}>Points</Text>
							</View>
						</View>
					</View>

					{/* Content */}
					<View style={styles.content}>
						{/* Achievements */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Achievements</Text>
							{achievements.map((achievement) => (
								<View key={achievement.id} style={styles.achievementCard}>
									<View style={styles.achievementIcon}>
										<Text style={styles.iconText}>{achievement.icon}</Text>
									</View>
									<View style={styles.achievementInfo}>
										<Text style={styles.achievementTitle}>
											{achievement.title}
										</Text>
										<Text style={styles.achievementDescription}>
											{achievement.description}
										</Text>
										<View style={styles.progressBar}>
											<View
												style={[
													styles.progress,
													{
														width: `${
															(achievement.progress / achievement.total) * 100
														}%`,
													},
												]}
											/>
										</View>
										<Text style={styles.progressText}>
											{achievement.progress}/{achievement.total} Completed
										</Text>
									</View>
								</View>
							))}
						</View>

						{/* Recent Activity */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Recent Activity</Text>
							{recentActivity.map((activity) => (
								<View key={activity.id} style={styles.activityCard}>
									<View style={styles.activityIcon}>
										<Text style={styles.iconText}>{activity.icon}</Text>
									</View>
									<View style={styles.activityInfo}>
										<Text style={styles.activityTitle}>{activity.quiz}</Text>
										<Text style={styles.activityScore}>
											Score: {activity.score}/{activity.total}
										</Text>
									</View>
									<Text style={styles.activityDate}>{activity.date}</Text>
								</View>
							))}
						</View>

						{/* Edit Profile Button */}
						<TouchableOpacity style={styles.editButton}>
							<Text style={styles.editButtonText}>Logout</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
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
		padding: 20,
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
		borderColor: 'white',
	},
	profileImageText: {
		fontSize: 40,
		fontWeight: 'bold',
		color: 'white',
	},
	profileName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
		marginBottom: 4,
	},
	profileLevel: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	statsContainer: {
		flexDirection: 'row',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 20,
		padding: 20,
		marginTop: 20,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statBorder: {
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	statNumber: {
		fontSize: 20,
		fontWeight: 'bold',
		color: 'white',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	content: {
		flex: 1,

		padding: 20,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 16,
	},
	achievementCard: {
		flexDirection: 'row',
		backgroundColor: '#F8F9FA',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	achievementIcon: {
		width: 50,
		height: 50,
		backgroundColor: 'white',
		borderRadius: 25,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	iconText: {
		fontSize: 24,
	},
	achievementInfo: {
		flex: 1,
	},
	achievementTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	achievementDescription: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
	},
	progressBar: {
		height: 4,
		backgroundColor: '#E9ECEF',
		borderRadius: 2,
		marginBottom: 4,
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
		backgroundColor: 'white',
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
		backgroundColor: '#FF6B6B',
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 8,
	},
	editButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
