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

	/*
	@desc Get all quizzes
	@route GET /api/v1/admin/quizzes
	@access Private
	*/

	static getAllUsers = AsyncHandler(async (req: Request, res: Response) => {
		const { limit = 20, page = 1, search } = req.query;

		const queryObject: any = {};

		if (search) {
			queryObject.$or = [
				{ username: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ name: { $regex: search, $options: 'i' } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);

		const users = await User.find(queryObject)
			.select('-password')
			.limit(Number(limit))
			.skip(skip)
			.sort({ createdAt: -1 });

		const totalUsers = await User.countDocuments(queryObject);

		res.status(StatusCodes.OK).json({
			users,
			totalUsers,
			currentPage: Number(page),
			totalPages: Math.ceil(totalUsers / Number(limit)),
		});
	});

	/*
	@desc Get all quizzes
	@route GET /api/v1/admin/quizzes
	@access Private
	*/

	static getAllQuizzes = AsyncHandler(async (req: Request, res: Response) => {
		const { limit = 20, page = 1, category, difficulty, search } = req.query;

		const queryObject: any = {};

		if (category) {
			queryObject.category = category;
		}

		if (difficulty) {
			queryObject.difficulty = difficulty;
		}

		if (search) {
			queryObject.title = { $regex: search, $options: 'i' };
		}

		const skip = (Number(page) - 1) * Number(limit);

		const quizzes = await Quiz.find(queryObject)
			.limit(Number(limit))
			.skip(skip)
			.sort({ createdAt: -1 });

		const totalQuizzes = await Quiz.countDocuments(queryObject);

		res.status(StatusCodes.OK).json({
			quizzes,
			totalQuizzes,
			currentPage: Number(page),
			totalPages: Math.ceil(totalQuizzes / Number(limit)),
		});
	});

	static dashboardSummary = AsyncHandler(
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
