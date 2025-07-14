import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {
	initNotificationEmitter,
	emitUserNotifications,
} from './notificationEmitter';

import Quiz from '../models/Quiz.model';
import QuizAttempt from '../models/QuizAttempt.model';
import { Leaderboard, GlobalLeaderboard } from '../models/Leaderboard.model';
import authenticateSocket from './AuthenticateSocket';
import { Notification } from '../models/Notification.model';
import {
	updateLeaderboard,
	checkAchievements,
	updateDailyTasks,
} from '../helpers';
import { UserDailyTask } from '../models/DailyTask.model';
import { UserAchievement } from '../models/Achievement.model';
import DailyTaskController from '../controllers/DailyTask.controller';
import WordsMakerModel from '../models/WordsMaker.model';
import { UserProgress } from '../models/UserProgress';
import mongoose from 'mongoose';

interface UserSocket extends Socket {
	userId?: string;
}

// Track active quiz sessions and answered questions
const activeQuizSessions: Map<
	string,
	{
		quizId: string;
		userId: string;
		startTime: Date;
		currentQuestion: number;
		attemptId: string;
		answeredQuestionIds: string[]; // Track answered questions
	}
> = new Map();

// Track user session time
const userSessions: Map<
	string,
	{
		startTime: Date;
		lastActivity: Date;
	}
> = new Map();

// Track active word maker sessions
const activeWordMakerSessions: Map<
	string,
	{
		levelId: string;
		userId: string;
		startTime: Date;
		score: number;
		wordsFound: string[];
		timeSpent: number;
	}
> = new Map();

const initSocketHandlers = (
	io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
	// Initialize notification emitter
	initNotificationEmitter(io);
	// Apply authentication middleware
	io.use(authenticateSocket);

	// Add calculateStars function
	const calculateStars = (score: number, timeSpent: number): number => {
		if (score >= 90) return 3;
		if (score >= 70) return 2;
		if (score >= 50) return 1;
		return 0;
	};

	io.on('connection', (socket: UserSocket) => {
		// Handle test connection
		socket.on('test_connection', () => {
			socket.emit('test_connection_response', {
				status: 'success',
				message: 'Connection test successful',
				userId: socket.userId,
				timestamp: new Date().toISOString(),
			});
		});

		// Join user-specific room for targeted events
		if (socket.userId) {
			socket.join(`user:${socket.userId}`);
		}

		// Handle quiz start
		socket.on('quiz:start', async (quizId: string) => {
			try {
				console.log(
					`Quiz start requested by user ${socket.userId} for quiz ${quizId}`
				);
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				const quiz = await Quiz.findById(quizId);
				if (!quiz) {
					console.log(`Quiz ${quizId} not found`);
					socket.emit('error', { message: 'Quiz not found' });
					return;
				}

				// Get user's answered questions for this quiz
				const userAttempts = await QuizAttempt.find({
					user: socket.userId,
					quiz: quizId,
				});

				const answeredQuestionIds = userAttempts.flatMap((attempt) =>
					attempt.answers.map((answer) => answer.questionId.toString())
				);

				// Filter out answered questions
				const availableQuestions = quiz.questions.filter(
					(question) => !answeredQuestionIds.includes(question._id.toString())
				);

				if (availableQuestions.length === 0) {
					socket.emit('error', {
						message: 'No new questions available. Please try another quiz.',
					});
					return;
				}

				// Create quiz attempt
				const quizAttempt = new QuizAttempt({
					quiz: quizId,
					user: socket.userId,
					totalPossibleScore: availableQuestions.reduce(
						(total, q) => total + q.points,
						0
					),
					startedAt: new Date(),
				});
				await quizAttempt.save();

				console.log(
					`Created quiz attempt ${quizAttempt.id} for user ${socket.userId}`
				);

				// Store session info with answered questions tracking
				const sessionId = `${socket.userId}:${quizId}`;
				activeQuizSessions.set(sessionId, {
					quizId,
					userId: socket.userId,
					startTime: new Date(),
					currentQuestion: 0,
					attemptId: quizAttempt.id.toString(),
					answeredQuestionIds: [],
				});

				// Join quiz room
				socket.join(`quiz:${quizId}`);
				console.log(`User ${socket.userId} joined quiz room ${quizId}`);

				// Send first question from available questions
				socket.emit('quiz:question', {
					question: {
						...availableQuestions[0].toObject(),
						_id: availableQuestions[0]._id.toString(),
					},
					questionNumber: 1,
					totalQuestions: availableQuestions.length,
					timeLimit: quiz.timeLimit,
				});
				console.log(`Sent first question to user ${socket.userId}`);
			} catch (error) {
				console.error('Error starting quiz:', error);
				socket.emit('error', { message: 'Failed to start quiz' });
			}
		});

		// Handle answer submission
		socket.on(
			'quiz:submit-answer',
			async ({ quizId, questionId, answer, timeSpent }) => {
				try {
					console.log(
						`Answer submitted by user ${socket.userId} for quiz ${quizId}, question ${questionId}`
					);
					if (!socket.userId) {
						socket.emit('error', { message: 'Authentication required' });
						return;
					}

					const sessionId = `${socket.userId}:${quizId}`;
					const session = activeQuizSessions.get(sessionId);

					if (!session) {
						console.log(
							`No active session found for user ${socket.userId} and quiz ${quizId}`
						);
						socket.emit('error', { message: 'No active quiz session found' });
						return;
					}

					const quiz = await Quiz.findById(quizId);
					if (!quiz) {
						console.log(`Quiz ${quizId} not found`);
						socket.emit('error', { message: 'Quiz not found' });
						return;
					}

					// Get available questions excluding answered ones
					const availableQuestions = quiz.questions.filter(
						(question) =>
							!session.answeredQuestionIds.includes(question._id.toString())
					);

					const currentQuestion = availableQuestions[session.currentQuestion];
					if (!currentQuestion) {
						console.log(
							`Question at index ${questionId} not found in quiz ${quizId}`
						);
						socket.emit('error', { message: 'Question not found' });
						return;
					}

					// Check answer and send feedback
					const isCorrect = answer === currentQuestion.correctAnswer;
					const points = isCorrect ? currentQuestion.points : 0;
					console.log(
						`Answer for question ${questionId} is ${
							isCorrect ? 'correct' : 'incorrect'
						}`
					);

					// Send immediate feedback to the client
					socket.emit('quiz:answer-feedback', {
						isCorrect,
						correctAnswer: currentQuestion.correctAnswer,
						points,
					});

					// Update attempt
					await QuizAttempt.findByIdAndUpdate(session.attemptId, {
						$push: {
							answers: {
								questionId: currentQuestion._id,
								selectedAnswer: answer,
								isCorrect,
								timeSpent,
							},
						},
						$inc: {
							score: points,
							timeSpent: timeSpent,
						},
					});

					// Track answered question
					session.answeredQuestionIds.push(currentQuestion._id.toString());
					activeQuizSessions.set(sessionId, session);

					// Move to next question or end quiz
					const nextQuestionIndex = session.currentQuestion + 1;

					if (nextQuestionIndex < availableQuestions.length) {
						// Update session
						activeQuizSessions.set(sessionId, {
							...session,
							currentQuestion: nextQuestionIndex,
						});

						// Send next question
						socket.emit('quiz:question', {
							question: {
								...availableQuestions[nextQuestionIndex].toObject(),
								_id: availableQuestions[nextQuestionIndex]._id.toString(),
							},
							questionNumber: nextQuestionIndex + 1,
							totalQuestions: availableQuestions.length,
							timeLimit: quiz.timeLimit,
						});
						console.log(
							`Sent question ${nextQuestionIndex + 1} to user ${socket.userId}`
						);
					} else {
						console.log(`Quiz completed for user ${socket.userId}`);
						// Quiz completed
						const attempt = await QuizAttempt.findByIdAndUpdate(
							session.attemptId,
							{
								completed: true,
								completedAt: new Date(),
							},
							{ new: true }
						);

						// Update leaderboard
						await updateLeaderboard(
							socket.userId,
							quizId,
							attempt!.score,
							attempt!.timeSpent
						);

						// Check for achievements
						await checkAchievements(socket.userId);

						// Update daily tasks
						await updateDailyTasks(socket.userId, 'complete_quiz', 1);
						await updateDailyTasks(
							socket.userId,
							'score_points',
							attempt!.score
						);

						// Remove session
						activeQuizSessions.delete(sessionId);

						// Send results
						socket.emit('quiz:completed', {
							score: attempt!.score,
							totalPossible: attempt!.totalPossibleScore,
							timeSpent: attempt!.timeSpent,
							correctAnswers: attempt!.answers.filter((a) => a.isCorrect)
								.length,
							totalQuestions: availableQuestions.length,
						});

						// Notify other users about leaderboard update
						io.to(`quiz:${quizId}`).emit('leaderboard:updated', { quizId });
					}

					// If answer is correct, update quiz tasks
					if (isCorrect) {
						await DailyTaskController.checkAndUpdateQuizTask(
							{
								currentUser: { userId: socket.userId },
								body: { correctAnswers: 1 },
							} as any,
							{} as any,
							() => {}
						);
					}
				} catch (error) {
					console.error('Error submitting answer:', error);
					socket.emit('error', { message: 'Failed to submit answer' });
				}
			}
		);

		// Handle leaderboard request
		socket.on('leaderboard:get', async ({ quizId, limit = 10 }) => {
			try {
				let leaderboardData;

				if (quizId) {
					// Quiz-specific leaderboard
					leaderboardData = await Leaderboard.find({ quiz: quizId })
						.sort({ score: -1, timeSpent: 1 })
						.limit(limit)
						.populate('user', 'username avatar')
						.lean();
				} else {
					// Global leaderboard
					leaderboardData = await GlobalLeaderboard.find()
						.sort({ totalScore: -1 })
						.limit(limit)
						.populate('user', 'username avatar')
						.lean();
				}

				// Transform the data to remove Mongoose internals
				const transformedData = leaderboardData.map((entry: any, index) => ({
					position: index + 1,
					user: {
						id: entry.user._id,
						username: entry.user.username,
						avatar: entry.user.avatar,
					},
					score: entry.totalScore || entry.score,
					quizzesCompleted: entry.quizzesCompleted,
					averageScore: entry.averageScore,
					lastUpdated: entry.lastUpdated,
				}));

				socket.emit('leaderboard:data', {
					quizId,
					leaderboard: transformedData,
					totalEntries: transformedData.length,
					currentPage: 1,
					totalPages: 1,
				});
			} catch (error) {
				console.error('Error fetching leaderboard:', error);
				socket.emit('error', { message: 'Failed to fetch leaderboard' });
			}
		});

		// Handle daily tasks request
		socket.on('dailytasks:get', async () => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const userTasks = await UserDailyTask.find({
					user: socket.userId,
					assignedDate: { $gte: today },
				}).populate('task');

				socket.emit('dailytasks:data', { tasks: userTasks });
			} catch (error) {
				console.error('Error fetching daily tasks:', error);
				socket.emit('error', { message: 'Failed to fetch daily tasks' });
			}
		});

		// Handle achievements request
		socket.on('achievements:get', async () => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				const userAchievements = await UserAchievement.find({
					user: socket.userId,
				}).populate('achievement');

				socket.emit('achievements:data', { achievements: userAchievements });
			} catch (error) {
				console.error('Error fetching achievements:', error);
				socket.emit('error', { message: 'Failed to fetch achievements' });
			}
		});

		//notification handler

		// Handle notification fetch request
		socket.on('notification:get', async () => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				const notifications = await Notification.find({ user: socket.userId })
					.sort({ createdAt: -1 })
					.limit(50);

				emitUserNotifications(socket.userId, notifications);
			} catch (error) {
				socket.emit('error', { message: 'Failed to fetch notifications' });
			}
		});

		// Handle notification send request
		socket.on('notification:send', async (data) => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}
				const notification = new Notification({
					user: socket.userId,
					...data,
				});
				await notification.save();
			} catch (error) {
				console.error('Error sending notification:', error);
				socket.emit('error', { message: 'Failed to send notification' });
			}
		});

		// mark notification as read
		socket.on('notification:read', async (notificationId) => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}
				await Notification.findByIdAndUpdate(notificationId, { isRead: true });
				socket.emit('notification:read', { notificationId });
			} catch (error) {
				console.error('Error marking notification as read:', error);
				socket.emit('error', {
					message: 'Failed to mark notification as read',
				});
			}
		});

		// delete notification
		socket.on('notification:delete', async (notificationId) => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}
				await Notification.findByIdAndDelete(notificationId);
				socket.emit('notification:deleted', { notificationId });
			} catch (error) {
				console.error('Error deleting notification:', error);
				socket.emit('error', { message: 'Failed to delete notification' });
			}
		});

		// delete all notifications
		socket.on('notification:deleteAll', async () => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}
				await Notification.deleteMany({ user: socket.userId });
				socket.emit('notification:deletedAll');
			} catch (error) {
				console.error('Error deleting all notifications:', error);
				socket.emit('error', { message: 'Failed to delete all notifications' });
			}
		});

		// mark all notifications as read
		socket.on('notification:readAll', async () => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}
				await Notification.updateMany(
					{ user: socket.userId },
					{ isRead: true }
				);
				socket.emit('notification:readAll');
			} catch (error) {
				console.error('Error marking all notifications as read:', error);
				socket.emit('error', {
					message: 'Failed to mark all notifications as read',
				});
			}
		});

		// Track user session time
		if (socket.userId) {
			userSessions.set(socket.userId, {
				startTime: new Date(),
				lastActivity: new Date(),
			});

			// Update last activity every minute
			const activityInterval = setInterval(() => {
				const session = userSessions.get(socket.userId!);
				if (session) {
					session.lastActivity = new Date();
					userSessions.set(socket.userId!, session);

					// Check if 20 minutes have passed
					const timeSpent =
						(session.lastActivity.getTime() - session.startTime.getTime()) /
						(1000 * 60);
					if (timeSpent >= 20) {
						// Update time spent tasks
						DailyTaskController.checkAndUpdateTimeSpentTask(
							{
								currentUser: { userId: socket.userId },
								body: { timeSpent: 20 },
							} as any,
							{} as any,
							() => {}
						);

						// Reset session time
						session.startTime = new Date();
						userSessions.set(socket.userId!, session);
					}
				}
			}, 60000); // Check every minute

			socket.on('disconnect', () => {
				clearInterval(activityInterval);
				userSessions.delete(socket.userId!);
			});
		}

		// Word Maker game handlers
		socket.on('wordmaker:start', async (levelId: string) => {
			try {
				console.log(
					`Starting word maker level ${levelId} for user ${socket.userId}`
				);

				if (!socket.userId) {
					console.error('No user ID found in socket');
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				if (!levelId) {
					console.error('No level ID provided');
					socket.emit('error', {
						message: 'Invalid level data',
						details: 'Level ID is required',
					});
					return;
				}

				// First try to find by level number
				const levelNumber = parseInt(levelId);
				if (isNaN(levelNumber)) {
					console.error(`Invalid level number: ${levelId}`);
					socket.emit('error', {
						message: 'Invalid level data',
						details: 'Level number must be a valid number',
					});
					return;
				}

				const level = await WordsMakerModel.findOne({ level: levelNumber });
				if (!level) {
					console.error(`Level ${levelNumber} not found in database`);
					socket.emit('error', {
						message: 'Level not found',
						details: `Level ${levelNumber} does not exist in the database`,
					});
					return;
				}

				// Use the level's _id or create a new one if it doesn't exist
				const levelObjectId = level._id || new mongoose.Types.ObjectId();

				const sessionId = `${socket.userId}:${levelObjectId}`;

				// Check if session already exists
				if (!activeWordMakerSessions.has(sessionId)) {
					activeWordMakerSessions.set(sessionId, {
						levelId: levelObjectId.toString(),
						userId: socket.userId,
						startTime: new Date(),
						score: 0,
						wordsFound: [],
						timeSpent: 0,
					});
				}

				// Join level room
				socket.join(`wordmaker:${levelObjectId}`);
				console.log(
					`User ${socket.userId} joined wordmaker room ${levelObjectId}`
				);

				// Send level data
				const levelData = {
					...level.toObject(),
					_id: levelObjectId.toString(),
				};
				console.log(`Sending level data for level ${level.level}`);
				socket.emit('wordmaker:level-data', {
					level: levelData,
					timeLimit: level.timeLimit,
				});
			} catch (error) {
				console.error('Error starting word maker level:', error);
				socket.emit('error', {
					message: 'Failed to start level',
					details: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		});

		socket.on('wordmaker:word-found', async ({ levelId, word, timeSpent }) => {
			try {
				if (!socket.userId) {
					socket.emit('error', { message: 'Authentication required' });
					return;
				}

				const sessionId = `${socket.userId}:${levelId}`;
				const session = activeWordMakerSessions.get(sessionId);

				if (!session) {
					console.error(`No active session found for ${sessionId}`);
					socket.emit('error', { message: 'No active session found' });
					return;
				}

				// Update session
				if (!session.wordsFound.includes(word)) {
					session.wordsFound.push(word);
					session.score += 5; // 5 points per word
				}
				session.timeSpent = timeSpent;
				activeWordMakerSessions.set(sessionId, session);

				// Check if level is completed
				const level = await WordsMakerModel.findById(levelId);
				if (level && session.wordsFound.length === level.words.length) {
					// Level completed
					const stars = calculateStars(session.score, session.timeSpent);

					// Save progress
					await UserProgress.findOneAndUpdate(
						{ userId: socket.userId, level: level.level },
						{
							score: session.score,
							wordsFound: session.wordsFound.map((word) => ({
								word,
								foundAt: new Date(),
							})),
							timeSpent: session.timeSpent,
							stars,
							status: 'completed',
							completedAt: new Date(),
						},
						{ upsert: true, new: true }
					);

					// Unlock next level if it exists
					const nextLevel = await WordsMakerModel.findOne({
						level: level.level + 1,
					});
					if (nextLevel) {
						await UserProgress.findOneAndUpdate(
							{ userId: socket.userId, level: nextLevel.level },
							{ status: 'unlocked' },
							{ upsert: true }
						);
					}

					// Notify completion
					socket.emit('wordmaker:level-completed', {
						score: session.score,
						wordsFound: session.wordsFound,
						timeSpent: session.timeSpent,
						stars,
					});

					// Notify other users about progress
					io.to(`wordmaker:${levelId}`).emit('wordmaker:progress-updated', {
						userId: socket.userId,
						level: level.level,
						score: session.score,
						stars,
					});

					// Remove session
					activeWordMakerSessions.delete(sessionId);
				} else {
					// Update progress
					socket.emit('wordmaker:progress-updated', {
						score: session.score,
						wordsFound: session.wordsFound,
						timeSpent: session.timeSpent,
					});
				}
			} catch (error) {
				console.error('Error processing word found:', error);
				socket.emit('error', { message: 'Failed to process word' });
			}
		});

		socket.on('wordmaker:leave', (levelId: string) => {
			const sessionId = `${socket.userId}:${levelId}`;
			activeWordMakerSessions.delete(sessionId);
			socket.leave(`wordmaker:${levelId}`);
		});

		socket.on('disconnect', () => {
			// Clean up any active sessions for this socket
			for (const [sessionId, session] of activeWordMakerSessions.entries()) {
				if (session.userId === socket.userId) {
					activeWordMakerSessions.delete(sessionId);
				}
			}
		});
	});
};

export default initSocketHandlers;
