import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';
import { mockQuestions } from '../lib/data';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
};

const TIMER_SECONDS = 60;

export default function QuizScreen({ navigation, route }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswer = (selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);

    setTimeout(() => {
      if (selectedIndex === mockQuestions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }

      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(TIMER_SECONDS);
      } else {
        navigation.navigate('Result', {
          score:
            score +
            (selectedIndex === mockQuestions[currentQuestion].correctAnswer
              ? 1
              : 0),
          totalQuestions: mockQuestions.length,
          coins: 500,
        });
      }
    }, 1000);
  };

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) {
      return styles.optionButton;
    }
    if (index === mockQuestions[currentQuestion].correctAnswer) {
      return [styles.optionButton, styles.correctOption];
    }
    if (index === selectedAnswer) {
      return [styles.optionButton, styles.wrongOption];
    }
    return styles.optionButton;
  };

  return (
    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name='chevron-back' size={24} color='white' />
          </TouchableOpacity>
          <Text style={styles.questionCounter}>
            Question {currentQuestion + 1}/10
          </Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons name='bookmark-outline' size={24} color='white' />
          </TouchableOpacity>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.question}>
            {mockQuestions[currentQuestion].question}
          </Text>

          {/* Timer Bar */}
          <View style={styles.timerContainer}>
            <View
              style={[
                styles.timerBar,
                { width: `${(timeLeft / TIMER_SECONDS) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.timerText}>
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
            {String(timeLeft % 60).padStart(2, '0')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {mockQuestions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}
              </Text>
              <Text style={styles.optionText}>{option}</Text>
              {selectedAnswer !== null &&
                index === mockQuestions[currentQuestion].correctAnswer && (
                  <Ionicons
                    name='checkmark-circle'
                    size={24}
                    color='#4CAF50'
                    style={styles.optionIcon}
                  />
                )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>50/50</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Audience</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Skip</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCounter: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  question: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 3,
  },
  timerText: {
    color: 'white',
    textAlign: 'right',
    fontSize: 14,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: '#E7F6E7',
  },
  wrongOption: {
    backgroundColor: '#FFEBEE',
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  optionIcon: {
    marginLeft: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: 'auto',
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
