import { Achievement, UserAchievement } from '../models/Achievement.model';
import { DailyTask, UserDailyTask } from '../models/DailyTask.model';
import QuizAttempt from '../models/QuizAttempt.model';
import { Leaderboard, GlobalLeaderboard } from '../models/Leaderboard.model';

export async function updateLeaderboard(
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

export async function checkAchievements(userId: string) {
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

		switch (achievement.criteria?.type) {
			case 'quizzes_completed':
				unlocked = userQuizzes.length >= (achievement.criteria?.value || 0);
				break;

			case 'perfect_scores':
				const perfectScores = userQuizzes.filter(
					(attempt) => attempt.score === attempt.totalPossibleScore
				).length;
				unlocked = perfectScores >= (achievement.criteria?.value || 0);
				break;

			case 'total_points':
				const totalPoints = userQuizzes.reduce(
					(sum, attempt) => sum + attempt.score,
					0
				);
				unlocked = totalPoints >= (achievement.criteria?.value || 0);
				break;

			case 'specific_quiz':
				if (achievement.criteria?.quizId) {
					unlocked =
						userQuizzes.some(
							(quiz) => quiz._id === achievement.criteria?.quizId
						) && userQuizzes.length >= (achievement.criteria?.value || 0);
				}
				break;

			default:
				unlocked = false;
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

export async function updateDailyTasks(
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
