import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import QuizAttempt from '../models/QuizAttempt.model';
import { UserAchievement } from '../models/Achievement.model';
import AsyncHandler from '../middleware/AsyncHandler';
import { BadRequestError } from '../errors';
import { io } from '../index';

class QuizAttemptController {
	static createQuizAttempt = AsyncHandler(
		async (req: Request, res: Response) => {
			const { quiz, answers, score, totalPossibleScore, timeSpent } = req.body;
			const userId = req.currentUser?.userId;

			if (!userId) {
				throw new BadRequestError('User ID is required');
			}

			const quizAttempt = new QuizAttempt({
				quiz,
				user: userId,
				answers,
				score,
				totalPossibleScore,
				timeSpent,
				completed: true,
				completedAt: new Date(),
			});

			await quizAttempt.save();

			// Update user level in UserAchievement
			const userAchievement =
				(await UserAchievement.findOne({ user: userId })) ||
				new UserAchievement({ user: userId });

			const previousLevel = userAchievement.level;
			const totalQuizzesAnswered = await QuizAttempt.countDocuments({
				user: userId,
				completed: true,
			});

			userAchievement.totalQuizzesAnswered = totalQuizzesAnswered;
			userAchievement.level =
				UserAchievement.calculateLevel(totalQuizzesAnswered);

			if (userAchievement.level > previousLevel) {
				userAchievement.lastLevelUp = new Date();
				await userAchievement.save();

				io.to(userId.toString()).emit('levelUp', {
					newLevel: userAchievement.level,
					previousLevel,
					totalQuizzesAnswered,
				});
			} else {
				await userAchievement.save();
			}

			res.status(StatusCodes.CREATED).json({
				quizAttempt,
				userLevel: {
					level: userAchievement.level,
					totalQuizzesAnswered: userAchievement.totalQuizzesAnswered,
				},
			});
		}
	);

	// ... existing code ...
}

export default QuizAttemptController;
