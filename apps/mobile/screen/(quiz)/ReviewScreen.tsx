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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/interface';
import Colors from 'constants/Colors';
import Animated, {
	FadeInUp,
	FadeInDown,
	SlideInRight,
} from 'react-native-reanimated';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Review'>;
	route: RouteProp<RootStackParamList, 'Review'>;
};

export default function ReviewScreen({ navigation, route }: Props) {
	const { reviewData } = route.params;

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (!reviewData?.questions?.length) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>No questions available</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={styles.gradient}
			>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.backButton}
					>
						<Ionicons name='arrow-back' size={24} color={Colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Quiz Review</Text>
				</View>

				<ScrollView style={styles.scrollView}>
					<View style={styles.content}>
						<Animated.View
							entering={FadeInDown.duration(1000)}
							style={styles.statsContainer}
						>
							<View style={styles.statItem}>
								<Ionicons name='time-outline' size={24} color={Colors.text} />
								<Text style={styles.statText}>
									Time taken: {formatTime(reviewData.timeSpent)}
								</Text>
							</View>
							<View style={styles.statItem}>
								<Ionicons name='people-outline' size={24} color={Colors.text} />
								<Text style={styles.statText}>
									Rank: {reviewData.rank} of {reviewData.totalParticipants}
								</Text>
							</View>
							<View style={styles.statItem}>
								<Ionicons
									name='analytics-outline'
									size={24}
									color={Colors.text}
								/>
								<Text style={styles.statText}>
									Percentile: {reviewData.percentile}%
								</Text>
							</View>
						</Animated.View>

						<Animated.View
							entering={FadeInUp.delay(300).duration(1000)}
							style={styles.questionsContainer}
						>
							{reviewData.questions.map((question, index) => {
								const userAnswer = parseInt(reviewData.answers[question._id]);
								const isCorrect = userAnswer === question.correctAnswer;

								return (
									<Animated.View
										key={question._id}
										entering={SlideInRight.delay(index * 100)
											.springify()
											.damping(15)}
										style={[
											styles.questionCard,
											isCorrect ? styles.correctCard : styles.incorrectCard,
										]}
									>
										<View style={styles.questionHeader}>
											<Text style={styles.questionNumber}>
												Question {index + 1}
											</Text>
											<View style={styles.answerIndicator}>
												<Ionicons
													name={isCorrect ? 'checkmark-circle' : 'close-circle'}
													size={24}
													color={isCorrect ? Colors.success : Colors.red1}
												/>
												<Text
													style={[
														styles.answerText,
														isCorrect
															? styles.correctAnswerText
															: styles.incorrectAnswerText,
													]}
												>
													{isCorrect ? 'Correct' : 'Incorrect'}
												</Text>
											</View>
										</View>
										<Text style={styles.questionText}>{question.question}</Text>
										<View style={styles.optionsContainer}>
											{question.options.map(
												(option: string, optIndex: number) => (
													<Animated.View
														key={optIndex}
														entering={FadeInUp.delay(optIndex * 100)}
														style={[
															styles.optionReview,
															optIndex === question.correctAnswer &&
																styles.correctOption,
															optIndex === userAnswer &&
																optIndex !== question.correctAnswer &&
																styles.wrongOption,
														]}
													>
														<View style={styles.optionHeader}>
															<Ionicons
																name={
																	optIndex === question.correctAnswer
																		? 'checkmark-circle'
																		: optIndex === userAnswer &&
																		  optIndex !== question.correctAnswer
																		? 'close-circle'
																		: 'ellipse-outline'
																}
																size={20}
																color={
																	optIndex === question.correctAnswer
																		? Colors.success
																		: optIndex === userAnswer &&
																		  optIndex !== question.correctAnswer
																		? Colors.red1
																		: Colors.text
																}
															/>
															<Text
																style={[
																	styles.optionText,
																	(optIndex === question.correctAnswer ||
																		optIndex === userAnswer) &&
																		styles.optionTextHighlighted,
																]}
															>
																{option}
															</Text>
														</View>
													</Animated.View>
												)
											)}
										</View>
									</Animated.View>
								);
							})}
						</Animated.View>
					</View>
				</ScrollView>
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: Colors.background2,
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 10,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	scrollView: {
		flex: 1,
	},
	statsContainer: {
		backgroundColor: Colors.background3,
		borderRadius: 20,
		padding: 20,
		marginBottom: 20,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	statText: {
		fontSize: 16,
		fontFamily: 'Rb-medium',
		color: Colors.text,
		marginLeft: 10,
	},
	questionsContainer: {
		gap: 20,
	},
	questionCard: {
		backgroundColor: Colors.background3,
		borderRadius: 20,
		padding: 20,
		marginBottom: 20,
	},
	correctCard: {
		borderLeftWidth: 1,
		borderLeftColor: Colors.success,
	},
	incorrectCard: {
		borderLeftWidth: 1,
		borderLeftColor: Colors.background2,
	},
	questionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	questionNumber: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	questionText: {
		color: Colors.text,
		fontSize: 18,
		fontFamily: 'Rb-bold',
		marginBottom: 20,
		lineHeight: 24,
	},
	optionsContainer: {
		gap: 8,
	},
	optionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	optionReview: {
		padding: 16,
		borderRadius: 12,
		backgroundColor: Colors.background2,
	},
	correctOption: {
		backgroundColor: Colors.success + '20',
		borderWidth: 1,
		borderColor: Colors.success,
	},
	wrongOption: {
		backgroundColor: Colors.red1 + '20',
		borderWidth: 1,
		borderColor: Colors.red1,
	},
	optionText: {
		color: Colors.text,
		fontSize: 16,
		fontFamily: 'Rb-regular',
		flex: 1,
	},
	optionTextHighlighted: {
		fontFamily: 'Rb-medium',
	},
	answerIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	answerText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
	},
	correctAnswerText: {
		color: Colors.success,
	},
	incorrectAnswerText: {
		color: Colors.red1,
	},
	errorText: {
		color: Colors.text,
		fontSize: 18,
		fontFamily: 'Rb-bold',
		margin: 20,
		textAlign: 'center',
	},
});
