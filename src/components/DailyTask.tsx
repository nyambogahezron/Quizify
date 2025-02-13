import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

export default function DailyTask() {
	return (
		<View style={styles.dailyTask}>
			<View style={styles.taskIcon}>
				<Text style={styles.taskIconText}>⚓️</Text>
			</View>
			<View style={styles.taskInfo}>
				<View style={styles.taskHeader}>
					<Text style={styles.taskTitle}>Daily Task</Text>
					<Text style={styles.taskQuestions}>14 Questions</Text>
				</View>
				<View style={styles.progressBar}>
					<View style={styles.progress} />
				</View>
				<Text style={styles.progressText}>Progress 9/14</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	dailyTask: {
		backgroundColor: Colors.grayLight,
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
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	taskQuestions: {
		color: Colors.textLight,
		fontSize: 14,
	},
	progressBar: {
		height: 4,
		backgroundColor: Colors.grayLight,
		borderRadius: 2,
		marginBottom: 4,
	},
	progress: {
		width: '65%',
		height: '100%',
		backgroundColor: Colors.yellow,
		borderRadius: 2,
	},
	progressText: {
		color: Colors.textLight,
		fontSize: 12,
	},
});
