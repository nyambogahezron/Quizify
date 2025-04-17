import React, { useState, useEffect } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	RefreshControl,
	Text,
	Alert,
} from 'react-native';
import { Notification } from '../components/Notification';
import { ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
	useMarkNotificationAsRead,
	useDeleteNotification,
} from '@/services/ApiQuery';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/store/useStore';

interface NotificationData {
	_id: string;
	title: string;
	message: string;
	type: 'level_up' | 'achievement' | 'daily_task' | 'system';
	isRead: boolean;
	createdAt: string;
}

export default function Notifications() {
	const [refreshing, setRefreshing] = useState(false);
	const [notificationsData, setNotifications] = useState<NotificationData[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuthStore();

	const markAsReadMutation = useMarkNotificationAsRead();
	const deleteMutation = useDeleteNotification();

	const markNotificationAsRead = (notificationId: string) => {
		markAsReadMutation.mutate(notificationId, {
			onSuccess: () => {
				setNotifications((prev) =>
					prev.map((notification) => {
						if (notification._id === notificationId) {
							return { ...notification, isRead: true };
						}
						return notification;
					})
				);
			},
		});
	};

	const deleteNotification = (notificationId: string) => {
		deleteMutation.mutate(notificationId, {
			onSuccess: () => {
				setNotifications((prev) =>
					prev.filter((n) => n._id !== notificationId)
				);
			},
		});
	};

	const fetchNotifications = () => {
		const socket = socketService.getSocket();
		if (socket?.connected) {
			socket.emit('notification:get');
		} else {
			console.log(
				'[Notifications] Socket not connected, attempting to connect...'
			);
			socketService
				.connect()
				.then(() => {
					const newSocket = socketService.getSocket();
					if (newSocket?.connected) {
						console.log(
							'[Notifications] Socket connected successfully, requesting notifications...'
						);
						newSocket.emit('notification:get');
					} else {
						console.error('[Notifications] Socket connection failed');
						setIsLoading(false);
					}
				})
				.catch((error) => {
					console.error('[Notifications] Socket connection error:', error);
					setIsLoading(false);
				});
		}
	};

	useEffect(() => {
		let mounted = true;

		const setupSocketListeners = (socket: any) => {
			// Listen for notifications data
			socket.on(
				'notification:data',
				({ notifications }: { notifications: NotificationData[] }) => {
					if (mounted) {
						setNotifications(notifications || []);
						setIsLoading(false);
					}
				}
			);

			// Listen for read notification updates
			socket.on(
				'notification:read',
				({ notificationId }: { notificationId: string }) => {
					if (mounted) {
						setNotifications((prev) =>
							prev.map((notification) => {
								if (notification._id === notificationId) {
									return { ...notification, isRead: true };
								}
								return notification;
							})
						);
					}
				}
			);

			// Listen for deleted notifications
			socket.on(
				'notification:deleted',
				({ notificationId }: { notificationId: string }) => {
					if (mounted) {
						setNotifications((prev) =>
							prev.filter((n) => n._id !== notificationId)
						);
					}
				}
			);

			// Listen for all notifications deleted
			socket.on('notification:deleted-all', () => {
				if (mounted) {
					setNotifications([]);
				}
			});

			// Request notifications immediately after setting up listeners
			fetchNotifications();
		};

		const initSocket = async () => {
			try {
				const socket = socketService.getSocket();

				if (socket?.connected) {
					setupSocketListeners(socket);
				} else {
					await socketService.connect();
					const newSocket = socketService.getSocket();
					if (newSocket?.connected) {
						setupSocketListeners(newSocket);
					} else {
						console.error('[Notifications] Failed to get socket connection');
						setIsLoading(false);
					}
				}
			} catch (error) {
				console.error('[Notifications] Error in socket initialization:', error);
				setIsLoading(false);
			}
		};

		initSocket();

		return () => {
			console.log('[Notifications] Cleaning up...');
			mounted = false;
		};
	}, [user?.id]);

	const handleRefresh = async () => {
		console.log('[Notifications] Refreshing notifications...');
		setRefreshing(true);
		fetchNotifications();
		setRefreshing(false);
	};

	const handleNotificationPress = (notificationId: string) => {
		Alert.alert(
			'Notification Actions',
			'What would you like to do with this notification?',
			[
				{
					text: 'Mark as Read',
					onPress: () => markNotificationAsRead(notificationId),
				},
				{
					text: 'Delete',
					onPress: () => deleteNotification(notificationId),
					style: 'destructive',
				},
				{
					text: 'Cancel',
					style: 'cancel',
				},
			]
		);
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
		padding: 10,
	},
	emptyText: {
		fontSize: 16,
		color: Colors.text,
		marginTop: 16,
		textAlign: 'center',
	},
});
