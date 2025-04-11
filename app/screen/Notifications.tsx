import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { Notification } from '../components/Notification';
import { ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
	useMarkNotificationAsRead,
	useNotifications,
} from '@/services/ApiQuery';

export default function Notifications() {
	const [refreshing, setRefreshing] = useState(false);

	const { data: notificationsData, isLoading } = useNotifications();
	const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();

	const handleRefresh = () => {
		setRefreshing(true);
	};

	const handleNotificationPress = async (notificationId: string) => {
		markNotificationAsRead(notificationId);
	};

	if (isLoading) {
		return (
			<View style={[styles.container, { backgroundColor: Colors.background }]}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<View
					style={[styles.container, { backgroundColor: Colors.background }]}
				>
					<FlatList
						data={notificationsData}
						keyExtractor={(item) => item._id}
						renderItem={({ item }) => (
							<Notification
								title={item.title}
								message={item.message}
								type={item.type}
								isRead={item.isRead}
								onPress={() => handleNotificationPress(item._id)}
							/>
						)}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={handleRefresh}
								colors={[Colors.primary]}
								tintColor={Colors.primary}
							/>
						}
						contentContainerStyle={styles.listContent}
						ListEmptyComponent={<EmptyState />}
					/>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
}

const EmptyState = () => {
	return (
		<View
			style={[
				styles.container,
				{
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					height: '100%',
					marginTop: '45%',
				},
			]}
		>
			<Ionicons name='notifications-off' size={40} color={Colors.borderColor} />
			<Text style={styles.emptyText}>No notifications</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	listContent: {
		padding: 16,
	},
	emptyText: {
		fontSize: 16,
		color: Colors.text,
		marginTop: 16,
		textAlign: 'center',
	},
});
