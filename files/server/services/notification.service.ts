import { NotFoundError } from '../errors';
import { Notification } from '../models/Notification.model';
import { Types } from 'mongoose';

export class NotificationService {
	static async createNotification(
		userId: Types.ObjectId,
		type: 'level_up' | 'achievement' | 'daily_task' | 'system',
		title: string,
		message: string
	) {
		return await Notification.create({
			user: userId,
			type,
			title,
			message,
		});
	}

	static async getUserNotifications(userId: Types.ObjectId, limit = 20) {
		return await Notification.find({ user: userId })
			.sort({ createdAt: -1 })
			.limit(limit);
	}

	static async markAsRead(notificationId: Types.ObjectId) {
		const notification = await Notification.findById(notificationId);
		if (!notification) {
			throw new NotFoundError(`Notification ${notificationId} not found`);
		}

		return await Notification.findByIdAndUpdate(
			notificationId,
			{ isRead: true },
			{ new: true }
		);
	}

	static async markAllAsRead(userId: Types.ObjectId) {
		return await Notification.updateMany(
			{ user: userId, isRead: false },
			{ isRead: true }
		);
	}

	static async deleteNotification(notificationId: Types.ObjectId) {
		const notification = await Notification.findById(notificationId);
		if (!notification) {
			throw new NotFoundError(`Notification ${notificationId} not found`);
		}

		return await Notification.findByIdAndDelete(notificationId);
	}

	static async deleteAllNotifications(userId: Types.ObjectId) {
		return await Notification.deleteMany({ user: userId });
	}

	static async getUnreadCount(userId: Types.ObjectId) {
		const notifications = await Notification.find({
			user: userId,
			isRead: false,
		});
		return notifications.length;
	}
}
