import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { Achievement, UserAchievement } from '../models/Achievement.model';

// Define interfaces for the document types
interface AchievementDocument extends mongoose.Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	description: string;
	badge: string;
	criteria: {
		type: string;
		value: number;
	};
}

interface UserAchievementDocument extends mongoose.Document {
	_id: mongoose.Types.ObjectId;
	user: mongoose.Types.ObjectId;
	achievement: AchievementDocument;
	unlockedAt: Date;
}

class AchievementController {
	// Get all available achievements
	static async getAllAchievements(req: Request, res: Response) {
		try {
			const achievements = (await Achievement.find().sort({
				'criteria.type': 1,
				'criteria.value': 1,
			})) as AchievementDocument[];

			return res.status(StatusCodes.OK).json({ achievements });
		} catch (error) {
			console.error('Error getting achievements:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch achievements',
			});
		}
	}

	// Get achievements unlocked by the authenticated user
	static async getUserAchievements(req: Request, res: Response) {
		try {
			if (!req.currentUser?.userId) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Unauthorized',
				});
			}

			// Get all achievements
			const allAchievements =
				(await Achievement.find()) as AchievementDocument[];

			// Get user unlocked achievements
			const userAchievements = (await UserAchievement.find({
				user: req.currentUser.userId,
			}).populate('achievement')) as unknown as UserAchievementDocument[];

			// Create a map of unlocked achievement IDs for quick lookup
			const unlockedMap = new Map(
				userAchievements.map((ua) => [ua.achievement._id.toString(), ua])
			);

			// Format the results
			const achievements = allAchievements.map((achievement) => {
				const unlocked = unlockedMap.has(achievement._id.toString());
				const userAchievement = unlocked
					? unlockedMap.get(achievement._id.toString())
					: null;

				return {
					id: achievement._id,
					name: achievement.name,
					description: achievement.description,
					badge: achievement.badge,
					criteria: achievement.criteria,
					unlocked,
					unlockedAt: userAchievement?.unlockedAt || null,
				};
			});

			// Statistics
			const totalAchievements = allAchievements.length;
			const unlockedCount = userAchievements.length;
			const progressPercentage = (unlockedCount / totalAchievements) * 100;

			return res.status(StatusCodes.OK).json({
				achievements,
				stats: {
					total: totalAchievements,
					unlocked: unlockedCount,
					locked: totalAchievements - unlockedCount,
					progressPercentage: Math.round(progressPercentage),
				},
			});
		} catch (error) {
			console.error('Error getting user achievements:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch user achievements',
			});
		}
	}
}

export default AchievementController;
