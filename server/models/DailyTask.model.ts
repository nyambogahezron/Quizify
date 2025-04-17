import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyTask extends Document {
	title: string;
	description: string;
	type: 'quiz' | 'time' | 'streak';
	criteria: {
		type: 'correct_answers' | 'time_spent' | 'streak';
		target: number;
		timeLimit?: number; // in minutes
	};
	reward: {
		points: number;
		experience: number;
	};
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	requirement: number;
	points: number;
	questions: mongoose.Types.ObjectId[];
}

export interface IUserDailyTask extends Document {
	user: mongoose.Types.ObjectId;
	task: mongoose.Types.ObjectId;
	progress: number;
	completed: boolean;
	completedAt?: Date;
	assignedDate: Date;
}

const DailyTaskSchema = new Schema<IDailyTask>({
	title: { type: String, required: true },
	description: { type: String, required: true },
	type: {
		type: String,
		required: true,
		enum: ['quiz', 'time', 'streak'],
	},
	criteria: {
		type: {
			type: String,
			required: true,
			enum: ['correct_answers', 'time_spent', 'streak'],
		},
		target: { type: Number, required: true },
		timeLimit: { type: Number }, // Optional time limit in minutes
	},
	reward: {
		points: { type: Number, required: true },
		experience: { type: Number, required: true },
	},
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	name: { type: String, required: true },
	requirement: { type: Number, required: true },
	points: { type: Number, required: true },
	questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
});

const UserDailyTaskSchema = new Schema<IUserDailyTask>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	task: { type: Schema.Types.ObjectId, ref: 'DailyTask', required: true },
	progress: { type: Number, default: 0 },
	completed: { type: Boolean, default: false },
	completedAt: { type: Date },
	assignedDate: { type: Date, required: true },
});

// Add indexes for better query performance
UserDailyTaskSchema.index({ user: 1, assignedDate: 1 });
UserDailyTaskSchema.index({ user: 1, task: 1, assignedDate: 1 });

export const DailyTask = mongoose.model<IDailyTask>(
	'DailyTask',
	DailyTaskSchema
);
export const UserDailyTask = mongoose.model<IUserDailyTask>(
	'UserDailyTask',
	UserDailyTaskSchema
);
