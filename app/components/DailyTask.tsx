import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from 'constants/Colors';

interface DailyTaskProps {
	task: {
		id: string;
		title: string;
		description: string;
		points: number;
		isCompleted: boolean;
		type: 'quiz' | 'practice' | 'streak' | 'auto_generated';
		questions?: string[];
	};
	onPress: () => void;
}

export default function DailyTask({ task, onPress }: DailyTaskProps) {
	return (
		<TouchableOpacity style={styles.dailyTask} onPress={onPress}>
			<View style={styles.taskIcon}>
				<Text style={styles.taskIconText}>⚓️</Text>
			</View>
			<View style={styles.taskInfo}>
				<View style={styles.taskHeader}>
					<Text style={styles.taskTitle}>{task?.title}</Text>
					<Text style={styles.taskQuestions}>{task?.points} points</Text>
				</View>
				<Text style={styles.taskDescription}>{task?.description}</Text>
				{task?.type === 'auto_generated' && task?.questions && (
					<Text style={styles.questionCount}>
						{task.questions.length} questions to complete
					</Text>
				)}
				<View style={styles.progressBar}>
					<View
						style={[
							styles.progress,
							{ width: task?.isCompleted ? '100%' : '0%' },
						]}
					/>
				</View>
				<Text style={styles.progressText}>
					{task?.isCompleted ? 'Completed' : 'Not completed'}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	dailyTask: {
		backgroundColor: Colors.background3,
		marginVertical: 20,
		marginHorizontal: 10,
		padding: 15,
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	taskIcon: {
		width: 50,
		height: 50,
		backgroundColor: 'white',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	taskIconText: {
		fontSize: 24,
	},
	taskInfo: {
		flex: 1,
	},
	taskHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	taskTitle: {
		color: Colors.text,
		fontSize: 16,
		fontFamily: 'Rb-bold',
	},
	taskQuestions: {
		color: Colors.text2,
		fontSize: 14,
	},
	taskDescription: {
		color: Colors.text2,
		fontSize: 14,
		marginBottom: 8,
	},
	questionCount: {
		color: Colors.text2,
		fontSize: 12,
		marginBottom: 8,
	},
	progressBar: {
		height: 4,
		backgroundColor: Colors.grayLight,
		borderRadius: 2,
		marginBottom: 4,
	},
	progress: {
		height: '100%',
		backgroundColor: Colors.yellow,
		borderRadius: 2,
	},
	progressText: {
		color: Colors.text2,
		fontSize: 12,
	},
});
