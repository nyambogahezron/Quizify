import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { Types } from 'mongoose';
import AsyncHandler from '../middleware/AsyncHandler';
import { NotFoundError, UnauthorizedError } from '../errors';


class NotificationController {
  /**
   * @description Get user notifications
   * @route GET /api/v1/notifications
   * @access Private
   */
  static getNotifications = AsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized access');
    }

    const notifications = await NotificationService.getUserNotifications(
      new Types.ObjectId(req.user.userId)
    );
    res.json(notifications);
  });

  /**
   * @description Mark notification as read
   * @route PATCH /api/v1/notifications/:id/read
   * @access Private
   */
  static markAsRead = AsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized access');
    }

    const notification = await NotificationService.markAsRead(
      new Types.ObjectId(req.params.id)
    );
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
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

    await NotificationService.markAllAsRead(new Types.ObjectId(req.user.userId));
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
}

export default NotificationController; 