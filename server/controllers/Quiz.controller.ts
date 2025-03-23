import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import Quiz from '../models/Quiz.model';
import QuizAttempt from '../models/QuizAttempt.model';

class QuizController {
	// Get all quizzes with optional filtering
	static async getAllQuizzes(req: Request, res: Response) {
		try {
			const { category, difficulty, search, limit = 10, page = 1 } = req.query;

			const queryObject: any = { isPublic: true };

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
				.select('-questions.correctAnswer') // Don't send correct answers to client
				.limit(Number(limit))
				.skip(skip)
				.sort({ createdAt: -1 });

			const totalQuizzes = await Quiz.countDocuments(queryObject);

			return res.status(StatusCodes.OK).json({
				quizzes,
				totalQuizzes,
				currentPage: Number(page),
				totalPages: Math.ceil(totalQuizzes / Number(limit)),
			});
		} catch (error) {
			console.error('Error getting quizzes:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch quizzes',
			});
		}
	}

	// Get available categories
	static async getCategories(req: Request, res: Response) {
		try {
			const categories = await Quiz.distinct('category');

			return res.status(StatusCodes.OK).json({ categories });
		} catch (error) {
			console.error('Error getting categories:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch categories',
			});
		}
	}

	// Get single quiz by ID
	static async getQuiz(req: Request, res: Response) {
		try {
			const { id } = req.params;

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid quiz ID',
				});
			}

			const quiz = await Quiz.findById(id);

			if (!quiz) {
				return res.status(StatusCodes.NOT_FOUND).json({
					message: 'Quiz not found',
				});
			}
			// If requesting user is not the creator, hide correct answers
			if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
				quiz.questions.forEach((q) => {
					q.correctAnswer = '';
				});
			}

			return res.status(StatusCodes.OK).json({ quiz });
		} catch (error) {
			console.error('Error getting quiz:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch quiz',
			});
		}
	}

	// Create a new quiz
	static async createQuiz(req: Request, res: Response) {
		try {
			const {
				title,
				description,
				category,
				difficulty,
				questions,
				timeLimit,
				isPublic,
			} = req.body;

			if (!title || !description || !category || questions.length === 0) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Please provide all required fields',
				});
			}

			const newQuiz = new Quiz({
				title,
				description,
				category,
				difficulty: difficulty || 'medium',
				timeLimit: timeLimit || 60,
				questions,
				createdBy: req.currentUser?.userId,
				isPublic: isPublic !== undefined ? isPublic : true,
			});

			await newQuiz.save();

			return res.status(StatusCodes.CREATED).json({
				message: 'Quiz created successfully',
				quiz: newQuiz,
			});
		} catch (error) {
			console.error('Error creating quiz:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to create quiz',
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	// Update a quiz
	static async updateQuiz(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const {
				title,
				description,
				category,
				difficulty,
				questions,
				timeLimit,
				isPublic,
			} = req.body;

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid quiz ID',
				});
			}

			const quiz = await Quiz.findById(id);

			if (!quiz) {
				return res.status(StatusCodes.NOT_FOUND).json({
					message: 'Quiz not found',
				});
			}
			// Check if user is the creator
			if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Not authorized to update this quiz',
				});
			}

			const updatedQuiz = await Quiz.findByIdAndUpdate(
				id,
				{
					title,
					description,
					category,
					difficulty,
					questions,
					timeLimit,
					isPublic,
				},
				{ new: true, runValidators: true }
			);

			return res.status(StatusCodes.OK).json({
				message: 'Quiz updated successfully',
				quiz: updatedQuiz,
			});
		} catch (error) {
			console.error('Error updating quiz:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to update quiz',
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	// Delete a quiz
	static async deleteQuiz(req: Request, res: Response) {
		try {
			const { id } = req.params;

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid quiz ID',
				});
			}

			const quiz = await Quiz.findById(id);

			if (!quiz) {
				return res.status(StatusCodes.NOT_FOUND).json({
					message: 'Quiz not found',
				});
			}
			// Check if user is the creator
			if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Not authorized to delete this quiz',
				});
			}

			await Quiz.findByIdAndDelete(id);

			return res.status(StatusCodes.OK).json({
				message: 'Quiz deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting quiz:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to delete quiz',
			});
		}
	}

	// Get quizzes created by the user
	static async getUserCreatedQuizzes(req: Request, res: Response) {
		try {
			const quizzes = await Quiz.find({
				createdBy: req.currentUser?.userId,
			}).sort({
				createdAt: -1,
			});

			return res.status(StatusCodes.OK).json({ quizzes });
		} catch (error) {
			console.error('Error getting user quizzes:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch user quizzes',
			});
		}
	}

	// Get quiz attempts by the user
	static async getUserQuizAttempts(req: Request, res: Response) {
		try {
			const attempts = await QuizAttempt.find({ user: req.currentUser?.userId })
				.populate('quiz', 'title category difficulty')
				.sort({ completedAt: -1 });

			return res.status(StatusCodes.OK).json({ attempts });
		} catch (error) {
			console.error('Error getting user quiz attempts:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch user quiz attempts',
			});
		}
	}

	// Get all attempts for a specific quiz (only for quiz creator)
	static async getQuizAttempts(req: Request, res: Response) {
		try {
			const { quizId } = req.params;

			if (!mongoose.Types.ObjectId.isValid(quizId)) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid quiz ID',
				});
			}

			const quiz = await Quiz.findById(quizId);

			if (!quiz) {
				return res.status(StatusCodes.NOT_FOUND).json({
					message: 'Quiz not found',
				});
			}
			// Check if user is the creator
			if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Not authorized to view these attempts',
				});
			}

			const attempts = await QuizAttempt.find({ quiz: quizId })
				.populate('user', 'username email')
				.sort({ completedAt: -1 });

			return res.status(StatusCodes.OK).json({ attempts });
		} catch (error) {
			console.error('Error getting quiz attempts:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch quiz attempts',
			});
		}
	}
}

export default QuizController;
