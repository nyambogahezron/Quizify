import  User  from '../models/User.model';
import { NotificationService } from './notification.service';
import { Types } from 'mongoose';

export class UserService {
  static async updateUserLevel(userId: Types.ObjectId, newPoints: number) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.level;
    const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;

    if (newLevel > oldLevel) {
      // User leveled up
      await User.findByIdAndUpdate(userId, { level: newLevel });
      
      // Create level up notification
      await NotificationService.createNotification(
        userId,
        'level_up',
        'Level Up! 🎉',
        `Congratulations! You've reached level ${newLevel}!`,
        { level: newLevel }
      );

      return { leveledUp: true, newLevel };
    }

    return { leveledUp: false, currentLevel: oldLevel };
  }
} 