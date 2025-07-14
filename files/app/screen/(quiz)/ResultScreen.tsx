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
import Colors from 'constants/Colors';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '@/interface';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
	route: RouteProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation, route }: Props) {
	const { score, totalQuestions, reviewData } = route.params;

	const percentage = Math.round((score / (totalQuestions * 10)) * 100);
	const isPassed = percentage >= 70;

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={styles.gradient}
			>
				<ScrollView style={styles.scrollView}>
					<View style={styles.content}>
						<Animated.View
							entering={FadeInDown.duration(1000)}
							style={styles.resultCard}
						>
							<View style={styles.scoreContainer}>
								<Text style={styles.scoreText}>{score / 10}</Text>
								<Text style={styles.totalText}>/{totalQuestions}</Text>
							</View>
							<Text style={styles.percentageText}>{percentage}%</Text>
							<Text style={styles.resultText}>
								{isPassed ? 'Congratulations!' : 'Keep practicing!'}
							</Text>
						</Animated.View>

						<Animated.View
							entering={FadeInUp.delay(300).duration(1000)}
							style={styles.statsContainer}
						>
							<View style={styles.statItem}>
								<Ionicons name='time-outline' size={24} color={Colors.text} />
								<Text style={styles.statText}>
									Time taken: {formatTime(reviewData.timeSpent)}
								</Text>
							</View>
							<View style={styles.statItem}>
								<Ionicons name='trophy-outline' size={24} color={Colors.text} />
								<Text style={styles.statText}>
									{isPassed ? 'Passed' : 'Failed'}
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

						<TouchableOpacity
							style={styles.reviewButton}
							onPress={() => navigation.navigate('Review', { reviewData })}
						>
							<Text style={styles.reviewButtonText}>Review Questions</Text>
							<Ionicons name='chevron-forward' size={24} color={Colors.text} />
						</TouchableOpacity>

						<Animated.View
							entering={FadeInUp.delay(900).duration(1000)}
							style={styles.actionsContainer}
						>
							<TouchableOpacity
								style={[styles.actionButton, styles.retryButton]}
								onPress={() =>
									navigation.navigate('Quiz', { category: 'General' })
								}
							>
								<Text style={styles.actionButtonText}>Retry Quiz</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.actionButton, styles.homeButton]}
								onPress={() => navigation.navigate('MainTabs')}
							>
								<Text style={styles.actionButtonText}>Back to Home</Text>
							</TouchableOpacity>
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

	content: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
	},
	resultCard: {
		backgroundColor: Colors.background3,
		borderRadius: 20,
		padding: 20,
		alignItems: 'center',
		marginBottom: 30,
	},
	scoreContainer: {
		flexDirection: 'row',
		alignItems: 'baseline',
		marginBottom: 10,
	},
	scoreText: {
		fontSize: 48,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	totalText: {
		fontSize: 24,
		fontFamily: 'Rb-regular',
		color: Colors.text2,
		marginLeft: 4,
	},
	percentageText: {
		fontSize: 36,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginBottom: 10,
	},
	resultText: {
		fontSize: 24,
		fontFamily: 'Rb-medium',
		color: Colors.text,
	},
	statsContainer: {
		backgroundColor: Colors.background3,
		borderRadius: 20,
		padding: 20,
		marginBottom: 30,
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
	actionsContainer: {
		gap: 15,
	},
	actionButton: {
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	retryButton: {
		backgroundColor: Colors.primary,
	},
	homeButton: {
		backgroundColor: Colors.secondary,
	},
	actionButtonText: {
		color: Colors.text,
		fontSize: 16,
		fontFamily: 'Rb-bold',
	},
	scrollView: {
		flex: 1,
	},
	reviewButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.background3,
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
		gap: 8,
	},
	reviewButtonText: {
		color: Colors.text,
		fontSize: 16,
		fontFamily: 'Rb-bold',
	},
});
