import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import Quiz from '../models/Quiz.model';
import QuizAttempt from '../models/QuizAttempt.model';
import AsyncHandler from '../middleware/AsyncHandler';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import { Leaderboard } from '../models/Leaderboard.model';

class QuizController {
	/*
	 * @desc Get all quizzes with optional filtering
	 * @route GET /api/v1/quizzes
	 * @access Public
	 */
	static getAllQuizzes = AsyncHandler(async (req: Request, res: Response) => {
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
			.select('-questions.correctAnswer')
			.limit(Number(limit))
			.skip(skip)
			.sort({ createdAt: -1 });

		if (quizzes.length === 0) {
			throw new NotFoundError('No quizzes found for the given criteria');
		}

		const totalQuizzes = await Quiz.countDocuments(queryObject);

		res.status(StatusCodes.OK).json({
			quizzes,
			totalQuizzes,
			currentPage: Number(page),
			totalPages: Math.ceil(totalQuizzes / Number(limit)),
		});
	});

	/*
	 * @desc Get available categories
	 * @route GET /api/v1/quizzes/categories
	 * @access Public
	 */
	static getCategories = AsyncHandler(async (req: Request, res: Response) => {
		const quizzes = await Quiz.find();

		const leaderboard = await Leaderboard.find({});

		const categories = quizzes.map((category) => ({
			name: category.category,
			icon: category.icon,
			quizzesCount: quizzes.filter(
				(quiz) => quiz.category === category.category
			).length,

			totalPlayers: leaderboard.filter(
				(leaderboard) => leaderboard.quiz.toString() === category._id.toString()
			).length,
		}));

		res.status(StatusCodes.OK).json({ categories: categories });
	});

	/*
	 * @desc Get quiz by category
	 * @route GET /api/v1/quizzes/categories/:category
	 * @access Public
	 */
	static getQuizByCategory = AsyncHandler(
		async (req: Request, res: Response) => {
			const { category } = req.params;
			const userId = req.currentUser?.userId;

			// Get all quizzes in the category
			const quizzes = await Quiz.find({
				category,
				isPublic: true,
			}).select('-questions.correctAnswer');

			if (quizzes.length === 0) {
				throw new NotFoundError(`No quizzes found in '${category}' category`);
			}

			// Get all answered question IDs for this user
			let answeredQuestionIds: mongoose.Types.ObjectId[] = [];
			if (userId) {
				const userAttempts = await QuizAttempt.find({
					user: userId,
					quiz: { $in: quizzes.map((q) => q._id) },
				});

				answeredQuestionIds = userAttempts.flatMap((attempt) =>
					attempt.answers.map((answer) => answer.questionId)
				);
			}

			// Process each quiz to get first 10 unanswered questions
			const processedQuizzes = quizzes.map((quiz) => {
				// Filter out answered questions and get first 10
				const unansweredQuestions = quiz.questions
					.filter((question) => !answeredQuestionIds.includes(question._id))
					.slice(0, 10);

				// If no unanswered questions, return empty array
				if (unansweredQuestions.length === 0) {
					return {
						...quiz.toObject(),
						questions: [],
						message: 'No new questions available. Please try another category.',
					};
				}

				return {
					...quiz.toObject(),
					questions: unansweredQuestions,
				};
			});

			res.status(StatusCodes.OK).json({ quizzes: processedQuizzes });
		}
	);

	/*
	 * @desc Get quizzes by difficulty
	 * @route GET /api/v1/quizzes/difficulty/:difficulty
	 * @access Public
	 */
	static getQuizByDifficulty = AsyncHandler(
		async (req: Request, res: Response) => {
			const { difficulty } = req.params;
			const quizzes = await Quiz.find({
				difficulty,
				isPublic: true,
			}).select('-questions.correctAnswer');
			if (quizzes.length === 0) {
				throw new NotFoundError(
					`No quizzes found for this difficulty level : ${difficulty}`
				);
			}
			res.status(StatusCodes.OK).json({ quizzes });
		}
	);

	/*
	 * @desc Get single quiz by ID
	 * @route GET /api/v1/quizzes/:id
	 * @access Public
	 */
	static getQuiz = AsyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;

		const quiz = await Quiz.findById(id);

		if (!quiz) {
			throw new NotFoundError('Quiz not found');
		}
		// If requesting user is not the creator, hide correct answers
		if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
			quiz.questions.forEach((q) => {
				q.correctAnswer = '';
			});
		}

		res.status(StatusCodes.OK).json({ quiz });
	});

	/*
	 * @desc Create a new quiz
	 * @route POST /api/v1/quizzes
	 * @access Private/Admin
	 */
	static createQuiz = AsyncHandler(async (req: Request, res: Response) => {
		// Verify admin status
		if (!req.user?.isAdmin) {
			throw new UnauthorizedError('Only admins can create quizzes');
		}

		const {
			title,
			description,
			category,
			icon,
			difficulty,
			questions,
			timeLimit,
			isPublic,
		} = req.body;

		// Validate required fields
		if (
			!title ||
			!description ||
			!category ||
			!questions ||
			questions.length === 0
		) {
			throw new BadRequestError('Please provide all required fields');
		}

		// Validate questions format
		questions.forEach((q: any, index: number) => {
			if (
				!q.question ||
				!q.options ||
				!q.correctAnswer ||
				!Array.isArray(q.options)
			) {
				throw new BadRequestError(`Invalid question format at index ${index}`);
			}
			if (!q.options.includes(q.correctAnswer)) {
				throw new BadRequestError(
					`Correct answer must be one of the options at question ${index + 1}`
				);
			}
		});

		const newQuiz = new Quiz({
			title,
			description,
			category,
			icon: icon,
			difficulty: difficulty,
			timeLimit: timeLimit,
			questions,
			createdBy: req.user.userId,
			isPublic: isPublic,
		});

		await newQuiz.save();

		res.status(StatusCodes.CREATED).json({
			message: 'Quiz created successfully',
			quiz: newQuiz,
		});
	});

	/*
	 * @desc Update a quiz
	 * @route PATCH /api/v1/quizzes/:id
	 * @access Private/Admin
	 */
	static updateQuiz = AsyncHandler(async (req: Request, res: Response) => {
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

		const quiz = await Quiz.findById(id);

		if (!quiz) {
			throw new NotFoundError('Quiz not found');
		}

		if (!req.user?.isAdmin) {
			throw new UnauthorizedError('Not authorized to update this quiz');
		}

		quiz.title = title || quiz.title;
		quiz.description = description || quiz.description;
		quiz.category = category || quiz.category;
		quiz.difficulty = difficulty || quiz.difficulty;
		quiz.questions = questions || quiz.questions;
		quiz.timeLimit = timeLimit || quiz.timeLimit;
		quiz.isPublic = isPublic || quiz.isPublic;

		await quiz.save();

		res.status(StatusCodes.OK).json({
			message: 'Quiz updated successfully',
			quiz: quiz,
		});
	});

	/*
	 * @desc Delete a quiz
	 * @route DELETE /api/v1/quizzes/:id
	 * @access Private/Admin
	 */
	static deleteQuiz = AsyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;

		const quiz = await Quiz.findById(id);

		if (!quiz) {
			throw new NotFoundError('Quiz not found');
		}

		if (!req.user?.isAdmin) {
			throw new UnauthorizedError('Not authorized to delete this quiz');
		}

		await Quiz.findByIdAndDelete(id);

		res.status(StatusCodes.OK).json({
			message: 'Quiz deleted successfully',
		});
	});

	/*
	 * @desc Get quiz attempts by the user
	 * @route GET /api/v1/quizzes/user/attempts
	 * @access Private/
	 */
	static getUserQuizAttempts = AsyncHandler(
		async (req: Request, res: Response) => {
			const attempts = await QuizAttempt.find({ user: req.currentUser?.userId })
				.populate({
					path: 'quiz',
					select: 'title category difficulty questions',
				})
				.sort({ completedAt: -1 });

			if (!attempts) {
				throw new NotFoundError('No quiz attempts found for this user');
			}

			// Transform the attempts to include full question details
			const formattedAttempts = attempts.map((attempt) => ({
				...attempt.toObject(),
				questions: (attempt.quiz as any).questions.map(
					(question: any, index: number) => ({
						question: question.question,
						options: question.options,
						correctAnswer: question.correctAnswer,
						userAnswer: attempt.answers[index].selectedAnswer,
						isCorrect:
							attempt.answers[index].selectedAnswer === question.correctAnswer,
					})
				),
			}));

			res.status(StatusCodes.OK).json({ attempts: formattedAttempts });
		}
	);

	/*
	 * @desc Get all attempts for a specific quiz (only for quiz creator)
	 * @route GET /api/v1/quizzes/attempts/:quizId
	 * @access Private
	 */
	static getQuizAttempts = AsyncHandler(async (req: Request, res: Response) => {
		const { quizId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(quizId)) {
			throw new BadRequestError('Invalid quiz ID');
		}

		const quiz = await Quiz.findById(quizId);

		if (!quiz) {
			throw new NotFoundError('Quiz not found');
		}
		// Check if user is the creator
		if (quiz.createdBy.toString() !== req.currentUser?.userId.toString()) {
			throw new UnauthorizedError('Not authorized to view these attempts');
		}

		const attempts = await QuizAttempt.find({ quiz: quizId })
			.populate('user', 'username email')
			.sort({ completedAt: -1 });

		// Transform the attempts to include full question details
		const formattedAttempts = attempts.map((attempt) => ({
			user: attempt.user,
			completedAt: attempt.completedAt,
			score: attempt.score,
			questions: quiz.questions.map((question, index) => ({
				question: question.question,
				options: question.options,
				correctAnswer: question.correctAnswer,
				userAnswer: attempt.answers[index].selectedAnswer,
				isCorrect:
					attempt.answers[index].selectedAnswer === question.correctAnswer,
			})),
		}));

		res.status(StatusCodes.OK).json({ attempts: formattedAttempts });
	});
}

export default QuizController;
