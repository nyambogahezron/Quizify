import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { quizCategories, moreGames } from '../lib/data';

export type RootStackParamList = {
  Quiz: { category: string };
  Profile: undefined;
  WordGame: undefined;
};

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <LinearGradient colors={['#666', '#555']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle='light-content' backgroundColor={'#555555'} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profile}
            >
              <Image
                source={{
                  uri: 'https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png',
                }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>Roxane Harley</Text>
                <Text style={styles.level}>Level 1</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.coins}>
              <Ionicons name='flash' size={20} color='#FF6B6B' />
              <Text style={styles.coinsText}>1200</Text>
            </View>
          </View>

          {/* Daily Task */}
          <View style={styles.dailyTask}>
            <View style={styles.taskIcon}>
              <Text style={styles.taskIconText}>⚓️</Text>
            </View>
            <View style={styles.taskInfo}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>Daily Task</Text>
                <Text style={styles.taskQuestions}>14 Questions</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progress} />
              </View>
              <Text style={styles.progressText}>Progress 9/14</Text>
            </View>
            <TouchableOpacity style={styles.taskButton}>
              <Ionicons name='menu' size={24} color='#7C3AED' />
            </TouchableOpacity>
          </View>

          {/* Quiz Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quiz</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categories}>
                {quizCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() =>
                      navigation.navigate('Quiz', { category: category.name })
                    }
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* More Games */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Games</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moreGames}>
              {moreGames.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={
                    () => navigation.navigate('WordGame')
                    // navigation.navigate('Quiz', { category: game.name })
                  }
                >
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameQuestions}>
                      {game.questions} Questions
                    </Text>
                    <View style={styles.gamePlayers}>
                      <Ionicons name='star' size={16} color='#FF6B6B' />
                      <Text style={styles.playersCount}>{game.players}</Text>
                      <View style={styles.gameEnergy}>
                        <Ionicons name='flash' size={16} color='#FF6B6B' />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  level: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  coins: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  coinsText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  dailyTask: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskIconText: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  taskQuestions: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progress: {
    width: '65%',
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  taskButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    color: 'white',
    fontSize: 12,
  },
  moreGames: {
    paddingHorizontal: 20,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#f2f2f2',
    fontSize: 14,
    marginBottom: 8,
  },
  gamePlayers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersCount: {
    color: '#f2f2ff2',
    fontSize: 14,
    marginLeft: 4,
  },
  gameEnergy: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
});
