import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../lib/types';
import { useQuizById, useSubmitQuiz } from '../services/api';
import { socketService } from '../lib/socket';
import { useQuizStore } from '../store/useStore';
import Colors from 'constants/Colors';

interface Question {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
}

interface Quiz {
	id: string;
	title: string;
	questions: Question[];
}

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
	route: RouteProp<RootStackParamList, 'Quiz'>;
};

const TIMER_SECONDS = 60;

export default function QuizScreen({ navigation, route }: Props) {
	const { quizId } = route.params;
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	const { data: quiz, isLoading } = useQuizById(quizId);
	const { mutate: submitQuiz } = useSubmitQuiz();
	const { setCurrentQuiz, addToHistory } = useQuizStore();

	useEffect(() => {
		if (quiz) {
			setCurrentQuiz(quiz);
			socketService.joinQuiz(quizId);
		}

		return () => {
			socketService.leaveQuiz(quizId);
		};
	}, [quiz, quizId]);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [currentQuestion]);

	const handleTimeUp = () => {
		if (quiz && currentQuestion < quiz.questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1);
			setSelectedAnswer(null);
			setTimeLeft(TIMER_SECONDS);
		} else {
			handleQuizComplete();
		}
	};

	const handleAnswer = (selectedIndex: number) => {
		if (!quiz) return;

		setSelectedAnswer(selectedIndex);
		const currentQuestionId = quiz.questions[currentQuestion].id;
		setAnswers((prev) => ({
			...prev,
			[currentQuestionId]: selectedIndex.toString(),
		}));

		setTimeout(() => {
			if (selectedIndex === quiz.questions[currentQuestion].correctAnswer) {
				setScore(score + 1);
			}

			if (currentQuestion < quiz.questions.length - 1) {
				setCurrentQuestion(currentQuestion + 1);
				setSelectedAnswer(null);
				setTimeLeft(TIMER_SECONDS);
			} else {
				handleQuizComplete();
			}
		}, 1000);
	};

	const handleQuizComplete = () => {
		if (!quiz) return;

		submitQuiz(
			{
				quizId,
				answers,
			},
			{
				onSuccess: (result) => {
					addToHistory(result);
					navigation.navigate('Result', {
						score,
						totalQuestions: quiz.questions.length,
						quizId,
					});
				},
			}
		);
	};

	if (isLoading || !quiz) {
		return (
			<View style={styles.loadingContainer}>
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
						<Text style={styles.timerText}>{timeLeft}s</Text>
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
							disabled={selectedAnswer !== null}
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
});
