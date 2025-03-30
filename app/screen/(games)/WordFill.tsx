import React, { useState, useEffect, useCallback } from 'react';
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
	Easing,
	interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { playSoundEffect } from '@/store/useSound';

const GAME_TIME = 15; // seconds per word
const WORDS = [
	{ word: 'CAT', hint: 'A pet that starts with C', partial: 'C*T' },
	{ word: 'DOG', hint: 'A pet that starts with D', partial: 'D*G' },
	{ word: 'HAT', hint: 'Something you wear on your head', partial: 'H*T' },
	{ word: 'BAT', hint: 'A flying mammal', partial: 'B*T' },
	{ word: 'RAT', hint: 'A small rodent', partial: 'R*T' },
	{ word: 'MAT', hint: 'Something you stand on', partial: 'M*T' },
];

const LETTERS = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
];

const GAME_DURATION = 120; // 2 minutes in seconds

export default function WordFillScreen() {
	const [score, setScore] = useState(0);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(GAME_TIME);
	const [gameOver, setGameOver] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [letterStates, setLetterStates] = useState<
		('empty' | 'correct' | 'wrong')[]
	>(['empty', 'empty', 'empty']);
	const [currentGuess, setCurrentGuess] = useState('');

	const scale = useSharedValue(1);
	const scoreOffset = useSharedValue(0);
	const scoreOpacity = useSharedValue(0);
	const timerProgress = useSharedValue(1);
	const shake = useSharedValue(0);

	const currentWord = WORDS[currentWordIndex];

	const animateScoreChange = (points: number) => {
		scoreOffset.value = points > 0 ? 20 : -20;
		scoreOpacity.value = 1;
		scoreOffset.value = withSequence(
			withTiming(points > 0 ? 20 : -20, { duration: 200 }),
			withTiming(0, { duration: 200 })
		);
		scoreOpacity.value = withTiming(0, { duration: 400 });
	};

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (!gameOver && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setGameOver(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [timeLeft, gameOver]);

	useEffect(() => {
		if (gameStarted && !gameOver) {
			timerProgress.value = withTiming(
				0,
				{
					duration: GAME_DURATION * 1000,
					easing: Easing.linear,
				},
				(finished) => {
					if (finished) {
						runOnJS(handleGameOver)();
					}
				}
			);
		}
	}, [gameStarted]);

	const handleLetterPress = async (letter: string) => {
		const answer = currentWord.word;
		const missingLetter = answer[1];

		if (letter === missingLetter) {
			setLetterStates(['correct', 'correct', 'correct']);
			setCurrentGuess(letter);
			setScore((prev) => prev + 10);
			animateScoreChange(10);
			await playSoundEffect('correct');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			setTimeout(() => {
				if (currentWordIndex < WORDS.length - 1) {
					setCurrentWordIndex((prev) => prev + 1);
					setLetterStates(['empty', 'empty', 'empty']);
					setCurrentGuess('');
				} else {
					setGameOver(true);
				}
			}, 2000);
		} else {
			setLetterStates(['wrong', 'wrong', 'wrong']);
			await playSoundEffect('incorrect');
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

			setTimeout(() => {
				setLetterStates(['empty', 'empty', 'empty']);
				setCurrentGuess('');
			}, 800);
		}
	};

	const handleShowHint = async () => {
		setShowHint(true);
		await playSoundEffect('notification');
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		setTimeout(() => {
			setShowHint(false);
		}, 3000);
	};

	const handleGameOver = () => {
		setGameOver(true);
		setShowResults(true);
		playSoundEffect('notification');
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	};

	const handleStartGame = async () => {
		setGameStarted(true);
		setScore(0);
		setCurrentWordIndex(0);
		setGameOver(false);
		setShowResults(false);
		timerProgress.value = 1;
		await playSoundEffect('notification');
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

	return (
		<LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				{/* Timer Bar */}
				{gameStarted && !gameOver && (
					<View style={styles.timerBar}>
						<Animated.View style={[styles.timerProgress, timerStyle]} />
					</View>
				)}

				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Word Fill</Text>
					<View style={styles.scoreContainer}>
						<Animated.Text style={[styles.score, animatedScoreStyle]}>
							{score}
						</Animated.Text>
						<Animated.Text style={[styles.scoreChange, scoreChangeStyle]}>
							{scoreOffset.value > 0 ? '+10' : ''}
						</Animated.Text>
						<Text style={styles.scoreLabel}>points</Text>
					</View>
				</View>

				{/* Game Content */}
				<View style={styles.content}>
					{!gameStarted ? (
						<TouchableOpacity
							style={styles.startButton}
							onPress={handleStartGame}
						>
							<Text style={styles.startButtonText}>Start Game</Text>
						</TouchableOpacity>
					) : (
						<>
							<View style={styles.timerContainer}>
								<Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
							</View>

							<View style={styles.wordContainer}>
								{currentWord.word.split('').map((letter, index) => (
									<View
										key={index}
										style={[
											styles.letterBox,
											letterStates[index] === 'correct' && styles.correctBox,
											letterStates[index] === 'wrong' && styles.wrongBox,
										]}
									>
										<Text
											style={[
												styles.letterText,
												letterStates[index] === 'correct' && styles.correctText,
												letterStates[index] === 'wrong' && styles.wrongText,
											]}
										>
											{index === 1 ? currentGuess || '' : letter}
										</Text>
									</View>
								))}
							</View>

							{showHint && (
								<Animated.View
									entering={FadeIn}
									exiting={FadeOut}
									style={styles.hintContainer}
								>
									<Text style={styles.hintText}>Hint: {currentWord.hint}</Text>
								</Animated.View>
							)}

							<View style={styles.lettersGrid}>
								{LETTERS.map((letter, index) => (
									<TouchableOpacity
										key={index}
										style={styles.letterButton}
										onPress={() => handleLetterPress(letter)}
										disabled={gameOver}
									>
										<Text style={styles.letterText}>{letter}</Text>
									</TouchableOpacity>
								))}
							</View>

							{gameOver && (
								<View style={styles.gameOverContainer}>
									<Text style={styles.gameOverText}>Game Over!</Text>
									<Text style={styles.finalScoreText}>
										Final Score: {score}
									</Text>
									<TouchableOpacity
										style={styles.restartButton}
										onPress={handleStartGame}
									>
										<Text style={styles.restartButtonText}>Play Again</Text>
									</TouchableOpacity>
								</View>
							)}

							<TouchableOpacity
								style={styles.hintButton}
								onPress={handleShowHint}
							>
								<Text style={styles.hintButtonText}>Show Hint</Text>
							</TouchableOpacity>
						</>
					)}

					{/* Results Modal */}
					{showResults && (
						<Animated.View
							entering={FadeIn.duration(400).springify()}
							style={styles.resultsModal}
						>
							<View style={styles.resultsContent}>
								<Text style={styles.resultsTitle}>Time's Up!</Text>
								<Text style={styles.resultsScore}>Score: {score}</Text>
								<Text style={styles.resultsStats}>
									Words Completed: {currentWordIndex}
								</Text>
								<TouchableOpacity
									style={styles.playAgainButton}
									onPress={handleStartGame}
								>
									<Text style={styles.playAgainButtonText}>Play Again</Text>
								</TouchableOpacity>
							</View>
						</Animated.View>
					)}
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
	timerContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	timerText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	wordContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
		marginVertical: 30,
	},
	letterBox: {
		width: 60,
		height: 60,
		borderWidth: 2,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	correctBox: {
		backgroundColor: '#10B981',
		borderColor: '#059669',
	},
	wrongBox: {
		backgroundColor: '#EF4444',
		borderColor: '#DC2626',
	},
	letterText: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#333',
	},
	correctText: {
		color: 'white',
	},
	wrongText: {
		color: 'white',
	},
	hintContainer: {
		backgroundColor: '#7C3AED',
		padding: 15,
		borderRadius: 10,
		marginVertical: 20,
		alignItems: 'center',
	},
	hintText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	lettersGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
		marginTop: 20,
	},
	letterButton: {
		width: 45,
		height: 45,
		backgroundColor: '#F8F9FA',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E9ECEF',
	},
	gameOverContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
	},
	gameOverText: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 20,
	},
	finalScoreText: {
		fontSize: 24,
		color: '#666',
		marginBottom: 30,
	},
	restartButton: {
		backgroundColor: '#7C3AED',
		paddingHorizontal: 30,
		paddingVertical: 15,
		borderRadius: 25,
	},
	restartButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	hintButton: {
		backgroundColor: '#6C63FF',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
	},
	hintButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
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
});
