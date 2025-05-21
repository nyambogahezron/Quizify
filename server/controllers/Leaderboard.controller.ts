import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Leaderboard, GlobalLeaderboard } from '../models/Leaderboard.model';
import Quiz from '../models/Quiz.model';
import AsyncHandler from '../middleware/AsyncHandler';
import { NotFoundError, UnauthorizedError } from '../errors';

class LeaderboardController {
	/*
	 * @desc Get global leaderboard (top performers across all quizzes)
	 * @route GET /api/leaderboard/global
	 * @access Public
	 */
	static getGlobalLeaderboard = AsyncHandler(
		async (req: Request, res: Response) => {
			const { limit = 20, page = 1 } = req.query;
			const skip = (Number(page) - 1) * Number(limit);

			const leaderboard = await GlobalLeaderboard.find()
				.populate('user', 'username avatar')
				.sort({
					totalScore: -1,
					averageScore: -1,
					quizzesCompleted: -1,
				})
				.limit(Number(limit))
				.skip(skip);

			// Transform the data to return only necessary fields
			const cleanLeaderboard = leaderboard.map((entry, index) => ({
				position: skip + index + 1,
				user: {
					id: entry.user._id,
					username: (entry.user as any).username,
					avatar: (entry.user as any).avatar,
				},
				totalScore: entry.totalScore,
				averageScore: entry.averageScore,
				quizzesCompleted: entry.quizzesCompleted,
				lastUpdated: entry.lastUpdated,
			}));

			const totalEntries = await GlobalLeaderboard.countDocuments();

			res.status(StatusCodes.OK).json({
				leaderboard: cleanLeaderboard,
				totalEntries,
				currentPage: Number(page),
				totalPages: Math.ceil(totalEntries / Number(limit)),
			});
		}
	);

	/*
	 * @desc Get leaderboard for a specific quiz
	 * @route GET /api/leaderboard/quiz/:quizId
	 * @access Public
	 */
	static getQuizLeaderboard = AsyncHandler(
		async (req: Request, res: Response) => {
			const { quizId } = req.params;
			const { limit = 20, page = 1 } = req.query;

			const quiz = await Quiz.findById(quizId);

			if (!quiz) {
				throw new NotFoundError('Quiz not found');
			}

			const skip = (Number(page) - 1) * Number(limit);

			const leaderboard = await Leaderboard.find({ quiz: quizId })
				.populate('user', 'username avatar')
				.sort({ score: -1, timeSpent: 1 }) // Sort by score (desc) and timeSpent (asc)
				.limit(Number(limit))
				.skip(skip);

			const totalEntries = await Leaderboard.countDocuments({ quiz: quizId });

			res.status(StatusCodes.OK).json({
				quiz: {
					id: quiz._id,
					title: quiz.title,
					category: quiz.category,
					difficulty: quiz.difficulty,
				},
				leaderboard,
				totalEntries,
				currentPage: Number(page),
				totalPages: Math.ceil(totalEntries / Number(limit)),
			});
		}
	);

	/*
	 * @desc Get user's rankings across all quizzes
	 * @route GET /api/leaderboard/user
	 * @access Private
	 */
	static getUserRankings = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		// Get global ranking
		const globalRanking = await GlobalLeaderboard.findOne({
			user: req.user.userId,
		});

		// Get total users to calculate percentile
		const totalUsers = await GlobalLeaderboard.countDocuments();

		let globalRank = null;
		let percentile = null;

		if (globalRanking) {
			// Find the position of the user in the global leaderboard
			const usersWithHigherScores = await GlobalLeaderboard.countDocuments({
				totalScore: { $gt: globalRanking.totalScore },
			});

			globalRank = usersWithHigherScores + 1;
			percentile = Math.round(((totalUsers - globalRank) / totalUsers) * 100);
		}

		// Get user's quiz-specific rankings
		const quizRankings = await Leaderboard.find({
			user: req.user.userId,
		})
			.populate('quiz', 'title category difficulty')
			.sort({ score: -1 });

		// For each quiz, get the user's rank
		const quizRankingsWithPosition = await Promise.all(
			quizRankings.map(async (ranking) => {
				const higherScores = await Leaderboard.countDocuments({
					quiz: ranking.quiz,
					score: { $gt: ranking.score },
				});

				const sameScoreButFaster = await Leaderboard.countDocuments({
					quiz: ranking.quiz,
					score: ranking.score,
					timeSpent: { $lt: ranking.timeSpent },
				});

				const rank = higherScores + sameScoreButFaster + 1;

				const totalEntries = await Leaderboard.countDocuments({
					quiz: ranking.quiz,
				});

				return {
					quiz: ranking.quiz,
					score: ranking.score,
					timeSpent: ranking.timeSpent,
					rank,
					totalParticipants: totalEntries,
					percentile: Math.round(((totalEntries - rank) / totalEntries) * 100),
				};
			})
		);

		res.status(StatusCodes.OK).json({
			global: {
				totalScore: globalRanking?.totalScore || 0,
				quizzesCompleted: globalRanking?.quizzesCompleted || 0,
				averageScore: globalRanking?.averageScore || 0,
				rank: globalRank,
				totalParticipants: totalUsers,
				percentile,
			},
			quizzes: quizRankingsWithPosition,
		});
	});
}

export default LeaderboardController;
