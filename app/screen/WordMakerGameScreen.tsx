import React, { useState, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withSequence,
	withTiming,
	runOnJS,
	FadeIn,
	FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSoundEffect } from '@/store/useSound';

const GRID_SIZE = 4;
const CELL_SIZE = (Dimensions.get('window').width - 40) / GRID_SIZE;
const VALID_WORDS = ['CAT', 'DOG', 'RAT', 'BAT', 'HAT', 'MAT', 'SAT', 'FAT'];
const HINTS = [
	'A bet that starts with C',
	'A bet that starts with D',
	'A bet that starts with R',
	'A bet that starts with B',
	'A bet that starts with H',
	'A bet that starts with M',
	'A bet that starts with S',
];

const letters = [
	'C',
	'A',
	'T',
	'D',
	'O',
	'G',
	'R',
	'B',
	'H',
	'M',
	'S',
	'F',
	'A',
	'T',
	'N',
	'P',
];

type Position = {
	row: number;
	col: number;
};

export default function WordMakerScreen() {
	const [score, setScore] = useState(0);
	const [selectedCells, setSelectedCells] = useState<Position[]>([]);
	const [foundWords, setFoundWords] = useState<string[]>([]);
	const [showHint, setShowHint] = useState(false);
	const [hintWord, setHintWord] = useState('');

	const selectedWord = selectedCells
		.map((pos) => letters[pos.row * GRID_SIZE + pos.col])
		.join('');

	const scale = useSharedValue(1);
	const scoreOffset = useSharedValue(0);
	const scoreOpacity = useSharedValue(0);

	const animateScoreChange = (points: number) => {
		scoreOffset.value = points > 0 ? 20 : -20;
		scoreOpacity.value = 1;
		scoreOffset.value = withSequence(
			withTiming(points > 0 ? 20 : -20, { duration: 200 }),
			withTiming(0, { duration: 200 })
		);
		scoreOpacity.value = withTiming(0, { duration: 400 });
	};

	const checkWord = useCallback(async () => {
		if (
			selectedWord.length >= 3 &&
			VALID_WORDS.includes(selectedWord) &&
			!foundWords.includes(selectedWord)
		) {
			setScore((prev) => prev + 5);
			setFoundWords((prev) => [...prev, selectedWord]);
			scale.value = withSpring(1.2, {}, () => {
				scale.value = withSpring(1);
			});
			animateScoreChange(5);
			await playSoundEffect('correct');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		} else {
			await playSoundEffect('incorrect');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
		}
		setSelectedCells([]);
	}, [selectedWord, foundWords]);

	const handleCellPress = async (row: number, col: number) => {
		const newPos = { row, col };
		if (!selectedCells.some((cell) => cell.row === row && cell.col === col)) {
			setSelectedCells((prev) => [...prev, newPos]);
			await playSoundEffect('buttonClick');
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};

	const handleSubmit = async () => {
		if (selectedCells.length > 0) {
			await playSoundEffect('notification');
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			checkWord();
		}
	};

	const handleShowHint = async () => {
		if (score < 3) {
			setShowHint(true);
			await playSoundEffect('incorrect');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		const availableWords = VALID_WORDS.filter(
			(word) => !foundWords.includes(word)
		);
		if (availableWords.length === 0) return;

		const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)];
		setHintWord(randomHint);

		setShowHint(true);
		setScore((prev) => prev - 3);
		animateScoreChange(-3);
		await playSoundEffect('notification');
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Hide hint after 3 seconds
		const timeout = setTimeout(() => {
			setShowHint(false);
			setHintWord('');
		}, 3000);

		return () => clearTimeout(timeout);
	};

	const animatedScoreStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const scoreChangeStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: scoreOffset.value }],
		opacity: scoreOpacity.value,
	}));

	return (
		<LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Word Maker</Text>

					<View style={styles.scoreContainer}>
						<Animated.Text style={[styles.score, animatedScoreStyle]}>
							{score}
						</Animated.Text>
						<Animated.Text style={[styles.scoreChange, scoreChangeStyle]}>
							{scoreOffset.value > 0 ? '+5' : '-3'}
						</Animated.Text>
						<Text style={styles.scoreLabel}>points</Text>
					</View>
				</View>

				{/* Game Grid */}
				<View style={styles.content}>
					<View style={styles.grid}>
						{letters.map((letter, index) => {
							const row = Math.floor(index / GRID_SIZE);
							const col = index % GRID_SIZE;
							const isSelected = selectedCells.some(
								(pos) => pos.row === row && pos.col === col
							);

							return (
								<TouchableOpacity
									key={index}
									style={[styles.cell, isSelected && styles.selectedCell]}
									onPress={() => handleCellPress(row, col)}
								>
									<Text
										style={[styles.letter, isSelected && styles.selectedLetter]}
									>
										{letter}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					{/* Selected Word */}
					<View style={styles.selectedWordContainer}>
						<Text style={styles.selectedWordText}>{selectedWord}</Text>
					</View>

					{/* Hint */}
					{showHint && (
						<Animated.View
							entering={FadeIn}
							exiting={FadeOut}
							style={styles.hintContainer}
						>
							<Text style={styles.hintText}>Hint: {hintWord}</Text>
						</Animated.View>
					)}

					{/* Buttons Row */}
					<View style={styles.buttonsRow}>
						<TouchableOpacity
							style={[
								styles.hintButton,
								styles.button,
								score < 3 && styles.disabledButton,
							]}
							onPress={handleShowHint}
							disabled={score < 3}
						>
							<Text style={styles.hintButtonText}>Show Hint</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.submitButton, styles.button]}
							onPress={handleSubmit}
							disabled={selectedCells.length === 0}
						>
							<Text style={styles.submitButtonText}>Submit Word</Text>
						</TouchableOpacity>
					</View>

					{/* Found Words */}
					<View style={styles.wordsContainer}>
						<Text style={styles.wordsTitle}>Found Words</Text>
						<View style={styles.wordsList}>
							{foundWords.map((word, index) => (
								<View key={index} style={styles.wordItem}>
									<Text style={styles.wordText}>{word}</Text>
									<Text style={styles.wordPoints}>+5</Text>
								</View>
							))}
						</View>
					</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
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
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
	scoreContainer: {
		alignItems: 'center',
	},
	score: {
		fontSize: 32,
		fontWeight: 'bold',
		color: 'white',
	},
	scoreChange: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
		position: 'absolute',
		top: -20,
	},
	scoreLabel: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	content: {
		flex: 1,
		backgroundColor: 'white',
		marginTop: 20,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 20,
	},
	grid: {
		width: CELL_SIZE * GRID_SIZE,
		height: CELL_SIZE * GRID_SIZE,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignSelf: 'center',
		marginTop: 20,
	},
	cell: {
		width: CELL_SIZE,
		height: CELL_SIZE,
		borderWidth: 1,
		borderColor: '#E9ECEF',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	selectedCell: {
		backgroundColor: '#7C3AED',
	},
	letter: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	selectedLetter: {
		color: 'white',
	},
	selectedWordContainer: {
		alignItems: 'center',
		marginTop: 20,
		padding: 10,
		backgroundColor: '#F8F9FA',
		borderRadius: 10,
	},
	selectedWordText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	hintContainer: {
		backgroundColor: '#7C3AED',
		padding: 15,
		borderRadius: 10,
		marginTop: 20,
		alignItems: 'center',
	},
	hintText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	buttonsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
		gap: 10,
	},
	button: {
		flex: 1,
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
	},
	submitButton: {
		backgroundColor: '#7C3AED',
	},
	hintButton: {
		backgroundColor: '#6C63FF',
	},
	disabledButton: {
		opacity: 0.5,
	},
	submitButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	hintButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	wordsContainer: {
		marginTop: 20,
	},
	wordsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 16,
	},
	wordsList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	wordItem: {
		flexDirection: 'row',
		backgroundColor: '#F8F9FA',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		alignItems: 'center',
	},
	wordText: {
		fontSize: 16,
		color: '#333',
		marginRight: 4,
	},
	wordPoints: {
		fontSize: 14,
		color: '#7C3AED',
		fontWeight: '600',
	},
});
