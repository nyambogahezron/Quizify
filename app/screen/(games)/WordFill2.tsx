import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

const grid = [
	['M', 'O', 'N'],
	['R', 'U', 'S'],
	['H', 'T', 'I'],
	['G', 'E', 'P'],
	['A', 'L', 'K'],
	['W', 'O', 'Y'],
];

const words = ['MON', 'RUSH', 'TIGER', 'PAGE'];
const CELL_SIZE = 50;
const GRID_SIZE = 4;

// Colors for found words
const FOUND_COLORS = ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD'];

const WordSearch = () => {
	const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
	const [selectedCells, setSelectedCells] = useState<
		{ row: number; col: number }[]
	>([]);
	const [currentWord, setCurrentWord] = useState('');
	const currentWordRef = useRef('');
	const [foundWords, setFoundWords] = useState<
		{ word: string; cells: { row: number; col: number }[]; color: string }[]
	>([]);
	const selectedIndices = useRef(new Set());
	const gridRef = useRef<View>(null);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (evt, gestureState) => {
				if (!gridRef.current) return;

				gridRef.current.measure((x, y, width, height, pageX, pageY) => {
					const touchX = evt.nativeEvent.pageX - pageX;
					const touchY = evt.nativeEvent.pageY - pageY;

					const row = Math.floor(touchY / CELL_SIZE);
					const col = Math.floor(touchX / CELL_SIZE);
					const key = `${row}-${col}`;

					if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
						if (
							!selectedIndices.current.has(key) &&
							grid[row] &&
							grid[row][col]
						) {
							selectedIndices.current.add(key);
							setSelectedLetters((prev) => [...prev, grid[row][col]]);
							setSelectedCells((prev) => [...prev, { row, col }]);
							const newWord = currentWordRef.current + grid[row][col];
							currentWordRef.current = newWord;
							setCurrentWord(newWord);
						}
					}
				});
			},
			onPanResponderRelease: () => {
				const word = currentWordRef.current;
				console.log('Checking word:', word);

				// Check if word is valid and hasn't been found yet
				const isWordValid = words.includes(word);
				const isWordAlreadyFound = foundWords.some((fw) => fw.word === word);

				if (isWordValid && !isWordAlreadyFound) {
					const color = FOUND_COLORS[foundWords.length % FOUND_COLORS.length];
					setFoundWords((prev) => [
						...prev,
						{ word, cells: [...selectedCells], color },
					]);
					// Only clear the selection state, not the found words
					setTimeout(() => {
						selectedIndices.current.clear();
						setSelectedLetters([]);
						setSelectedCells([]);
						currentWordRef.current = '';
						setCurrentWord('');
					}, 1500);
				} else {
					// Clear only the selection state if word is not found or already found
					selectedIndices.current.clear();
					setSelectedLetters([]);
					setSelectedCells([]);
					currentWordRef.current = '';
					setCurrentWord('');
				}
			},
		})
	).current;

	const getCellColor = (row: number, col: number) => {
		const foundWord = foundWords.find((fw) =>
			fw.cells.some((cell) => cell.row === row && cell.col === col)
		);
		return foundWord?.color;
	};

	return (
		<View style={styles.container}>
			<View style={styles.wordDisplay}>
				<Text style={styles.wordText}>{currentWord}</Text>
			</View>
			<View
				ref={gridRef}
				style={styles.gridContainer}
				{...panResponder.panHandlers}
			>
				{grid.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.row}>
						{row.map((letter, colIndex) => {
							const isSelected = selectedCells.some(
								(cell) => cell.row === rowIndex && cell.col === colIndex
							);
							const foundColor = getCellColor(rowIndex, colIndex);
							return (
								<View
									key={colIndex}
									style={[
										styles.cell,
										isSelected && styles.highlighted,
										foundColor && { backgroundColor: foundColor },
									]}
								>
									<Text style={styles.text}>{letter}</Text>
								</View>
							);
						})}
					</View>
				))}
			</View>
			<View style={styles.foundWordsContainer}>
				<Text style={styles.foundWordsTitle}>Found Words:</Text>
				<View style={styles.foundWordsList}>
					{foundWords.map((found, index) => (
						<View key={index} style={styles.foundWordItem}>
							<View
								style={[
									styles.colorIndicator,
									{ backgroundColor: found.color },
								]}
							/>
							<Text style={styles.foundWordText}>{found.word}</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	wordDisplay: {
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
		minWidth: 200,
		alignItems: 'center',
	},
	wordText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	gridContainer: {
		backgroundColor: 'white',
		padding: 10,
		borderRadius: 10,
	},
	row: { flexDirection: 'row' },
	cell: {
		width: CELL_SIZE,
		height: CELL_SIZE,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
	text: { fontSize: 20 },
	highlighted: { backgroundColor: 'yellow' },
	foundWordsContainer: {
		marginTop: 20,
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
		minWidth: 200,
	},
	foundWordsTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
	},
	foundWordsList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	foundWordItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		padding: 8,
		borderRadius: 15,
	},
	colorIndicator: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	foundWordText: {
		fontSize: 16,
		color: '#333',
	},
});

export default WordSearch;
