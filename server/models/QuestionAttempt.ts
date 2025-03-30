import mongoose from 'mongoose';

const questionAttemptSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	questionId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Question',
		required: true,
	},
	quizId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz',
		required: true,
	},
	attemptedAt: {
		type: Date,
		default: Date.now,
	},
});

// Compound index to efficiently query user's attempts
questionAttemptSchema.index({ userId: 1, questionId: 1 });

export const QuestionAttempt = mongoose.model(
	'QuestionAttempt',
	questionAttemptSchema
);
