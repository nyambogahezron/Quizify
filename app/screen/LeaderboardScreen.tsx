import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	FlatList,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../lib/types';
import { useLeaderboard } from '../services/api';
import Colors from 'constants/Colors';
import { USER_IMG_FALLBACK } from 'utils/images';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
};

interface LeaderboardItem {
	id: string;
	username: string;
	avatar?: string;
	score: number;
	rank: number;
}

export default function LeaderboardScreen({ navigation }: Props) {
	const { data: leaderboard, isLoading } = useLeaderboard();

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	const renderItem = ({
		item,
		index,
	}: {
		item: LeaderboardItem;
		index: number;
	}) => {
		const isTopThree = index < 3;
		const rankColors = {
			0: Colors.warning, // Gold
			1: '#C0C0C0', // Silver
			2: '#CD7F32', // Bronze
		};

		return (
			<TouchableOpacity
				style={[
					styles.leaderboardItem,
					isTopThree && { backgroundColor: Colors.grayLight },
				]}
			>
				<View style={styles.rankContainer}>
					{isTopThree ? (
						<View
							style={[
								styles.rankBadge,
								{ backgroundColor: rankColors[index as 0 | 1 | 2] },
							]}
						>
							<Ionicons name='trophy' size={20} color={Colors.text} />
						</View>
					) : (
						<Text style={styles.rankText}>{item.rank}</Text>
					)}
				</View>

				<View style={styles.userInfo}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{item.avatar || item.username.charAt(0).toUpperCase()}
						</Text>
					</View>
					<Text style={styles.username}>{item.username}</Text>
				</View>

				<View style={styles.scoreContainer}>
					<Ionicons name='star' size={20} color={Colors.warning} />
					<Text style={styles.scoreText}>{item.score}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={styles.gradient}
			>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.backButton}
					>
						<Ionicons name='arrow-back' size={24} color={Colors.text} />
					</TouchableOpacity>
					<Text style={styles.title}>Leaderboard</Text>
				</View>

				<FlatList
					data={leaderboard}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
				/>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
	},
	backButton: {
		padding: 8,
	},
	title: {
		fontSize: 24,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 16,
	},
	listContainer: {
		padding: 20,
	},
	leaderboardItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	rankContainer: {
		width: 40,
		alignItems: 'center',
	},
	rankBadge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	rankText: {
		fontSize: 18,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	userInfo: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	avatarText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
	},
	username: {
		fontSize: 16,
		fontFamily: 'Rb-medium',
		color: Colors.text,
	},
	scoreContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.grayLight,
		padding: 8,
		borderRadius: 20,
	},
	scoreText: {
		fontSize: 16,
		fontFamily: 'Rb-bold',
		color: Colors.text,
		marginLeft: 4,
	},
});
