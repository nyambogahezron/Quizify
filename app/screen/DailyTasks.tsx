import React, { useState } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'lib/types';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'DailyTasks'>;
};

const dailyQuizzes = [
	{
		id: 1,
		title: 'Morning Warm-up',
		category: 'General Knowledge',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 2,
		title: 'Science Challenge',
		category: 'Science',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 3,
		title: 'History Explorer',
		category: 'History',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 4,
		title: 'Math Masters',
		category: 'Mathematics',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 5,
		title: 'Geography Quest',
		category: 'Geography',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 6,
		title: 'Tech Trivia',
		category: 'Technology',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 7,
		title: 'Sports Sprint',
		category: 'Sports',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 8,
		title: 'Arts & Culture',
		category: 'Arts',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 9,
		title: 'Language Challenge',
		category: 'Languages',
		questions: 5,
		completed: false,
		score: 0,
	},
	{
		id: 10,
		title: 'Final Challenge',
		category: 'Mixed',
		questions: 5,
		completed: false,
		score: 0,
	},
];

export default function DailyTasksScreen({ navigation }: Props) {
	const [quizzes, setQuizzes] = useState(dailyQuizzes);

	const completedQuizzes = quizzes.filter((quiz) => quiz.completed).length;
	const totalCorrectAnswers = quizzes.reduce(
		(sum, quiz) => sum + quiz.score,
		0
	);
	const bonusPoints = completedQuizzes === 10 ? 20 : 0;
	const totalPoints = totalCorrectAnswers * 2 + bonusPoints;

	const handleQuizPress = (quizId: number) => {
		navigation.navigate('Quiz', {
			category: quizzes.find((q) => q.id === quizId)?.category || '',
			isDaily: true,
			quizId: quizId,
		});
	};

	const getProgressColor = (completed: boolean) => {
		return completed ? '#4CAF50' : '#FFB800';
	};

	return (
		<LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<Text style={styles.title}>Daily Tasks</Text>
					<View style={styles.pointsContainer}>
						<Ionicons name='star' size={24} color='#FFD700' />
						<Text style={styles.points}>{totalPoints}</Text>
					</View>
				</View>

				<View style={styles.progressContainer}>
					<View style={styles.progressInfo}>
						<Text style={styles.progressText}>Daily Progress</Text>
						<Text style={styles.progressCount}>
							{completedQuizzes}/10 Completed
						</Text>
					</View>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progress,
								{ width: `${(completedQuizzes / 10) * 100}%` },
							]}
						/>
					</View>
					{completedQuizzes === 10 && (
						<View style={styles.bonusContainer}>
							<Text style={styles.bonusText}>+20 Bonus Points Earned!</Text>
						</View>
					)}
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{quizzes.map((quiz) => (
						<TouchableOpacity
							key={quiz.id}
							style={styles.quizCard}
							onPress={() => handleQuizPress(quiz.id)}
							disabled={quiz.completed}
						>
							<View style={styles.quizHeader}>
								<View style={styles.quizTitleContainer}>
									<Text style={styles.quizTitle}>{quiz.title}</Text>
									<Text style={styles.quizCategory}>{quiz.category}</Text>
								</View>
								{quiz.completed ? (
									<View style={styles.scoreContainer}>
										<Text style={styles.scoreText}>+{quiz.score * 2} pts</Text>
										<Ionicons
											name='checkmark-circle'
											size={24}
											color='#4CAF50'
										/>
									</View>
								) : (
									<Ionicons name='chevron-forward' size={24} color='#666' />
								)}
							</View>

							<View style={styles.quizProgress}>
								<View style={styles.quizProgressBar}>
									<View
										style={[
											styles.quizProgressFill,
											{
												width: quiz.completed ? '100%' : '0%',
												backgroundColor: getProgressColor(quiz.completed),
											},
										]}
									/>
								</View>
								<Text style={styles.questionsCount}>
									{quiz.completed ? 'Completed' : `${quiz.questions} Questions`}
								</Text>
							</View>
						</TouchableOpacity>
					))}
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
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
	pointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	points: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 6,
	},
	progressContainer: {
		margin: 20,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		padding: 16,
		borderRadius: 16,
	},
	progressInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	progressText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	progressCount: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 14,
	},
	progressBar: {
		height: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 3,
	},
	progress: {
		height: '100%',
		backgroundColor: '#FFB800',
		borderRadius: 3,
	},
	bonusContainer: {
		marginTop: 8,
		alignItems: 'center',
	},
	bonusText: {
		color: '#FFD700',
		fontSize: 14,
		fontWeight: '600',
	},
	content: {
		flex: 1,
		backgroundColor: 'white',
		marginTop: 20,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 20,
	},
	quizCard: {
		backgroundColor: '#F8F9FA',
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
	},
	quizHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	quizTitleContainer: {
		flex: 1,
	},
	quizTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	quizCategory: {
		fontSize: 14,
		color: '#666',
	},
	scoreContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	scoreText: {
		color: '#4CAF50',
		fontSize: 14,
		fontWeight: '600',
		marginRight: 4,
	},
	quizProgress: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	quizProgressBar: {
		flex: 1,
		height: 4,
		backgroundColor: '#E9ECEF',
		borderRadius: 2,
		marginRight: 8,
	},
	quizProgressFill: {
		height: '100%',
		borderRadius: 2,
	},
	questionsCount: {
		fontSize: 12,
		color: '#666',
		width: 80,
		textAlign: 'right',
	},
});
