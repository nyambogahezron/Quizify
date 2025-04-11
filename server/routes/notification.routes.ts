import express from 'express';
import NotificationController from '../controllers/Notification.controller';
import Authenticate from '../middleware/Authenticate';

const router = express.Router();

router
	.route('/')
	.get(Authenticate, NotificationController.getNotifications)
	.post(Authenticate, NotificationController.sendNotification);

router
	.route('/:id')
	.patch(Authenticate, NotificationController.markAsRead)
	.delete(Authenticate, NotificationController.deleteNotification);

router.patch('/read-all', Authenticate, NotificationController.markAllAsRead);

router.get(
	'/unread-count',
	Authenticate,
	NotificationController.getUnreadCount
);

// Delete all notifications
router.delete('/', Authenticate, NotificationController.deleteAllNotifications);

export default router;
