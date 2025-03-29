import mongoose, { Schema, InferSchemaType } from 'mongoose';

type ILeaderboardEntry = InferSchemaType<typeof LeaderboardSchema>;

type IGlobalLeaderboard = InferSchemaType<typeof GlobalLeaderboardSchema>;

const LeaderboardSchema = new Schema({
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
	position: {
		type: Number,
		default: 0,
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

LeaderboardSchema.set('autoIndex', false); // Disable auto indexing

const GlobalLeaderboardSchema = new Schema({
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
	position: {
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

GlobalLeaderboardSchema.set('autoIndex', false); // Disable auto indexing

export const Leaderboard = mongoose.model<ILeaderboardEntry>(
	'Leaderboard',
	LeaderboardSchema
);
export const GlobalLeaderboard = mongoose.model<IGlobalLeaderboard>(
	'GlobalLeaderboard',
	GlobalLeaderboardSchema
);
