import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { Achievement, UserAchievement } from '../models/Achievement.model';
import AsyncHandler from '../middleware/AsyncHandler';
import { UnauthorizedError } from '../errors';

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
	/*
	@desc Get all available achievements
	@route GET /api/v1/achievements
	@access Public
	*/
	static getAllAchievements = AsyncHandler(
		async (req: Request, res: Response) => {
			const achievements = (await Achievement.find().sort({
				'criteria.type': 1,
				'criteria.value': 1,
			})) as AchievementDocument[];

			res.status(StatusCodes.OK).json({ achievements });
		}
	);

	/*
	@desc Get achievements unlocked by the authenticated user
	@route GET /api/v1/achievements/user
	@access Private
	*/
	static getUserAchievements = AsyncHandler(
		async (req: Request, res: Response) => {
			if (!req.user) {
				throw new UnauthorizedError('Unauthorized');
			}

			// Get all achievements
			const allAchievements =
				(await Achievement.find()) as AchievementDocument[];

			// Get user unlocked achievements
			const userAchievements = (await UserAchievement.find({
				user: req.user.userId,
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

			res.status(StatusCodes.OK).json({
				achievements,
				stats: {
					total: totalAchievements,
					unlocked: unlockedCount,
					locked: totalAchievements - unlockedCount,
					progressPercentage: Math.round(progressPercentage),
				},
			});
		}
	);
}

export default AchievementController;
