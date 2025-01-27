import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation, route }: Props) {
  const { score, totalQuestions } = route.params;

  return (
    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>
          Correct Answer {score}/{totalQuestions}
        </Text>

        <View style={styles.card}>
          <View style={styles.rankContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60' }}
              style={styles.avatar}
            />
            <Text style={styles.name}>Roxane</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankLabel}>Rank</Text>
              <Text style={styles.rankNumber}>432</Text>
            </View>
          </View>

          <Text style={styles.congratsText}>
            Congratulations, you've completed this quiz!
          </Text>

          <Text style={styles.subText}>
            Let's keep testing your knowledge by playing more quizzes!
          </Text>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.exploreButtonText}>Explore More</Text>
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
    padding: 20,
  },
  header: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  rankContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rankLabel: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  rankNumber: {
    color: '#7C3AED',
    fontSize: 24,
    fontWeight: 'bold',
  },
  congratsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
