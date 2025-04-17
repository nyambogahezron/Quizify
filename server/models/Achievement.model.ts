import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

type IAchievement = InferSchemaType<typeof AchievementSchema>;
type IUserAchievement = InferSchemaType<typeof UserAchievementSchema>;

interface IUserAchievementModel extends Model<IUserAchievement> {
	calculateLevel(quizzesAnswered: number): number;
}

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
					'level_up',
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
	level: {
		type: Number,
		default: 1,
		min: 1,
	},
	totalQuizzesAnswered: {
		type: Number,
		default: 0,
	},
	lastLevelUp: {
		type: Date,
		default: null,
	},
	unlockedAt: {
		type: Date,
		default: Date.now,
	},
});

// Ensure each user can unlock an achievement only once
UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

UserAchievementSchema.statics.calculateLevel = function (
	quizzesAnswered: number
): number {
	if (quizzesAnswered <= 5) return 1;
	if (quizzesAnswered <= 12) return 2;
	if (quizzesAnswered <= 20) return 3;
	if (quizzesAnswered <= 30) return 4;
	if (quizzesAnswered <= 45) return 5;
	if (quizzesAnswered <= 60) return 6;
	if (quizzesAnswered <= 80) return 7;
	if (quizzesAnswered <= 100) return 8;
	if (quizzesAnswered <= 125) return 9;
	return 10;
};

export const Achievement = mongoose.model<IAchievement>(
	'Achievement',
	AchievementSchema
);
export const UserAchievement = mongoose.model<
	IUserAchievement,
	IUserAchievementModel
>('UserAchievement', UserAchievementSchema);
