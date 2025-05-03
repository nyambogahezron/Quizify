import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withSequence,
	withTiming,
	FadeIn,
	FadeOut,
	Easing,
	interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSoundEffect } from '@/store/useSound';
import levelsData from '@/lib/wordsMaker.json';
import { useRoute } from '@react-navigation/native';
import { Level } from '@/interface';
import { updateUserProgress } from '../../services/userProgressService';
import { socketService } from '../../lib/socket';

type Position = {
	row: number;
	col: number;
};

// Update the grid size calculation to be dynamic based on level
const getGridSize = (levelGridSize: number) => {
	return (Dimensions.get('window').width - 40) / levelGridSize;
};

export default function WordMakerScreen() {
	const [score, setScore] = useState(0);
	const [selectedCells, setSelectedCells] = useState<Position[]>([]);
	const [foundWords, setFoundWords] = useState<string[]>([]);
	const [showHint, setShowHint] = useState(false);
	const [hintWord, setHintWord] = useState('');
	const [gameStarted, setGameStarted] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [timeLeft, setTimeLeft] = useState(120);
	const [gameOver, setGameOver] = useState(false);
	const [currentLevel, setCurrentLevel] = useState<number>(1);
	const [levelData, setLevelData] = useState<Level>();
	const [currentWord, setCurrentWord] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	const router = useRoute();
	const { params } = router;
	const { levelId } = params as { levelId: Level };

	const getGridData = (level: Level) => level.letters || [];

	useEffect(() => {
		if (levelId) {
			setCurrentLevel(Number(levelId));

			// First try to find the level in local data
			const selectedLevel = levelsData.levels.find(
				(level) => level.level === Number(levelId)
			);
			if (selectedLevel) {
				setLevelData(selectedLevel);
				setCurrentLevel(selectedLevel.level);
				setIsLoading(false);
			}

			// Set up socket listeners
			socketService.onWordMakerLevelData((data) => {
				console.log('Received level data:', data);
				if (data.level) {
					// Ensure we have either letters or grid data
					if (!data.level.letters && data.level.grid) {
						data.level.letters = data.level.grid;
					}
					setLevelData(data.level);
					setTimeLeft(data.timeLimit || 120);
					setIsLoading(false);
				}
			});

			socketService.onWordMakerProgressUpdate((data) => {
				setScore(data.score);
				setFoundWords(data.wordsFound);
				setTimeLeft(data.timeSpent);
			});

			socketService.onWordMakerLevelCompleted((data) => {
				setScore(data.score);
				setFoundWords(data.wordsFound);
				setTimeLeft(data.timeSpent);
				setGameOver(true);
				setShowResults(true);
			});

			// Clean up socket listeners
			return () => {
				socketService.leaveWordMakerLevel(levelId.toString());
			};
		} else {
			setLevelData(levelsData.levels[0]);
			setCurrentLevel(1);
			setIsLoading(false);
		}
	}, [levelId]);

	const scale = useSharedValue(1);
	const scoreOffset = useSharedValue(0);
	const scoreOpacity = useSharedValue(0);
	const timerProgress = useSharedValue(1);
	const levelComplete = useSharedValue(0);

	const selectedIndices = useRef(new Set());
	const gridRef = useRef<View>(null);
	const currentWordRef = useRef('');

	// ref for level data
	const levelDataRef = useRef(levelData);

	// ref for found words
	const foundWordsRef = useRef<Set<string>>(new Set());

	// sync the ref with state
	useEffect(() => {
		if (levelData) {
			levelDataRef.current = levelData;
		}
	}, [levelData]);

	// Update useEffect to sync foundWords state with the ref
	useEffect(() => {
		foundWordsRef.current = new Set(foundWords);

		if (foundWords.length === levelDataRef.current?.words.length) {
			handleGameOver();
		}
	}, [foundWords]);

	// Timer effect
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (gameStarted && !gameOver && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						handleGameOver();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			// Animate timer bar
			timerProgress.value = withTiming(0, {
				duration: timeLeft * 1000,
				easing: Easing.linear,
			});
		}
		return () => clearInterval(timer);
	}, [gameStarted, gameOver, timeLeft]);

	const animateScoreChange = (points: number) => {
		scoreOffset.value = points > 0 ? 20 : -20;
		scoreOpacity.value = 1;
		scoreOffset.value = withSequence(
			withTiming(points > 0 ? 20 : -20, { duration: 200 }),
			withTiming(0, { duration: 200 })
		);
		scoreOpacity.value = withTiming(0, { duration: 400 });
	};

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderGrant: () => {
				// Reset when starting a new selection
				selectedIndices.current.clear();
				setSelectedCells([]);
				setCurrentWord('');
				currentWordRef.current = '';
			},
			onPanResponderMove: (evt: any, gestureState: any) => {
				if (!gridRef.current || gameOver) {
					console.log('Grid ref not available or game over');
					return;
				}

				if (!levelDataRef.current) {
					console.log('Level data not available');
					return;
				}

				gridRef.current.measure((x, y, width, height, pageX, pageY) => {
					const cellSize = getGridSize(levelDataRef.current?.gridSize || 3);
					const touchX = evt.nativeEvent.pageX - pageX - 10; // Adjust for grid padding
					const touchY = evt.nativeEvent.pageY - pageY - 10; // Adjust for grid padding

					const row = Math.floor(touchY / cellSize);
					const col = Math.floor(touchX / cellSize);
					const key = `${row}-${col}`;

					if (row >= 0 && col >= 0) {
						const gridData = levelDataRef.current?.grid ?? [];

						if (
							row < gridData.length &&
							col < (gridData[0]?.length || 0) &&
							gridData[row] &&
							gridData[row][col] &&
							!selectedIndices.current.has(key)
						) {
							const letter = gridData[row][col];

							// Add this key to the selected indices set
							selectedIndices.current.add(key);

							// Update the UI state with the selected cell
							setSelectedCells((prev) => [...prev, { row, col }]);

							// Build the current word
							const newWord = currentWordRef.current + letter;
							currentWordRef.current = newWord;
							setCurrentWord(newWord);

							// Provide feedback
							playSoundEffect('buttonClick');
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}
					}
				});
			},
			onPanResponderRelease: async () => {
				const word = currentWordRef.current;

				if (!levelDataRef.current) {
					console.log('Level data not available yet');
					return;
				}

				const currentLevelWords = levelDataRef.current.words || [];

				if (word.length >= 3) {
					await playSoundEffect('notification');
					await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

					const isWordValid = currentLevelWords.includes(word);
					const isWordAlreadyFound =
						foundWords.includes(word) || foundWordsRef.current.has(word);

					if (isWordValid && !isWordAlreadyFound) {
						foundWordsRef.current.add(word);

						setScore((prev) => prev + 5);
						setFoundWords((prev) => {
							const updatedWords = [...prev, word];

							// Check if all words have been found
							if (updatedWords.length === levelDataRef.current?.words.length) {
								// Small delay to allow the word to be added to the UI first
								setTimeout(() => handleGameOver(), 500);
							}

							return updatedWords;
						});

						scale.value = withSpring(1.2, {}, () => {
							scale.value = withSpring(1);
						});
						animateScoreChange(5);
						await playSoundEffect('correct');
						await Haptics.notificationAsync(
							Haptics.NotificationFeedbackType.Success
						);
					} else {
						await playSoundEffect('incorrect');
						await Haptics.notificationAsync(
							Haptics.NotificationFeedbackType.Error
						);
					}
				}

				// Clear selection
				selectedIndices.current.clear();
				setSelectedCells([]);
				setCurrentWord('');
				currentWordRef.current = '';
			},
			onPanResponderTerminate: () => {
				selectedIndices.current.clear();
				setSelectedCells([]);
				setCurrentWord('');
				currentWordRef.current = '';
			},
			onPanResponderTerminationRequest: () => true,
		})
	).current;

	const handleShowHint = async () => {
		if (score < 3) {
			setShowHint(true);
			await playSoundEffect('incorrect');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		const availableWords = levelData?.words.filter(
			(word) => !foundWords.includes(word)
		);
		if (availableWords?.length === 0) return;

		const randomHint =
			levelData?.hints[Math.floor(Math.random() * levelData?.hints.length)];
		setHintWord(randomHint || '');

		setShowHint(true);
		setScore((prev) => prev - 3);
		animateScoreChange(-3);
		await playSoundEffect('notification');
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		setTimeout(() => {
			setShowHint(false);
			setHintWord('');
		}, 3000);
	};

	const handleGameOver = async () => {
		setGameOver(true);
		setShowResults(true);
		levelComplete.value = withSpring(1);
		playSoundEffect('notification');
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

		// Save progress through socket
		if (levelId) {
			socketService.submitWordFound(
				levelId.toString(),
				currentWord,
				levelData?.timeLimit ? levelData.timeLimit - timeLeft : 0
			);
		}
	};

	const handleStartGame = async () => {
		setGameStarted(true);
		setScore(0);
		setFoundWords([]);
		setSelectedCells([]);
		setGameOver(false);
		setShowResults(false);
		setTimeLeft(levelData?.timeLimit || 120);
		timerProgress.value = 1;
		await playSoundEffect('notification');
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
	};

	const handleNextLevel = async () => {
		if (currentLevel < levelsData.levels.length) {
			const nextLevel = levelsData.levels[currentLevel];
			setCurrentLevel((prev) => prev + 1);
			setLevelData(nextLevel);
			setGameStarted(false);
			setGameOver(false);
			setShowResults(false);
			setScore(0);
			setFoundWords([]);
			setSelectedCells([]);
			setTimeLeft(nextLevel.timeLimit);
			levelComplete.value = 0;
			timerProgress.value = 1;
			await playSoundEffect('notification');
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
	};

	const animatedScoreStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const scoreChangeStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: scoreOffset.value }],
		opacity: scoreOpacity.value,
	}));

	const timerStyle = useAnimatedStyle(() => ({
		width: `${timerProgress.value * 100}%`,
		backgroundColor: interpolateColor(
			timerProgress.value,
			[0, 0.5, 1],
			['#EF4444', '#F59E0B', '#10B981']
		),
	}));

	if (isLoading) {
		return (
			<LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading...</Text>
					</View>
				</SafeAreaView>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<Text style={styles.loadingText}>Loading...</Text>
					</View>
				) : (
					<>
						{/* Timer Bar */}
						{gameStarted && !gameOver && (
							<View style={styles.timerBar}>
								<Animated.View style={[styles.timerProgress, timerStyle]} />
							</View>
						)}

						{/* Header */}
						<View style={styles.header}>
							{/* Selected Word */}
							<View style={styles.selectedWordContainer}>
								<Text style={styles.selectedWordText}>{currentWord}</Text>
							</View>
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
							{!gameStarted ? (
								<View style={styles.startGameContainer}>
									<Text style={styles.startGameText}>
										Select {levelData?.icon} to start
									</Text>
									<Text style={styles.startGameText}>Level {currentLevel}</Text>
									<Text style={styles.startGameText}>Points: {score}</Text>

									<TouchableOpacity
										style={styles.startButton}
										onPress={handleStartGame}
									>
										<Text style={styles.startButtonText}>Start Game</Text>
									</TouchableOpacity>

									{/* all levels completed */}
									{currentLevel === levelsData.levels.length && (
										<Text style={styles.allLevelsCompletedText}>
											Congratulations! You've completed all levels!
										</Text>
									)}

									{/* game levels  list */}

									<View style={styles.gameLevelsList}>
										{levelsData.levels.map((level) => (
											<Text key={level.level} style={styles.gameLevelText}>
												{level.level}
											</Text>
										))}
									</View>
								</View>
							) : (
								<>
									<View
										ref={gridRef}
										style={[
											styles.grid,
											{
												width:
													getGridSize(levelData?.gridSize || 3) *
													(levelData?.gridSize || 3),
												height:
													getGridSize(levelData?.gridSize || 3) *
													(levelData?.gridSize || 3),
											},
										]}
										{...panResponder.panHandlers}
									>
										{levelData?.grid?.map((row, rowIndex) => (
											<View key={`row-${rowIndex}`} style={styles.gridRow}>
												{row.map((letter, colIndex) => {
													const isSelected = selectedCells.some(
														(pos) =>
															pos.row === rowIndex && pos.col === colIndex
													);

													return (
														<View
															key={`${rowIndex}-${colIndex}`}
															style={[
																styles.cell,
																{
																	width: getGridSize(levelData?.gridSize || 3),
																	height: getGridSize(levelData?.gridSize || 3),
																},
																isSelected && styles.selectedCell,
															]}
														>
															<Text
																style={[
																	styles.letter,
																	isSelected && styles.selectedLetter,
																]}
															>
																{letter}
															</Text>
														</View>
													);
												})}
											</View>
										))}
									</View>

									<View style={styles.footer}>
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
								</>
							)}

							{/* Results Modal */}
							{showResults && (
								<Animated.View
									entering={FadeIn.duration(400).springify()}
									style={styles.resultsModal}
								>
									<View style={styles.resultsContent}>
										<Text style={styles.resultsTitle}>
											{timeLeft === 0 ? "Time's Up!" : 'Level Complete!'}
										</Text>
										<Text style={styles.levelText}>Level {currentLevel}</Text>
										<Text style={styles.resultsScore}>Score: {score}</Text>
										<Text style={styles.resultsStats}>
											Words Found: {foundWords.length}/{levelData?.words.length}
										</Text>

										{currentLevel < levelsData.levels.length ? (
											<TouchableOpacity
												style={styles.nextLevelButton}
												onPress={handleNextLevel}
											>
												<Text style={styles.nextLevelButtonText}>
													Next Level
												</Text>
											</TouchableOpacity>
										) : (
											<View style={styles.gameCompleteContainer}>
												<Text style={styles.gameCompleteText}>
													Congratulations! You've completed all levels!
												</Text>
												<TouchableOpacity
													style={styles.playAgainButton}
													onPress={() => {
														setCurrentLevel(1);
														setLevelData(levelsData.levels[0]);
														handleStartGame();
													}}
												>
													<Text style={styles.playAgainButtonText}>
														Play Again
													</Text>
												</TouchableOpacity>
											</View>
										)}
									</View>
								</Animated.View>
							)}
						</View>
					</>
				)}
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
		padding: 10,
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
		marginLeft: 15,
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
		flexDirection: 'column',
		backgroundColor: '#F8F9FA',
		borderRadius: 10,
		padding: 10,
		alignSelf: 'center',
	},
	gridRow: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	cell: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E9ECEF',
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
		flex: 1,
		alignItems: 'center',
		marginHorizontal: 5,
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
	timerBar: {
		height: 6,
		backgroundColor: '#E5E7EB',
		borderRadius: 3,
		marginHorizontal: 20,
		marginTop: 10,
		overflow: 'hidden',
	},
	timerProgress: {
		height: '100%',
		borderRadius: 3,
	},
	startButton: {
		backgroundColor: '#7C3AED',
		paddingHorizontal: 40,
		paddingVertical: 20,
		borderRadius: 25,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		alignSelf: 'center',
		marginTop: '50%',
	},
	startButtonText: {
		color: 'white',
		fontSize: 24,
		fontWeight: 'bold',
	},
	resultsModal: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	resultsContent: {
		backgroundColor: 'white',
		padding: 30,
		borderRadius: 20,
		alignItems: 'center',
		width: '80%',
	},
	resultsTitle: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 20,
	},
	resultsScore: {
		fontSize: 24,
		color: '#7C3AED',
		fontWeight: 'bold',
		marginBottom: 10,
	},
	resultsStats: {
		fontSize: 18,
		color: '#666',
		marginBottom: 30,
	},
	playAgainButton: {
		backgroundColor: '#7C3AED',
		paddingHorizontal: 30,
		paddingVertical: 15,
		borderRadius: 25,
	},
	playAgainButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	levelText: {
		fontSize: 20,
		color: '#666',
		marginBottom: 10,
	},
	nextLevelButton: {
		backgroundColor: '#10B981',
		paddingHorizontal: 30,
		paddingVertical: 15,
		borderRadius: 25,
		marginTop: 20,
	},
	nextLevelButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	gameCompleteContainer: {
		alignItems: 'center',
		marginTop: 20,
	},
	gameCompleteText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
	},
	gameLevelsList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	gameLevelsListContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	startGameContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	startGameText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
	},

	gameLevelText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
	},
	allLevelsCompletedText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
	},
	footer: {
		marginTop: 70,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
});
