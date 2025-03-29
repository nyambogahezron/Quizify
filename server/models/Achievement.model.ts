import mongoose, { Schema, InferSchemaType } from 'mongoose';

type IAchievement = InferSchemaType<typeof AchievementSchema>;
type IUserAchievement = InferSchemaType<typeof UserAchievementSchema>;

const AchievementSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Achievement name is required'],
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			required: [true, 'Achievement description is required'],
			maxlength: [200, 'Description cannot be more than 200 characters'],
		},
		criteria: {
			type: {
				type: String,
				enum: [
					'quizzes_completed',
					'perfect_scores',
					'streak',
					'specific_quiz',
					'total_points',
				],
				required: [true, 'Criteria type is required'],
			},
			value: {
				type: Number,
				required: [true, 'Criteria value is required'],
			},
			quizId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Quiz',
				// Only required for specific_quiz type
			},
		},
		badge: {
			type: String,
			required: [true, 'Badge URL or icon name is required'],
		},
	},
	{ timestamps: true }
);

const UserAchievementSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User reference is required'],
	},
	achievement: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Achievement',
		required: [true, 'Achievement reference is required'],
	},
	unlockedAt: {
		type: Date,
		default: Date.now,
	},
});

// Ensure each user can unlock an achievement only once
UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievement>(
	'Achievement',
	AchievementSchema
);
export const UserAchievement = mongoose.model<IUserAchievement>(
	'UserAchievement',
	UserAchievementSchema
);
