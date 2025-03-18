import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	FlatList,
	TouchableOpacity,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { leaderboardData } from '../lib/data';
import Colors from 'constants/Colors';
import { USER_IMG_FALLBACK } from 'utils/images';

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
			<Image
				source={{
					uri: item.avatar || USER_IMG_FALLBACK,
				}}
				style={styles.avatar}
			/>
			<View style={styles.userInfo}>
				<Text style={styles.userName}>{item.name}</Text>
				<Text style={styles.userScore}>{item.score} points</Text>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={styles.container}
			>
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
						style={{
							marginTop: Platform.select({ ios: 0, android: -27 }),
						}}
					/>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
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
		backgroundColor: Colors.grayLight,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	filterText: {
		color: 'white',
		marginRight: 4,
	},
	content: {
		marginTop: 20,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 10,
		paddingBottom: 150,
	},
	leaderboardItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
	},
	rankContainer: {
		width: 30,
		alignItems: 'center',
	},
	rankNumber: {
		fontSize: 18,
		fontWeight: 'bold',
		color: Colors.red1,
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
		color: Colors.white2,
	},
	userScore: {
		fontSize: 14,
		color: Colors.textLight,
		marginTop: 4,
	},
});
