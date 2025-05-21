import mongoose, { Schema, InferSchemaType } from 'mongoose';

type IQuizAttempt = InferSchemaType<typeof QuizAttemptSchema>;

const AnswerResponseSchema = new Schema({
	questionId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	selectedAnswer: {
		type: String,
		required: true,
	},
	isCorrect: {
		type: Boolean,
		required: true,
	},
	timeSpent: {
		type: Number,
		default: 0,
	},
});

const QuizAttemptSchema = new Schema({
	quiz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Quiz',
		required: [true, 'Quiz reference is required'],
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User reference is required'],
	},
	answers: [AnswerResponseSchema],
	score: {
		type: Number,
		default: 0,
	},
	totalPossibleScore: {
		type: Number,
		required: true,
	},
	timeSpent: {
		type: Number,
		default: 0,
	},
	completed: {
		type: Boolean,
		default: false,
	},
	startedAt: {
		type: Date,
		default: Date.now,
	},
	completedAt: {
		type: Date,
	},
});

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
