import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getSession } from '../middleware/session';

// Models
import Quiz from '../models/Quiz.model';
import QuizAttempt from '../models/QuizAttempt.model';
import { Leaderboard, GlobalLeaderboard } from '../models/Leaderboard.model';
import { Achievement, UserAchievement } from '../models/Achievement.model';
import { DailyTask, UserDailyTask } from '../models/DailyTask.model';

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

// Middleware to authenticate socket connections
const authenticateSocket = async (
	socket: UserSocket,
	next: (err?: Error) => void
) => {
	try {
		console.log('Socket authentication attempt');
		console.log('Headers:', socket.handshake.headers);
		console.log('Cookies:', socket.handshake.headers.cookie);

		// Get the session from the cookie
		const session = await getSession(socket.handshake.headers.cookie || '');

		if (!session || !session.userId) {
			console.log('No valid session found');
			return next(new Error('Authentication error: No valid session'));
		}

		console.log('Socket authenticated for user:', session.userId);
		socket.userId = session.userId;
		next();
	} catch (error) {
		console.error('Socket authentication error:', error);
		next(new Error('Authentication error: Invalid session'));
	}
};

const initSocketHandlers = (
	io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
	// Apply authentication middleware
	io.use(authenticateSocket);

	io.on('connection', (socket: UserSocket) => {
		console.log(`User connected: ${socket.userId}`);

		// Handle test connection
		socket.on('test_connection', () => {
			console.log(`Test connection received from user ${socket.userId}`);
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
					question: quiz.questions[0],
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

					const question = quiz.questions.find(
						(q: any) => q._id.toString() === questionId
					);
					if (!question) {
						console.log(`Question ${questionId} not found in quiz ${quizId}`);
						socket.emit('error', { message: 'Question not found' });
						return;
					}

					// Check if answer is correct
					const isCorrect = question.correctAnswer === answer;
					console.log(
						`Answer for question ${questionId} is ${
							isCorrect ? 'correct' : 'incorrect'
						}`
					);

					// Update attempt
					await QuizAttempt.findByIdAndUpdate(session.attemptId, {
						$push: {
							answers: {
								questionId,
								selectedAnswer: answer,
								isCorrect,
								timeSpent,
							},
						},
						$inc: {
							score: isCorrect ? question.points : 0,
							timeSpent: timeSpent,
						},
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
							question: quiz.questions[nextQuestionIndex],
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

// Helper functions
async function updateLeaderboard(
	userId: string,
	quizId: string,
	score: number,
	timeSpent: number
) {
	// Update quiz-specific leaderboard
	await Leaderboard.findOneAndUpdate(
		{ user: userId, quiz: quizId },
		{
			score,
			timeSpent,
			completedAt: new Date(),
		},
		{ upsert: true, new: true }
	);

	// Update global leaderboard
	const userQuizzes = await QuizAttempt.find({ user: userId, completed: true });
	const totalScore = userQuizzes.reduce(
		(sum, attempt) => sum + attempt.score,
		0
	);
	const quizzesCompleted = userQuizzes.length;
	const averageScore = quizzesCompleted > 0 ? totalScore / quizzesCompleted : 0;

	await GlobalLeaderboard.findOneAndUpdate(
		{ user: userId },
		{
			totalScore,
			quizzesCompleted,
			averageScore,
			lastUpdated: new Date(),
		},
		{ upsert: true, new: true }
	);
}

async function checkAchievements(userId: string) {
	// Get all achievements
	const achievements = await Achievement.find();
	const userQuizzes = await QuizAttempt.find({ user: userId, completed: true });

	for (const achievement of achievements) {
		// Skip already unlocked achievements
		const alreadyUnlocked = await UserAchievement.findOne({
			user: userId,
			achievement: achievement._id,
		});

		if (alreadyUnlocked) continue;

		let unlocked = false;

		switch (achievement.criteria.type) {
			case 'quizzes_completed':
				unlocked = userQuizzes.length >= achievement.criteria.value;
				break;

			case 'perfect_scores':
				const perfectScores = userQuizzes.filter(
					(attempt) => attempt.score === attempt.totalPossibleScore
				).length;
				unlocked = perfectScores >= achievement.criteria.value;
				break;

			case 'total_points':
				const totalPoints = userQuizzes.reduce(
					(sum, attempt) => sum + attempt.score,
					0
				);
				unlocked = totalPoints >= achievement.criteria.value;
				break;

			case 'specific_quiz':
				if (achievement.criteria.quizId) {
					const specificQuizAttempt = userQuizzes.find(
						(attempt) =>
							attempt.quiz.toString() ===
								achievement.criteria.quizId!.toString() &&
							attempt.score === attempt.totalPossibleScore
					);
					unlocked = !!specificQuizAttempt;
				}
				break;
		}

		if (unlocked) {
			// Unlock achievement
			await UserAchievement.create({
				user: userId,
				achievement: achievement._id,
				unlockedAt: new Date(),
			});
		}
	}
}

async function updateDailyTasks(
	userId: string,
	taskType: string,
	value: number
) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Find active tasks of this type
	const tasks = await DailyTask.find({
		type: taskType,
		isActive: true,
	});

	for (const task of tasks) {
		// Find or create user task
		const userTask = await UserDailyTask.findOneAndUpdate(
			{
				user: userId,
				task: task._id,
				assignedDate: { $gte: today },
				completed: false,
			},
			{ $inc: { progress: value } },
			{ upsert: true, new: true }
		);

		// Check if task is now completed
		if (userTask.progress >= task.requirement && !userTask.completed) {
			await UserDailyTask.findByIdAndUpdate(userTask._id, {
				completed: true,
				completedAt: new Date(),
			});
		}
	}
}

export default initSocketHandlers;
