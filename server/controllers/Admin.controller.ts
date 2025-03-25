import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import Quiz from '../models/Quiz.model';
import User from '../models/User.model';
import AsyncHandler from '../middleware/AsyncHandler';

class AdminController {
	/*
    @desc Get all unique quiz categories
    @route GET /api/v1/admin/quizzes/categories
    @access Private
    */

	static getQuizCategories = AsyncHandler(
		async (req: Request, res: Response) => {
			// Get count of total quizzes
			const totalQuizzes = await Quiz.countDocuments();

			// Get count by category
			const categoryCounts = await Quiz.aggregate([
				{ $group: { _id: '$category', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
			]);

			// Get count by difficulty
			const difficultyCounts = await Quiz.aggregate([
				{ $group: { _id: '$difficulty', count: { $sum: 1 } } },
				{ $sort: { _id: 1 } },
			]);

			// Get total users
			const totalUsers = await User.countDocuments();

			// Get total questions count across all quizzes
			const questionCountResult = await Quiz.aggregate([
				{ $unwind: '$questions' },
				{ $count: 'totalQuestions' },
			]);
			const totalQuestions =
				questionCountResult.length > 0
					? questionCountResult[0].totalQuestions
					: 0;

			res.status(StatusCodes.OK).json({
				totalQuizzes,
				totalUsers,
				totalQuestions,
				categoryCounts,
				difficultyCounts,
			});
		}
	);
}

export default AdminController;
