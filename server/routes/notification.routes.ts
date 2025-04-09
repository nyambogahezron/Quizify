import express from 'express';
import NotificationController from '../controllers/Notification.controller';
import Authenticate from '../middleware/Authenticate';

const router = express.Router();

// Get user notifications
router.get('/', Authenticate, NotificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', Authenticate, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', Authenticate, NotificationController.markAllAsRead);

// Get unread notification count
router.get('/unread-count', Authenticate, NotificationController.getUnreadCount);

export default router; 