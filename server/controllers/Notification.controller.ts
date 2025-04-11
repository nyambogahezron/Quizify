import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { Types } from 'mongoose';
import AsyncHandler from '../middleware/AsyncHandler';
import { NotFoundError, UnauthorizedError } from '../errors';
import {
	emitNotificationRead,
	emitAllNotificationsDeleted,
	emitUserNotifications,
} from '../lib/notificationEmitter';

class NotificationController {
	/**
	 * @description Send a notification
	 * @route POST /api/v1/notifications
	 * @access Private
	 */
	static sendNotification = AsyncHandler(
		async (req: Request, res: Response) => {
			if (!req.user) {
				throw new UnauthorizedError('Unauthorized access');
			}

			const { type, title, message } = req.body;

			const notification = await NotificationService.createNotification(
				new Types.ObjectId(req.user.userId),
				type,
				title,
				message
			);

			// Emit notification to connected user

			const notifications = await NotificationService.getUserNotifications(
				new Types.ObjectId(req.user.userId)
			);

			emitUserNotifications(req.user.userId.toString(), notifications);

			res.json(notification);
		}
	);

	/**
	 * @description Get user notifications
	 * @route GET /api/v1/notifications
	 * @access Private
	 */
	static getNotifications = AsyncHandler(
		async (req: Request, res: Response) => {
			if (!req.user) {
				throw new UnauthorizedError('Unauthorized access');
			}

			console.log(
				`[NotificationController] Fetching notifications for user ${req.user.userId}`
			);
			const notifications = await NotificationService.getUserNotifications(
				new Types.ObjectId(req.user.userId)
			);

			console.log(
				`[NotificationController] Found ${notifications.length} notifications`
			);
			res.json(notifications);
		}
	);

	/**
	 * @description Mark notification as read
	 * @route PATCH /api/v1/notifications/:id/read
	 * @access Private
	 */
	static markAsRead = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		if (!Types.ObjectId.isValid(req.params.id)) {
			throw new NotFoundError('Invalid notification ID');
		}

		console.log(
			`[NotificationController] Marking notification ${req.params.id} as read for user ${req.user.userId}`
		);
		const notification = await NotificationService.markAsRead(
			new Types.ObjectId(req.params.id)
		);
		if (!notification) {
			throw new NotFoundError('Notification not found');
		}

		// Emit notification read status
		emitNotificationRead(req.user.userId.toString(), req.params.id);

		res.json(notification);
	});

	/**
	 * @description Mark all notifications as read
	 * @route PATCH /api/v1/notifications/read-all
	 * @access Private
	 */
	static markAllAsRead = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		await NotificationService.markAllAsRead(
			new Types.ObjectId(req.user.userId)
		);

		req.app
			.get('io')
			.emit('notification:read', { notificationId: req.params.id });

		res.json({ message: 'All notifications marked as read' });
	});

	/**
	 * @description Get unread notification count
	 * @route GET /api/v1/notifications/unread-count
	 * @access Private
	 */
	static getUnreadCount = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const count = await NotificationService.getUnreadCount(
			new Types.ObjectId(req.user.userId)
		);
		res.json({ count });
	});

	/**
	 * @description Delete a notification
	 * @route DELETE /api/v1/notifications/:id
	 * @access Private
	 */
	static deleteNotification = AsyncHandler(
		async (req: Request, res: Response) => {
			if (!req.user) {
				throw new UnauthorizedError('Unauthorized access');
			}

			if (!Types.ObjectId.isValid(req.params.id)) {
				throw new NotFoundError('Invalid notification ID');
			}

			const notification = await NotificationService.deleteNotification(
				new Types.ObjectId(req.params.id)
			);
			if (!notification) {
				throw new NotFoundError('Notification not found');
			}

			// Emit socket event for real-time update
			const io = req.app.get('io');
			io.emit(`notification:deleted:${notification.user}`, {
				notificationId: req.params.id,
			});

			req.app.get('io').emit('notification:get', { userId: notification.user });

			res.json({ message: 'Notification deleted successfully' });
		}
	);

	/**
	 * @description Delete all notifications for a user
	 * @route DELETE /api/v1/notifications
	 * @access Private
	 */
	static deleteAllNotifications = AsyncHandler(
		async (req: Request, res: Response) => {
			if (!req.user) {
				throw new UnauthorizedError('Unauthorized access');
			}

			await NotificationService.deleteAllNotifications(
				new Types.ObjectId(req.user.userId)
			);

			// Emit all notifications deleted status
			emitAllNotificationsDeleted(req.user.userId.toString());

			res.json({ message: 'All notifications deleted successfully' });
		}
	);
}

export default NotificationController;
