import mongoose, { Schema, Document } from 'mongoose';

interface IAnswerResponse {
	questionId: mongoose.Schema.Types.ObjectId;
	selectedAnswer: string;
	isCorrect: boolean;
	timeSpent: number; // Time spent on this question in seconds
}

interface IQuizAttempt extends Document {
	quiz: mongoose.Schema.Types.ObjectId;
	user: mongoose.Schema.Types.ObjectId;
	answers: IAnswerResponse[];
	score: number;
	totalPossibleScore: number;
	timeSpent: number; // Total time spent in seconds
	completed: boolean;
	startedAt: Date;
	completedAt?: Date;
}

const AnswerResponseSchema = new Schema<IAnswerResponse>({
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

const QuizAttemptSchema = new Schema<IQuizAttempt>({
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
