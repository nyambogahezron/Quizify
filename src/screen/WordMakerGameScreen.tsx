import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const GRID_SIZE = 4;
const CELL_SIZE = (Dimensions.get('window').width - 40) / GRID_SIZE;
const VALID_WORDS = ['CAT', 'DOG', 'RAT', 'BAT', 'HAT', 'MAT', 'SAT', 'FAT'];

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

  const selectedWord = selectedCells
    .map((pos) => letters[pos.row * GRID_SIZE + pos.col])
    .join('');

  const scale = useSharedValue(1);

  const checkWord = useCallback(() => {
    if (
      VALID_WORDS.includes(selectedWord) &&
      !foundWords.includes(selectedWord)
    ) {
      setScore((prev) => prev + selectedWord.length * 10);
      setFoundWords((prev) => [...prev, selectedWord]);
      scale.value = withSpring(1.2, {}, () => {
        scale.value = withSpring(1);
      });
    }
    setSelectedCells([]);
  }, [selectedWord, foundWords]);

  const pan = Gesture.Pan()
    .onBegin((event) => {
      const col = Math.floor((event.x - 20) / CELL_SIZE);
      const row = Math.floor((event.y - 120) / CELL_SIZE);
      if (isValidPosition(row, col)) {
        setSelectedCells([{ row, col }]);
      }
    })
    .onUpdate((event) => {
      const col = Math.floor((event.x - 20) / CELL_SIZE);
      const row = Math.floor((event.y - 120) / CELL_SIZE);
      if (isValidPosition(row, col)) {
        const newPos = { row, col };
        if (!selectedCells.find((pos) => pos.row === row && pos.col === col)) {
          setSelectedCells((prev) => [...prev, newPos]);
        }
      }
    })
    .onFinalize(() => {
      runOnJS(checkWord)();
    });

  const isValidPosition = (row: number, col: number) => {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
  };

  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
            <Text style={styles.scoreLabel}>points</Text>
          </View>
        </View>

        {/* Game Grid */}
        <View style={styles.content}>
          <GestureDetector gesture={pan}>
            <View style={styles.grid}>
              {letters.map((letter, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                const isSelected = selectedCells.some(
                  (pos) => pos.row === row && pos.col === col
                );

                return (
                  <Animated.View
                    key={index}
                    style={[styles.cell, isSelected && styles.selectedCell]}
                  >
                    <Text
                      style={[
                        styles.letter,
                        isSelected && styles.selectedLetter,
                      ]}
                    >
                      {letter}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </GestureDetector>

          {/* Found Words */}
          <View style={styles.wordsContainer}>
            <Text style={styles.wordsTitle}>Found Words</Text>
            <View style={styles.wordsList}>
              {foundWords.map((word, index) => (
                <View key={index} style={styles.wordItem}>
                  <Text style={styles.wordText}>{word}</Text>
                  <Text style={styles.wordPoints}>+{word.length * 10}</Text>
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
  wordsContainer: {
    marginTop: 40,
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
