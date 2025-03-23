import express, { Router, Request, Response, NextFunction } from 'express';
import QuizController from '../controllers/Quiz.controller';
import authenticateUser from '../middleware/Authenticate';
import requireAdmin from '../middleware/AdminAuth';
import { StatusCodes } from 'http-status-codes';
import Quiz from '../models/Quiz.model';
import User from '../models/User.model';

const router: Router = express.Router();

// Helper to make controller methods work with Express
const asyncHandler = (fn: Function): any => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};

// Admin dashboard summary
(router.get as any)(
	'/dashboard',
	authenticateUser,
	requireAdmin,
	asyncHandler(async (req: Request, res: Response) => {
		try {
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
		} catch (error) {
			console.error('Error getting admin dashboard data:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch admin dashboard data',
			});
		}
	})
);

// Get all unique quiz categories
(router.get as any)(
	'/quizzes/categories',
	authenticateUser,
	requireAdmin,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			// Find all unique categories
			const categoryResults = await Quiz.aggregate([
				{ $group: { _id: '$category' } },
				{ $sort: { _id: 1 } },
			]);

			// Extract category names from the results
			const categories = categoryResults
				.map((item) => item._id)
				.filter(Boolean);

			res.status(StatusCodes.OK).json({ categories });
		} catch (error) {
			console.error('Error fetching quiz categories:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch categories',
			});
		}
	})
);

// Admin routes for quiz management
(router.get as any)(
	'/quizzes',
	authenticateUser,
	requireAdmin,
	asyncHandler(async (req: Request, res: Response) => {
		try {
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
		} catch (error) {
			console.error('Error getting quizzes for admin:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch quizzes',
			});
		}
	})
);

// Get single quiz (admin version with all data)
(router.get as any)(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	asyncHandler(QuizController.getQuiz)
);

// Create new quiz
(router.post as any)(
	'/quizzes',
	authenticateUser,
	requireAdmin,
	asyncHandler(QuizController.createQuiz)
);

// Update quiz
(router.put as any)(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	asyncHandler(QuizController.updateQuiz)
);

// Delete quiz
(router.delete as any)(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	asyncHandler(QuizController.deleteQuiz)
);

// Get all users (admin only)
(router.get as any)(
	'/users',
	authenticateUser,
	requireAdmin,
	asyncHandler(async (req: Request, res: Response) => {
		try {
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
		} catch (error) {
			console.error('Error getting users for admin:', error);
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch users',
			});
		}
	})
);

export default router;
