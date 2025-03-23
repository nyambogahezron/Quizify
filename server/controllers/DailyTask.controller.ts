import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { DailyTask, UserDailyTask } from '../models/DailyTask.model';

// Define an interface for the DailyTask document if not already exported from the model
interface DailyTaskDocument extends mongoose.Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	description: string;
	type: string;
	requirement: number;
	points: number;
	isActive: boolean;
}

class DailyTaskController {
	// Get current daily tasks for the authenticated user
	static async getDailyTasks(req: Request, res: Response) {
		try {
			if (!req.currentUser?.userId) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Unauthorized',
				});
			}

			// Today's date (start of day)
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Get active tasks
			const activeTasks = (await DailyTask.find({
				isActive: true,
			})) as DailyTaskDocument[];

			// Get user's progress on these tasks
			const userTasks = await UserDailyTask.find({
				user: req.currentUser.userId,
				assignedDate: { $gte: today },
			});

			// Create a map for easier lookup
			const userTaskMap = new Map(
				userTasks.map((task) => [task.task.toString(), task])
			);

			// If user doesn't have an active task, create it
			const taskAssignments = await Promise.all(
				activeTasks.map(async (task) => {
					const taskId = task._id.toString();

					// If user already has this task assigned
					if (userTaskMap.has(taskId)) {
						const userTask = userTaskMap.get(taskId)!;
						return {
							id: userTask._id,
							taskId: task._id,
							name: task.name,
							description: task.description,
							type: task.type,
							requirement: task.requirement,
							points: task.points,
							progress: userTask.progress,
							completed: userTask.completed,
							completedAt: userTask.completedAt,
						};
					}

					// If not, create a new user task assignment
					const newUserTask = new UserDailyTask({
						user: req?.currentUser?.userId,
						task: task._id,
						assignedDate: today,
					});

					await newUserTask.save();

					return {
						id: newUserTask._id,
						taskId: task._id,
						name: task.name,
						description: task.description,
						type: task.type,
						requirement: task.requirement,
						points: task.points,
						progress: 0,
						completed: false,
						completedAt: null,
					};
				})
			);

			// Statistics
			const completedTasks = taskAssignments.filter(
				(task) => task.completed
			).length;
			const totalTasks = taskAssignments.length;
			const progressPercentage =
				totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

			return res.status(StatusCodes.OK).json({
				tasks: taskAssignments,
				stats: {
					total: totalTasks,
					completed: completedTasks,
					incomplete: totalTasks - completedTasks,
					progressPercentage: Math.round(progressPercentage),
				},
			});
		} catch (error) {
			console.error('Error getting daily tasks:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to fetch daily tasks',
			});
		}
	}

	// Update user's progress on a task (manual update for certain task types)
	static async updateTaskProgress(req: Request, res: Response) {
		try {
			if (!req.currentUser?.userId) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					message: 'Unauthorized',
				});
			}

			const { taskId } = req.params;
			const { progress } = req.body;

			if (!mongoose.Types.ObjectId.isValid(taskId)) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid task ID',
				});
			}

			// Today's date (start of day)
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Get the task
			const task = await DailyTask.findById(taskId);

			if (!task) {
				return res.status(StatusCodes.NOT_FOUND).json({
					message: 'Task not found',
				});
			}

			// Get or create user task
			let userTask = await UserDailyTask.findOne({
				user: req.currentUser.userId,
				task: taskId,
				assignedDate: { $gte: today },
			});

			if (!userTask) {
				userTask = new UserDailyTask({
					user: req.currentUser.userId,
					task: taskId,
					assignedDate: today,
				});
			}

			// Update progress
			userTask.progress = progress;

			// Check if task is now completed
			if (progress >= task.requirement && !userTask.completed) {
				userTask.completed = true;
				userTask.completedAt = new Date();
			}

			await userTask.save();

			return res.status(StatusCodes.OK).json({
				message: 'Task progress updated',
				task: {
					id: userTask._id,
					taskId: task._id,
					name: task.name,
					description: task.description,
					type: task.type,
					requirement: task.requirement,
					points: task.points,
					progress: userTask.progress,
					completed: userTask.completed,
					completedAt: userTask.completedAt,
				},
			});
		} catch (error) {
			console.error('Error updating task progress:', error);
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: 'Failed to update task progress',
			});
		}
	}
}

export default DailyTaskController;
