import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from 'constants/Colors';

type GameCardProps = {
	game: {
		name: string;
		icon: string;
		quizzesCount: number;
		totalPlayers: number;
	};
	handleOnPress: () => void;
	index: number;
};

export default function CategoryCard({
	game,
	handleOnPress,
	index,
}: GameCardProps) {
	return (
		<TouchableOpacity
			key={index}
			style={styles.gameCard}
			onPress={() => handleOnPress()}
			activeOpacity={0.8}
		>
			<View style={styles.iconWrapper}>
				<Text style={styles.gameIcon}>{game.icon}</Text>
			</View>
			<View style={styles.gameInfo}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: 4,
						justifyContent: 'space-between',
					}}
				>
					<Text style={styles.gameName}>{game.name}</Text>
				</View>

				<Text style={styles.gameDescription}>
					Lorem ipsum dolor sit amet, consectetur adipisicing.
				</Text>
				<View style={styles.gameStats}>
					<Text style={styles.gameQuestions}>
						{game.quizzesCount} Sub Quizzes
					</Text>
					<View style={styles.gamePlayers}>
						<Ionicons name='star' size={16} color={Colors.red1} />
						<Text style={styles.playersCount}>{game.totalPlayers || 0}</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	gameCard: {
		backgroundColor: Colors.background2,
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconWrapper: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		paddingHorizontal: 20,
		paddingVertical: 14,
		marginRight: 16,
		right: 0,
	},
	gameIcon: {
		textAlign: 'center',
		fontSize: 32,
	},
	gameInfo: {
		flex: 1,
	},
	gameName: {
		color: Colors.white2,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	gameQuestions: {
		color: Colors.success,
		fontSize: 12,
	},
	gameDescription: {
		color: Colors.textLight,
		fontSize: 14,
		marginBottom: 8,
	},
	gamePlayers: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	playersCount: {
		color: Colors.white2,
		fontSize: 14,
		marginLeft: 4,
	},
	gameStats: {
		padding: 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4,
	},
});
