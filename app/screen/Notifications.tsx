import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const notifications = [
	{
		id: '1',
		date: '12 Jun, 2023',
		icon: '🎉',
		message: 'Congratulation your Chapter 1 Successfully Completed.',
		time: '12:00 am',
	},
	{
		id: '2',
		date: '12 Jun, 2023',
		icon: '💰',
		message: 'Congratulation your Coin Successfully Withdraw.',
		time: '12:00 am',
	},
	{
		id: '3',
		date: '12 Jun, 2023',
		icon: '🎡',
		message: 'Congratulation Spin to get 5 Coins.',
		time: '12:00 am',
	},
	{
		id: '4',
		date: '13 Jun, 2023',
		icon: '🏦',
		message: 'Your Bank Account Details Change Successfully.',
		time: '12:00 am',
	},
	{
		id: '5',
		date: '13 Jun, 2023',
		icon: '🎉',
		message: 'Congratulation your Product Quiz Chapter 1 Completed.',
		time: '12:00 am',
	},
	{
		id: '6',
		date: '14 Jun, 2023',
		icon: '🏦',
		message: 'Your Bank Account Details Change Successfully.',
		time: '12:00 am',
	},
];

const NotificationScreen = () => {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<View style={styles.container}>
					<FlatList
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						data={notifications}
						keyExtractor={(item) => item.id}
						renderItem={({ item, index }) => (
							<View>
								{(index === 0 ||
									notifications[index - 1].date !== item.date) && (
									<Text style={styles.date}>{item.date}</Text>
								)}
								<View style={styles.notificationCard}>
									<Text style={styles.icon}>{item.icon}</Text>
									<View style={styles.textContainer}>
										<Text style={styles.message}>{item.message}</Text>
										<Text style={styles.time}>{item.time}</Text>
									</View>
								</View>
							</View>
						)}
					/>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 8,
	},

	date: {
		color: 'gray',
		fontSize: 14,
		marginTop: 10,
	},
	notificationCard: {
		flexDirection: 'row',
		backgroundColor: Colors.background2,
		padding: 12,
		borderRadius: 8,
		marginTop: 8,
		alignItems: 'center',
	},
	icon: {
		fontSize: 24,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	message: {
		color: 'white',
		fontSize: 16,
	},
	time: {
		color: 'gray',
		fontSize: 12,
	},
});

export default NotificationScreen;
