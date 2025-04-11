import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Types } from 'mongoose';

interface Notification {
	_id: Types.ObjectId;
	user: Types.ObjectId;
	type: 'level_up' | 'achievement' | 'daily_task' | 'system';
	title: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
}

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const initNotificationEmitter = (socketServer: Server) => {
	io = socketServer;
};

// Emit a new notification to a specific user
export const emitNotificationCreated = (
	userId: string,
	notification: Notification
) => {
	if (!io) {
		console.error('[NotificationEmitter] Socket.io instance not initialized');
		return;
	}

	const userRoom = `user:${userId}`;
	console.log(
		`[NotificationEmitter] Emitting new notification to room ${userRoom}:`,
		notification
	);

	// Emit to the specific user's room
	io.to(userRoom).emit('notification:data', { notifications: [notification] });
};

// Emit notification read status update
export const emitNotificationRead = (
	userId: string,
	notificationId: string
) => {
	if (!io) {
		console.error('[NotificationEmitter] Socket.io instance not initialized');
		return;
	}

	const userRoom = `user:${userId}`;
	console.log(
		`[NotificationEmitter] Emitting notification read status to room ${userRoom}, notification ${notificationId}`
	);

	// Emit to the specific user's room
	io.to(userRoom).emit('notification:read', { notificationId });
};

// Emit notification deleted status
export const emitNotificationDeleted = (
	userId: string,
	notificationId: string
) => {
	if (!io) return;
	console.log(
		`Emitting notification deleted status for user ${userId}, notification ${notificationId}`
	);
	io.to(userId).emit('notification:deleted', { notificationId });
};

// Emit all notifications read status
export const emitAllNotificationsRead = (userId: string) => {
	if (!io) {
		console.error('[NotificationEmitter] Socket.io instance not initialized');
		return;
	}

	const userRoom = `user:${userId}`;
	console.log(
		`[NotificationEmitter] Emitting all notifications read status to room ${userRoom}`
	);

	// Emit to the specific user's room
	io.to(userRoom).emit('notification:read-all');
};

// Emit all notifications deleted status
export const emitAllNotificationsDeleted = (userId: string) => {
	if (!io) return;
	console.log(`Emitting all notifications deleted status for user ${userId}`);
	io.to(userId).emit('notification:deleted-all');
};

// Emit notifications list to a specific user
export const emitUserNotifications = (
	userId: string,
	notifications: Notification[]
) => {
	if (!io) {
		console.error('[NotificationEmitter] Socket.io instance not initialized');
		return;
	}

	const userRoom = `user:${userId}`;
	console.log(
		`[NotificationEmitter] Emitting ${notifications.length} notifications to room ${userRoom}`
	);

	// Emit to the specific user's room
	io.to(userRoom).emit('notification:data', { notifications });
	io.emit('notification:new');
};

// Broadcast notifications to all connected users (use with caution)
export const broadcastNotifications = (notifications: Notification[]) => {
	if (!io) return;
	console.log(
		`Broadcasting ${notifications.length} notifications to all users`
	);
	io.emit('notification:data', { notifications });
};
