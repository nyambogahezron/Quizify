import { Notification } from '../models/Notification.model';
import { Types } from 'mongoose';

export class NotificationService {
  static async createNotification(
    userId: Types.ObjectId,
    type: 'level_up' | 'achievement' | 'daily_task' | 'system',
    title: string,
    message: string,
    data: any = {}
  ) {
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    });
  }

  static async getUserNotifications(userId: Types.ObjectId, limit = 20) {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async markAsRead(notificationId: Types.ObjectId) {
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

  static async getUnreadCount(userId: Types.ObjectId) {
    return await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  }
} 