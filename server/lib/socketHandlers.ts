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
import User from '../models/User.model';
import { Notification } from '../models/Notification.model';
import {
	updateLeaderboard,
	checkAchievements,
	updateDailyTasks,
} from '../helpers';
import { UserDailyTask } from '../models/DailyTask.model';
import { UserAchievement } from '../models/Achievement.model';

interface UserSocket extends Socket {
	userId?: string;
}

// Track active quiz sessions
const activeQuizSessions: Map<
	string,
	{
		quizId: string;
		userId: string;
		startTime: Date;
		currentQuestion: number;
		attemptId: string;
	}
> = new Map();

const initSocketHandlers = (
	io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
	// Initialize notification emitter
	initNotificationEmitter(io);
	// Apply authentication middleware
	io.use(authenticateSocket);

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

				// Create quiz attempt
				const quizAttempt = new QuizAttempt({
					quiz: quizId,
					user: socket.userId,
					totalPossibleScore: quiz.questions.reduce(
						(total, q) => total + q.points,
						0
					),
					startedAt: new Date(),
				});
				await quizAttempt.save();

				console.log(
					`Created quiz attempt ${quizAttempt.id} for user ${socket.userId}`
				);

				// Store session info
				const sessionId = `${socket.userId}:${quizId}`;
				activeQuizSessions.set(sessionId, {
					quizId,
					userId: socket.userId,
					startTime: new Date(),
					currentQuestion: 0,
					attemptId: quizAttempt.id.toString(),
				});

				// Join quiz room
				socket.join(`quiz:${quizId}`);
				console.log(`User ${socket.userId} joined quiz room ${quizId}`);

				// Send first question
				socket.emit('quiz:question', {
					question: {
						...quiz.questions[0].toObject(),
						_id: 0, // Use index instead of MongoDB _id
					},
					questionNumber: 1,
					totalQuestions: quiz.questions.length,
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

					// Use question index instead of MongoDB _id
					const questionIndex = parseInt(questionId);
					if (
						isNaN(questionIndex) ||
						questionIndex < 0 ||
						questionIndex >= quiz.questions.length
					) {
						console.log(
							`Invalid question index ${questionId} for quiz ${quizId}`
						);
						socket.emit('error', { message: 'Question not found' });
						return;
					}

					const question = quiz.questions[questionIndex];
					if (!question) {
						console.log(
							`Question at index ${questionId} not found in quiz ${quizId}`
						);
						socket.emit('error', { message: 'Question not found' });
						return;
					}

					// Get the selected answer text from the options array
					const selectedAnswerText = question.options[answer];
					if (!selectedAnswerText) {
						console.log(
							`Invalid answer index ${answer} for question ${questionId}`
						);
						socket.emit('error', { message: 'Invalid answer' });
						return;
					}

					// Check if answer is correct by comparing the actual text
					const isCorrect = selectedAnswerText === question.correctAnswer;
					const points = isCorrect ? 10 : 0; // Set fixed 10 points for correct answers
					console.log(
						`Answer for question ${questionId} is ${
							isCorrect ? 'correct' : 'incorrect'
						}`
					);

					// Send immediate feedback to the client
					socket.emit('quiz:answer-feedback', {
						isCorrect,
						correctAnswer: question.options.indexOf(question.correctAnswer), // Send the index of correct answer
						points,
					});

					// Update attempt
					await QuizAttempt.findByIdAndUpdate(session.attemptId, {
						$push: {
							answers: {
								questionId: question._id, // Store the actual MongoDB _id
								selectedAnswer: selectedAnswerText, // Store the actual answer text
								isCorrect,
								timeSpent,
							},
						},
						$inc: {
							score: points,
							timeSpent: timeSpent,
						},
					});

					// Update user's total points
					await User.findByIdAndUpdate(socket.userId, {
						$inc: { points: points },
					});

					// Move to next question or end quiz
					const nextQuestionIndex = session.currentQuestion + 1;

					if (nextQuestionIndex < quiz.questions.length) {
						// Update session
						activeQuizSessions.set(sessionId, {
							...session,
							currentQuestion: nextQuestionIndex,
						});

						// Send next question
						socket.emit('quiz:question', {
							question: {
								...quiz.questions[nextQuestionIndex].toObject(),
								_id: nextQuestionIndex, // Use index instead of MongoDB _id
							},
							questionNumber: nextQuestionIndex + 1,
							totalQuestions: quiz.questions.length,
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
							totalQuestions: quiz.questions.length,
						});

						// Notify other users about leaderboard update
						io.to(`quiz:${quizId}`).emit('leaderboard:updated', { quizId });
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
						.populate('user', 'username avatar');
				} else {
					// Global leaderboard
					leaderboardData = await GlobalLeaderboard.find()
						.sort({ totalScore: -1 })
						.limit(limit)
						.populate('user', 'username avatar');
				}

				socket.emit('leaderboard:data', {
					quizId,
					leaderboard: leaderboardData,
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

		socket.on('disconnect', () => {
			console.log(`User disconnected: ${socket.userId}`);

			// Clean up any active sessions for this user
			if (socket.userId) {
				for (const [sessionId, session] of activeQuizSessions.entries()) {
					if (session.userId === socket.userId) {
						activeQuizSessions.delete(sessionId);
					}
				}
			}
		});
	});
};

export default initSocketHandlers;
