import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';

interface LevelDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onPlay: () => void;
  level: {
    number: number;
    score: number;
    wordsFound: Array<{ word: string; foundAt: Date }>;
    stars: number;
    timeSpent: number;
  };
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({
  visible,
  onClose,
  onPlay,
  level,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Level {level.number}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Score
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {level.score}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Time
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.floor(level.timeSpent / 60)}m {level.timeSpent % 60}s
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Stars
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= level.stars ? 'star' : 'star-outline'}
                    size={20}
                    color={star <= level.stars ? '#FFD700' : colors.textSecondary}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.wordsContainer}>
            <Text style={[styles.wordsTitle, { color: colors.text }]}>
              Words Found
            </Text>
            <View style={styles.wordsList}>
              {level.wordsFound.map((word, index) => (
                <View
                  key={index}
                  style={[styles.wordItem, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[styles.wordText, { color: colors.text }]}>
                    {word.word}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={onPlay}
          >
            <Text style={styles.playButtonText}>Play Level</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  wordsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  wordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordText: {
    fontSize: 14,
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 