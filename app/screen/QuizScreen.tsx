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
import { RootStackParamList } from '../lib/types';
import { useQuizByCategory, useSubmitQuiz } from '../services/api';
import { socketService } from '../lib/socket';
import { useQuizStore } from '../store/useStore';
import Colors from 'constants/Colors';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface Question {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	points: number;
}

interface Quiz {
	_id: string;
	title: string;
	questions: Question[];
	timeLimit: number;
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

				const socket = socketService.getSocket();
				if (socket) {
					socket.on('connect', () => {
						if (!mounted) return;
						console.log('Socket connected in QuizScreen');
						setIsConnected(true);
						socketService.testConnection();
					});

					socket.on('disconnect', () => {
						if (!mounted) return;
						console.log('Socket disconnected in QuizScreen');
						setIsConnected(false);
					});

					socket.on('test_connection_response', (data) => {
						if (!mounted) return;
						console.log('Test connection response in QuizScreen:', data);
					});

					socket.on('error', (error) => {
						if (!mounted) return;
						console.error('Socket error in QuizScreen:', error);
						setIsConnected(false);
					});
				}
			} catch (error) {
				if (!mounted) return;
				console.error('Error initializing socket:', error);
				setIsConnected(false);
			}
		};

		initSocket();

		return () => {
			mounted = false;
			const socket = socketService.getSocket();
			if (socket) {
				socket.off('connect');
				socket.off('disconnect');
				socket.off('test_connection_response');
				socket.off('error');
			}
		};
	}, []);

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
		const socket = socketService.getSocket();
		if (!socket) return;

		socket.on('quiz:question', (data) => {
			setTotalTimeLeft(totalTimeLimit);
			setCurrentQuestion(data.questionNumber - 1);
			setSelectedAnswer(null);
		});

		socket.on('quiz:completed', (data) => {
			addToHistory(data);
			navigation.navigate('Result', {
				score: data.score,
				totalQuestions: data.totalQuestions,
				quizId: quiz?._id || '',
			});
		});

		socket.on('error', (error) => {
			console.error('Socket error:', error);
		});

		return () => {
			socket.off('quiz:question');
			socket.off('quiz:completed');
			socket.off('error');
		};
	}, [quiz, navigation, totalTimeLimit]);

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

	const handleStart = () => {
		setIsStarted(true);
		setTotalTimeLeft(totalTimeLimit);
		socketService.getSocket()?.emit('quiz:start', quiz?._id);
	};

	const handleTimeUp = () => {
		handleQuizComplete();
	};

	const handleAnswer = (selectedIndex: number) => {
		if (!quiz?._id || !quiz?.questions || isSubmitting) return;

		setSelectedAnswer(selectedIndex);
		setIsSubmitting(true);

		const currentQuestionData = quiz.questions[currentQuestion];
		const timeSpent = quiz.timeLimit - (totalTimeLeft % quiz.timeLimit);

		setAnswers((prev) => ({
			...prev,
			[currentQuestionData.id]: selectedIndex.toString(),
		}));

		socketService.getSocket()?.emit('quiz:submit-answer', {
			quizId: quiz._id,
			questionId: currentQuestionData.id,
			answer: selectedIndex,
			timeSpent,
		});

		if (selectedIndex === currentQuestionData.correctAnswer) {
			setScore(score + currentQuestionData.points);
		}

		setIsSubmitting(false);
	};

	const handleQuizComplete = () => {
		if (!quiz?._id) return;

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
					});
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

	if (isLoading || !quiz?.questions) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	if (!isConnected) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.errorText}>Connecting to server...</Text>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	const currentQuestionData = quiz.questions[currentQuestion];

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
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
						{currentQuestionData.question}
					</Text>
				</View>

				{/* Options */}
				<View style={styles.optionsContainer}>
					{currentQuestionData.options.map((option: string, index: number) => (
						<TouchableOpacity
							key={index}
							style={[
								styles.optionButton,
								selectedAnswer === index && styles.selectedOption,
								selectedAnswer !== null &&
									index === currentQuestionData.correctAnswer &&
									styles.correctOption,
							]}
							onPress={() => handleAnswer(index)}
							disabled={selectedAnswer !== null || isSubmitting || !isStarted}
						>
							<Text
								style={[
									styles.optionText,
									selectedAnswer === index && styles.selectedOptionText,
									selectedAnswer !== null &&
										index === currentQuestionData.correctAnswer &&
										styles.correctOptionText,
								]}
							>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Start Button or Blur Overlay */}
				{!isStarted && (
					<BlurView intensity={10} style={styles.blurOverlay}>
						{/* close btn */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => navigation.goBack()}
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
								{quiz.questions.map((_: Question, index: number) => (
									<TouchableOpacity
										key={index}
										style={[
											styles.questionNavItem,
											currentQuestion === index && styles.questionNavItemActive,
											answers[quiz.questions[index].id] !== undefined &&
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
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
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
		backgroundColor: Colors.background,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		borderRadius: 12,
	},
	startContainer: {
		alignItems: 'center',
		padding: 20,
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
		backgroundColor: Colors.primary,
		paddingHorizontal: 40,
		paddingVertical: 15,
		borderRadius: 10,
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
});
