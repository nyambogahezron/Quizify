import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const leaderboardData = [
  {
    id: '1',
    name: 'John Doe',
    score: 2800,
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: '2',
    name: 'Jane Smith',
    score: 2650,
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    score: 2400,
    avatar: 'https://via.placeholder.com/40',
  },
  // Add more users as needed
];

export default function LeaderboardScreen() {
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <Ionicons
            name='trophy'
            size={24}
            color={
              index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
            }
          />
        ) : (
          <Text style={styles.rankNumber}>{index + 1}</Text>
        )}
      </View>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userScore}>{item.score} points</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>This Week</Text>
            <Ionicons name='chevron-down' size={20} color='white' />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <FlatList
            data={leaderboardData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    color: 'white',
    marginRight: 4,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
