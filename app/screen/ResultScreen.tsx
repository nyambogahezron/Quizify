import React from 'react';
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
import { RootStackParamList } from '.';
import Colors from 'constants/Colors';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
	route: RouteProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation, route }: Props) {
	const { score, totalQuestions, coins } = route.params;

	const percentage = Math.round((score / totalQuestions) * 100);
	const isPassed = percentage >= 70;

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={styles.gradient}
			>
				<View style={styles.content}>
					<View style={styles.resultCard}>
						<View style={styles.scoreContainer}>
							<Text style={styles.scoreText}>{score}</Text>
							<Text style={styles.totalText}>/{totalQuestions}</Text>
						</View>
						<Text style={styles.percentageText}>{percentage}%</Text>
						<Text style={styles.resultText}>
							{isPassed ? 'Congratulations!' : 'Keep practicing!'}
						</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statItem}>
							<Ionicons name='time-outline' size={24} color={Colors.text} />
							<Text style={styles.statText}>Time taken: 2:30</Text>
						</View>
						<View style={styles.statItem}>
							<Ionicons name='trophy-outline' size={24} color={Colors.text} />
							<Text style={styles.statText}>
								{isPassed ? 'Passed' : 'Failed'}
							</Text>
						</View>
					</View>

					<View style={styles.actionsContainer}>
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
					</View>
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
	content: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
	},
	resultCard: {
		backgroundColor: Colors.grayLight,
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
		backgroundColor: Colors.grayLight,
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
});
