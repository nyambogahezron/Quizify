import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useQuizByCategory, useSubmitQuiz } from '@/services/ApiQuery';
import { socketService } from '@/lib/socket';
import { useAchievementStore, useQuizStore } from '@/store/useStore';
import Colors, { SHADOWS } from 'constants/Colors';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { RootStackParamList } from '@/interface';
import { playSoundEffect } from '@/store/useSound';
import * as Haptics from 'expo-haptics';

interface Question {
	_id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	points: number;
}

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
	route: RouteProp<RootStackParamList, 'Quiz'>;
};

export default function QuizScreen({ navigation, route }: Props) {
	const { category } = route.params;
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [score, setScore] = useState(0);
	const [totalTimeLeft, setTotalTimeLeft] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isStarted, setIsStarted] = useState(false);
	const [showQuestionNav, setShowQuestionNav] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [currentQuestionData, setCurrentQuestionData] = useState<any>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [feedbackData, setFeedbackData] = useState<{
		isCorrect: boolean;
		correctAnswer: number;
		points: number;
	} | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);

	const { setUserRankings, userRankings } = useAchievementStore();

	const { data: quizData, isLoading } = useQuizByCategory(category);
	const { mutate: submitQuiz } = useSubmitQuiz();
	const { setCurrentQuiz, addToHistory } = useQuizStore();

	// Get the first quiz from the array for now
	const quiz = quizData?.quizzes?.[0];

	// Calculate total time limit in seconds
	const totalTimeLimit = quiz ? quiz.questions.length * quiz.timeLimit : 0;

	// Initialize socket connection
	useEffect(() => {
		let mounted = true;

		const initSocket = async () => {
			try {
				await socketService.connect();
				if (!mounted) return;
				setIsConnected(true);
			} catch (error) {
				console.error('Error connecting to socket:', error);
				setIsConnected(false);
			}
		};

		initSocket();

		// Set up socket event listeners
		const socket = socketService.getSocket();
		if (socket) {
			socket.on('quiz:question', (data) => {
				if (!mounted) return;
				console.log('Received question:', data);
				setCurrentQuestionData(data.question);
				setCurrentQuestion(data.questionNumber - 1);
				setSelectedAnswer(null);
				setTotalTimeLeft(data.timeLimit);
				setShowFeedback(false);
				setFeedbackData(null);
			});

			socket.on('quiz:answer-feedback', async (data) => {
				if (!mounted) return;
				console.log('Received feedback:', data);
				setFeedbackData(data);
				setShowFeedback(true);
				setScore((prev) => prev + data.points);

				// Play sound and haptic feedback based on correctness
				if (data.isCorrect) {
					await playSoundEffect('correct');
					await Haptics.notificationAsync(
						Haptics.NotificationFeedbackType.Success
					);
				} else {
					await playSoundEffect('incorrect');
					await Haptics.notificationAsync(
						Haptics.NotificationFeedbackType.Error
					);
				}
			});

			socket.on('quiz:completed', (data) => {
				if (!mounted || !quiz) return;
				console.log('Quiz completed event received:', data);

				try {
					const rankingData = {
						totalScore: data.score + (userRankings?.global?.totalScore || 0),
						quizzesCompleted: (userRankings?.global?.quizzesCompleted || 0) + 1,
						averageScore:
							(data.score + (userRankings?.global?.totalScore || 0)) /
							((userRankings?.global?.quizzesCompleted || 0) + 1),
						rank: userRankings?.global?.rank || 0,
						totalParticipants: userRankings?.global?.totalParticipants || 0,
						percentile: userRankings?.global?.percentile || 0,
					};

					const quizRankingData = {
						...userRankings,
						global: rankingData,
						quizzes: [
							...(userRankings?.quizzes || []),
							{
								quiz: quiz,
								score: data.score,
								timeSpent: data.timeSpent,
								rank: data.rank,
								totalParticipants: data.totalParticipants,
								percentile: data.percentile,
							},
						],
					};

					setUserRankings(quizRankingData);

					if (!quiz.questions) {
						throw new Error('Quiz questions not found');
					}

					console.log('Navigating to Result screen with data:', {
						score: data.score,
						totalQuestions: data.totalQuestions,
						quizId: quiz._id,
						reviewData: {
							questions: quiz.questions,
							answers,
							timeSpent: data.timeSpent,
							rank: data.rank,
							totalParticipants: data.totalParticipants,
							percentile: data.percentile,
						},
					});

					navigation.navigate('Result', {
						score: data.score,
						totalQuestions: data.totalQuestions,
						quizId: quiz._id,
						reviewData: {
							questions: quiz.questions,
							answers,
							timeSpent: data.timeSpent,
							rank: data.rank,
							totalParticipants: data.totalParticipants,
							percentile: data.percentile,
						},
					});
				} catch (error) {
					console.error('Error handling quiz completion:', error);
					// Show an error message to the user
					navigation.navigate('Home');
				}
			});
		}

		return () => {
			mounted = false;
			const socket = socketService.getSocket();
			if (socket) {
				socket.off('quiz:question');
				socket.off('quiz:answer-feedback');
				socket.off('quiz:completed');
			}
		};
	}, [navigation]);

	useEffect(() => {
		if (quiz?._id && isConnected) {
			setCurrentQuiz(quiz);
			socketService.joinQuiz(quiz._id);
		}

		return () => {
			if (quiz?._id) {
				socketService.leaveQuiz(quiz._id);
			}
		};
	}, [quiz, isConnected]);

	useEffect(() => {
		if (!isStarted) return;

		const timer = setInterval(() => {
			setTotalTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [isStarted]);

	const handleStart = async () => {
		if (!quiz?._id) return;
		setIsStarted(true);
		setTotalTimeLeft(quiz.timeLimit);
		socketService.joinQuiz(quiz._id);
	};

	const onClose = () => {
		navigation.goBack();
		setIsStarted(false);
		setTotalTimeLeft(0);
		setCurrentQuestion(0);
		setSelectedAnswer(null);
		setShowFeedback(false);
		setFeedbackData(null);
		setAnswers({});
		setScore(0);
		setCurrentQuiz(null);
		setIsConnected(false);
		socketService.leaveQuiz(quiz?._id || '');
	};

	const handleTimeUp = () => {
		if (currentQuestion < quiz.questions.length - 1) {
			// Move to next question if time runs out
			setCurrentQuestion((prev) => prev + 1);
			setSelectedAnswer(null);
			setTotalTimeLeft(quiz.timeLimit); // Reset timer for next question
		} else {
			// Complete quiz if this was the last question
			handleQuizComplete();
		}
	};

	const handleAnswer = async (selectedIndex: number) => {
		if (!quiz?._id || !currentQuestionData || isSubmitting) return;

		setSelectedAnswer(selectedIndex);
		setIsSubmitting(true);

		const timeSpent = quiz.timeLimit - (totalTimeLeft % quiz.timeLimit);

		// Submit answer through socket with the correct question ID from socket data
		socketService.submitAnswer(
			quiz._id,
			currentQuestionData._id,
			selectedIndex,
			timeSpent
		);

		// Update answers for this specific question
		setAnswers((prev) => ({
			...prev,
			[currentQuestionData._id]: selectedIndex.toString(),
		}));

		// Wait for feedback before moving to next question
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsSubmitting(false);
		setShowFeedback(false);
		setFeedbackData(null);
	};

	const handleQuizComplete = () => {
		if (!quiz?._id) {
			console.error('Quiz ID not found');
			navigation.navigate('Home');
			return;
		}

		if (!quiz?.questions) {
			console.error('Quiz questions not found');
			navigation.navigate('Home');
			return;
		}

		submitQuiz(
			{
				quizId: quiz._id,
				answers,
			},
			{
				onSuccess: (result) => {
					addToHistory(result);
					navigation.navigate('Result', {
						score,
						totalQuestions: quiz.questions.length,
						quizId: quiz._id,
						reviewData: {
							questions: quiz.questions,
							answers,
							timeSpent: result.timeSpent,
							rank: result.rank,
							totalParticipants: result.totalParticipants,
							percentile: result.percentile,
						},
					});
				},
				onError: (error) => {
					console.error('Error submitting quiz:', error);
					navigation.navigate('Home');
				},
			}
		);
	};

	const navigateToQuestion = (index: number) => {
		setCurrentQuestion(index);
		setSelectedAnswer(null);
		setShowQuestionNav(false);
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (isLoading || !quiz?.questions || !isConnected) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={styles.gradient}
			>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.backButton}
					>
						<Ionicons name='arrow-back' size={24} color={Colors.text} />
					</TouchableOpacity>
					<View style={styles.progressContainer}>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{
										width: `${
											((currentQuestion + 1) / quiz.questions.length) * 100
										}%`,
									},
								]}
							/>
						</View>
						<Text style={styles.progressText}>
							Question {currentQuestion + 1} of {quiz.questions.length}
						</Text>
					</View>
					<View style={styles.timerContainer}>
						<Ionicons name='time-outline' size={20} color={Colors.text} />
						<Text style={styles.timerText}>{formatTime(totalTimeLeft)}</Text>
					</View>
				</View>

				{/* Question */}
				<View style={styles.questionContainer}>
					<Text style={styles.questionText}>
						{currentQuestionData?.question || ''}
					</Text>
				</View>

				{/* Options */}
				<View style={styles.optionsContainer}>
					{currentQuestionData?.options.map((option: string, index: number) => (
						<TouchableOpacity
							key={index}
							style={[
								styles.optionButton,
								selectedAnswer === index && styles.selectedOption,
								showFeedback &&
									index === selectedAnswer &&
									!feedbackData?.isCorrect &&
									styles.incorrectOption,
								showFeedback &&
									index === feedbackData?.correctAnswer &&
									styles.correctOption,
							]}
							onPress={() => handleAnswer(index)}
							disabled={selectedAnswer !== null || isSubmitting || !isStarted}
						>
							<Text
								style={[
									styles.optionText,
									selectedAnswer === index && styles.selectedOptionText,
									showFeedback &&
										index === selectedAnswer &&
										!feedbackData?.isCorrect &&
										styles.incorrectOptionText,
									showFeedback &&
										index === feedbackData?.correctAnswer &&
										styles.correctOptionText,
								]}
							>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Feedback Message */}
				{showFeedback && feedbackData && (
					<Animated.View
						entering={FadeInUp}
						style={[
							styles.feedbackContainer,
							feedbackData.isCorrect
								? styles.feedbackCorrect
								: styles.feedbackIncorrect,
						]}
					>
						<Text style={styles.feedbackText}>
							{feedbackData.isCorrect
								? `Correct! +${feedbackData.points} points`
								: 'Incorrect. The correct answer is highlighted in green.'}
						</Text>
					</Animated.View>
				)}

				{/* Start Button or Blur Overlay */}
				{!isStarted && (
					<BlurView intensity={10} style={styles.blurOverlay}>
						{/* close btn */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => onClose()}
						>
							<Ionicons name='close' size={24} color={Colors.text} />
						</TouchableOpacity>
						<View style={styles.startContainer}>
							<Text style={styles.startTitle}>{quiz.title}</Text>
							<Text style={styles.startDescription}>
								{quiz.questions.length} questions • {formatTime(totalTimeLimit)}{' '}
								Total Time
							</Text>
							<TouchableOpacity
								style={styles.startButton}
								onPress={handleStart}
							>
								<Text style={styles.startButtonText}>Start Quiz</Text>
							</TouchableOpacity>
						</View>
					</BlurView>
				)}

				{/* Question Navigation Box */}
				{isStarted && (
					<Animated.View
						style={styles.questionNavContainer}
						entering={FadeInUp}
						exiting={FadeOutDown}
					>
						<ScrollView>
							<View style={styles.questionGrid}>
								{quiz.questions.map((question: Question, index: number) => (
									<TouchableOpacity
										key={index}
										style={[
											styles.questionNavItem,
											currentQuestion === index && styles.questionNavItemActive,
											answers[question._id] !== undefined &&
												styles.questionNavItemAnswered,
										]}
										onPress={() => navigateToQuestion(index)}
									>
										<Text
											style={[
												styles.questionNavText,
												currentQuestion === index &&
													styles.questionNavTextActive,
											]}
										>
											{index + 1}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
					</Animated.View>
				)}
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
	},
	backButton: {
		padding: 8,
	},
	progressContainer: {
		flex: 1,
		marginHorizontal: 20,
	},
	progressBar: {
		height: 4,
		backgroundColor: Colors.grayLight,
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: Colors.primary,
	},
	progressText: {
		color: Colors.text,
		fontSize: 12,
		marginTop: 4,
		textAlign: 'center',
	},
	timerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 8,
		borderRadius: 20,
	},
	timerText: {
		color: Colors.text,
		marginLeft: 4,
		fontSize: 14,
	},

	questionNavContainer: {
		position: 'absolute',
		bottom: 10,
		right: 20,
		backgroundColor: Colors.background,
		borderRadius: 12,
		padding: 12,
		zIndex: 1000,
		maxHeight: 300,
		width: '90%',
		...SHADOWS.small,
	},
	questionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	questionNavItem: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		borderRadius: 8,
	},
	questionNavItemActive: {
		backgroundColor: Colors.primary,
	},
	questionNavItemAnswered: {
		backgroundColor: Colors.success,
	},
	questionNavText: {
		color: Colors.text,
		fontSize: 16,
	},
	questionNavTextActive: {
		color: Colors.textLight,
	},
	questionContainer: {
		padding: 20,
	},
	questionText: {
		color: Colors.text,
		fontSize: 24,
		fontFamily: 'Rb-bold',
		textAlign: 'center',
	},
	optionsContainer: {
		padding: 20,
		gap: 12,
	},
	optionButton: {
		backgroundColor: Colors.grayLight,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	selectedOption: {
		backgroundColor: Colors.primary,
	},
	correctOption: {
		backgroundColor: Colors.success,
	},
	optionText: {
		color: Colors.text,
		fontSize: 16,
		fontFamily: 'Rb-medium',
	},
	selectedOptionText: {
		color: Colors.background,
	},
	correctOptionText: {
		color: Colors.background,
	},
	blurOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: Colors.background3,
		justifyContent: 'center',
		alignItems: 'center',
	},
	startContainer: {
		alignItems: 'center',
		padding: 20,
		marginTop: -30,
	},
	startTitle: {
		color: Colors.text,
		fontSize: 28,
		fontFamily: 'Rb-bold',
		marginBottom: 10,
	},
	startDescription: {
		color: Colors.text,
		fontSize: 16,
		marginBottom: 30,
	},
	startButton: {
		backgroundColor: Colors.background2,
		width: '100%',
		paddingHorizontal: 70,
		paddingVertical: 15,
		borderRadius: 10,
		...SHADOWS.small,
	},
	startButtonText: {
		color: Colors.textLight,
		fontSize: 18,
		fontFamily: 'Rb-bold',
	},
	closeButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		backgroundColor: Colors.grayLight,
		padding: 10,
		borderRadius: 10,
	},
	errorText: {
		color: Colors.red1,
		fontSize: 16,
		marginBottom: 20,
	},
	incorrectOption: {
		backgroundColor: Colors.red1,
	},
	incorrectOptionText: {
		color: Colors.background,
	},
	feedbackContainer: {
		margin: 20,
		padding: 15,
		borderRadius: 12,
		alignItems: 'center',
	},
	feedbackCorrect: {
		backgroundColor: Colors.success,
	},
	feedbackIncorrect: {
		backgroundColor: Colors.red1,
	},
	feedbackText: {
		color: Colors.background,
		fontSize: 16,
		fontFamily: 'Rb-medium',
		textAlign: 'center',
	},
});
