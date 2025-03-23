import mongoose, { Schema, Document } from 'mongoose';

interface IDailyTask extends Document {
	name: string;
	description: string;
	type: 'complete_quiz' | 'score_points' | 'login' | 'streak';
	requirement: number;
	points: number; // Reward points for completing the task
	isActive: boolean;
}

interface IUserDailyTask extends Document {
	user: mongoose.Schema.Types.ObjectId;
	task: mongoose.Schema.Types.ObjectId;
	progress: number;
	completed: boolean;
	completedAt?: Date;
	assignedDate: Date; // The date this task was assigned to the user
}

const DailyTaskSchema = new Schema<IDailyTask>({
	name: {
		type: String,
		required: [true, 'Task name is required'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Task description is required'],
		maxlength: [200, 'Description cannot be more than 200 characters'],
	},
	type: {
		type: String,
		enum: ['complete_quiz', 'score_points', 'login', 'streak'],
		required: [true, 'Task type is required'],
	},
	requirement: {
		type: Number,
		required: [true, 'Task requirement is required'],
		min: [1, 'Requirement must be at least 1'],
	},
	points: {
		type: Number,
		required: [true, 'Reward points are required'],
		min: [1, 'Points must be at least 1'],
	},
	isActive: {
		type: Boolean,
		default: true,
	},
});

const UserDailyTaskSchema = new Schema<IUserDailyTask>({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User reference is required'],
	},
	task: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DailyTask',
		required: [true, 'Task reference is required'],
	},
	progress: {
		type: Number,
		default: 0,
	},
	completed: {
		type: Boolean,
		default: false,
	},
	completedAt: {
		type: Date,
	},
	assignedDate: {
		type: Date,
		default: Date.now,
	},
});

// Create a compound index to ensure each user has each task only once per day
UserDailyTaskSchema.index(
	{ user: 1, task: 1, assignedDate: 1 },
	{ unique: true }
);

export const DailyTask = mongoose.model<IDailyTask>(
	'DailyTask',
	DailyTaskSchema
);
export const UserDailyTask = mongoose.model<IUserDailyTask>(
	'UserDailyTask',
	UserDailyTaskSchema
);
