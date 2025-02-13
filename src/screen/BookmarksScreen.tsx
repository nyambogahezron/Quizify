import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { bookmarkedQuizzes } from '../lib/data';
import Colors from '@/constants/Colors';

export default function BookmarksScreen() {
	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity style={styles.quizCard}>
			<View style={styles.quizIcon}>
				<Text style={styles.iconText}>{item.icon}</Text>
			</View>
			<View style={styles.quizInfo}>
				<Text style={styles.quizTitle}>{item.title}</Text>
				<Text style={styles.quizProgress}>
					{item.completed}/{item.questions} Questions
				</Text>
				<View style={styles.progressBar}>
					<View
						style={[
							styles.progress,
							{ width: `${(item.completed / item.questions) * 100}%` },
						]}
					/>
				</View>
			</View>
			<TouchableOpacity style={styles.removeButton}>
				<Ionicons name='bookmark' size={24} color={Colors.red1} />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={styles.container}
			>
				<View style={styles.content}>
					{bookmarkedQuizzes.length > 0 ? (
						<FlatList
							data={bookmarkedQuizzes}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View style={styles.emptyState}>
							<Ionicons name='bookmark-outline' size={64} color='#CCC' />
							<Text style={styles.emptyStateText}>
								No bookmarked quizzes yet
							</Text>
						</View>
					)}
				</View>
			</LinearGradient>
		</SafeAreaView>
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
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
	content: {
		flex: 1,
		marginTop: 20,
		padding: 10,
	},
	quizCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	quizIcon: {
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
	quizInfo: {
		flex: 1,
	},
	quizTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: Colors.white2,
		marginBottom: 4,
	},
	quizProgress: {
		fontSize: 14,
		color: Colors.textLight,
		marginBottom: 8,
	},
	progressBar: {
		height: 4,
		backgroundColor: Colors.white2,
		borderRadius: 2,
	},
	progress: {
		height: '100%',
		backgroundColor: Colors.background,
		borderRadius: 2,
	},
	removeButton: {
		padding: 8,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyStateText: {
		fontSize: 16,
		color: '#666',
		marginTop: 12,
	},
});
