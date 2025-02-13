import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

type GameCardProps = {
	game: any;
	handleOnPress: () => void;
};

export default function GameCard({ game, handleOnPress }: GameCardProps) {
	return (
		<TouchableOpacity
			key={game.id}
			style={styles.gameCard}
			onPress={() => handleOnPress()}
			activeOpacity={0.8}
		>
			<Text style={styles.gameIcon}>{game.icon}</Text>
			<View style={styles.gameInfo}>
				<Text style={styles.gameName}>{game.name}</Text>
				<Text style={styles.gameQuestions}>{game.questions} Questions</Text>
				<View style={styles.gamePlayers}>
					<Ionicons name='star' size={16} color={Colors.red1} />
					<Text style={styles.playersCount}>{game.players}</Text>
					<View style={styles.gameEnergy}>
						<Ionicons name='flash' size={16} color={Colors.red1} />
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	gameCard: {
		backgroundColor: Colors.grayLight,
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
	},
	gameIcon: {
		fontSize: 32,
		marginRight: 16,
	},
	gameInfo: {
		flex: 1,
	},
	gameName: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	gameQuestions: {
		color: Colors.white2,
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
	gameEnergy: {
		marginLeft: 'auto',
		backgroundColor: Colors.yellow,
		padding: 8,
		borderRadius: 20,
		marginTop: -50,
	},
});
