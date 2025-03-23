import mongoose, { Schema, Document } from 'mongoose';

interface ILeaderboardEntry extends Document {
	user: mongoose.Schema.Types.ObjectId;
	quiz: mongoose.Schema.Types.ObjectId;
	score: number;
	timeSpent: number;
	completedAt: Date;
}

// Global leaderboard (across all quizzes)
interface IGlobalLeaderboard extends Document {
	user: mongoose.Schema.Types.ObjectId;
	totalScore: number;
	quizzesCompleted: number;
	averageScore: number;
	lastUpdated: Date;
}

const LeaderboardSchema = new Schema<ILeaderboardEntry>({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User reference is required'],
	},
	quiz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz',
		required: [true, 'Quiz reference is required'],
	},
	score: {
		type: Number,
		required: [true, 'Score is required'],
	},
	timeSpent: {
		type: Number,
		required: [true, 'Time spent is required'],
	},
	completedAt: {
		type: Date,
		default: Date.now,
	},
});

// Create a compound index to ensure each user has only one entry per quiz in the leaderboard
LeaderboardSchema.index({ user: 1, quiz: 1 }, { unique: true });

const GlobalLeaderboardSchema = new Schema<IGlobalLeaderboard>({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User reference is required'],
		unique: true,
	},
	totalScore: {
		type: Number,
		default: 0,
	},
	quizzesCompleted: {
		type: Number,
		default: 0,
	},
	averageScore: {
		type: Number,
		default: 0,
	},
	lastUpdated: {
		type: Date,
		default: Date.now,
	},
});

export const Leaderboard = mongoose.model<ILeaderboardEntry>(
	'Leaderboard',
	LeaderboardSchema
);
export const GlobalLeaderboard = mongoose.model<IGlobalLeaderboard>(
	'GlobalLeaderboard',
	GlobalLeaderboardSchema
);
