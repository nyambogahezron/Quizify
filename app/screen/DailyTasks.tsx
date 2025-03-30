import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDailyTasks, useCompleteDailyTask } from '../services/ApiQuery';
import Colors from 'constants/Colors';
import { RootStackParamList } from '@/interface';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'DailyTasks'>;
};

interface DailyTask {
	id: string;
	title: string;
	description: string;
	points: number;
	isCompleted: boolean;
	type: 'quiz' | 'practice' | 'streak';
}

export default function DailyTasksScreen({ navigation }: Props) {
	const { data: tasks, isLoading } = useDailyTasks();
	const { mutate: completeTask } = useCompleteDailyTask();

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	const getTaskIcon = (type: DailyTask['type']) => {
		switch (type) {
			case 'quiz':
				return 'book';
			case 'practice':
				return 'school';
			case 'streak':
				return 'flame';
			default:
				return 'checkmark-circle';
		}
	};

	const handleCompleteTask = (taskId: string) => {
		completeTask(taskId);
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={styles.gradient}
			>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.backButton}
					>
						<Ionicons name='arrow-back' size={24} color={Colors.text} />
					</TouchableOpacity>
					<Text style={styles.title}>Daily Tasks</Text>
				</View>

				<ScrollView style={styles.content}>
					{tasks?.map((task: DailyTask) => (
						<View key={task.id} style={styles.taskCard}>
							<View style={styles.taskHeader}>
								<View style={styles.taskIconContainer}>
									<Ionicons
										name={getTaskIcon(task.type)}
										size={24}
										color={Colors.text}
									/>
								</View>
								<View style={styles.taskInfo}>
									<Text style={styles.taskTitle}>{task.title}</Text>
									<Text style={styles.taskDescription}>{task.description}</Text>
								</View>
							</View>

							<View style={styles.taskFooter}>
								<View style={styles.pointsContainer}>
									<Ionicons name='star' size={20} color={Colors.yellow} />
									<Text style={styles.pointsText}>{task.points} points</Text>
								</View>

								<TouchableOpacity
									style={[
										styles.completeButton,
										task.isCompleted && styles.completedButton,
									]}
									onPress={() => handleCompleteTask(task.id)}
									disabled={task.isCompleted}
								>
									<Text style={styles.completeButtonText}>
										{task.isCompleted ? 'Completed' : 'Complete'}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 16,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	taskCard: {
		backgroundColor: Colors.grayLight,
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
	},
	taskHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	taskIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	taskInfo: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 18,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginBottom: 4,
	},
	taskDescription: {
		fontSize: 14,
		fontFamily: 'Rb-regular',
		color: Colors.text2,
	},
	taskFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	pointsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 8,
		borderRadius: 20,
	},
	pointsText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 4,
	},
	completeButton: {
		backgroundColor: Colors.primary,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
	},
	completedButton: {
		backgroundColor: Colors.success,
	},
	completeButtonText: {
		fontSize: 14,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
});
