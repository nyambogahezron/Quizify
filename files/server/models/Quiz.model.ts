import mongoose, { Schema, InferSchemaType } from 'mongoose';

type IQuiz = InferSchemaType<typeof QuizSchema>;

const QuizQuestionSchema = new Schema({
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

const QuizSchema = new Schema(
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
		questions: {
			type: [QuizQuestionSchema],
			required: [true, 'At least one question is required'],
			validate: {
				validator: function (v: any[]) {
					return v.length > 0; // At least one question required
				},
				message: 'At least one question is required',
			},
		},
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
