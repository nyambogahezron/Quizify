import mongoose, { Schema, Document } from 'mongoose';

interface IQuizQuestion extends Document {
	question: string;
	options: string[];
	correctAnswer: string;
	explanation?: string;
	points: number;
}

interface IQuiz extends Document {
	title: string;
	description: string;
	category: string;
	icon: string;
	difficulty: 'easy' | 'medium' | 'hard';
	timeLimit: number; // in seconds
	questions: IQuizQuestion[];
	createdBy: mongoose.Schema.Types.ObjectId;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
	question: {
		type: String,
		required: [true, 'Question is required'],
	},
	options: {
		type: [String],
		required: [true, 'Options are required'],
		validate: {
			validator: function (v: string[]) {
				return v.length >= 2; // At least 2 options required
			},
			message: 'At least 2 options are required',
		},
	},
	correctAnswer: {
		type: String,
		required: [true, 'Correct answer is required'],
	},
	explanation: {
		type: String,
	},
	points: {
		type: Number,
		default: 1,
	},
});

const QuizSchema = new Schema<IQuiz>(
	{
		title: {
			type: String,
			required: [true, 'Quiz title is required'],
			trim: true,
			maxlength: [100, 'Title cannot be more than 100 characters'],
		},
		description: {
			type: String,
			required: [true, 'Quiz description is required'],
			maxlength: [500, 'Description cannot be more than 500 characters'],
		},
		category: {
			type: String,
			required: [true, 'Category is required'],
			trim: true,
		},
		icon: {
			type: String,
			default: '📚',
		},
		difficulty: {
			type: String,
			enum: {
				values: ['easy', 'medium', 'hard'],
				message: '{VALUE} is not supported',
			},
			default: 'medium',
		},
		timeLimit: {
			type: Number,
			default: 60, // Default 60 seconds per question
		},
		questions: [QuizQuestionSchema],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
