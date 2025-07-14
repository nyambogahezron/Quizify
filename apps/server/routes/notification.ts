import express from 'express';
import {
	markNotificationAsRead,
	deleteNotification,
} from '../controllers/notificationController';
import authenticate from '../middleware/Authenticate';

const router = express.Router();

// Get notifications
router.get('/', authenticate, (req, res) => {
	// ... existing code ...
});

// Mark notification as read
router.post('/:id/read', authenticate, markNotificationAsRead);

// Delete notification
router.delete('/:id', authenticate, deleteNotification);

export default router;
