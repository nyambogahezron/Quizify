import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

type IUserLevel = InferSchemaType<typeof UserLevelSchema>;

interface IUserLevelModel extends Model<IUserLevel> {
	calculateLevel(quizzesAnswered: number): number;
}

const UserLevelSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User reference is required'],
			unique: true,
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
	},
	{ timestamps: true }
);

// Static method to calculate level based on quizzes answered
UserLevelSchema.statics.calculateLevel = function (
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

export default mongoose.model<IUserLevel, IUserLevelModel>(
	'UserLevel',
	UserLevelSchema
);
