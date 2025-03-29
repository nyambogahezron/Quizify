import mongoose, { InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';
import { EmailValidator } from '../lib/validator';
import { BadRequestError } from '../errors';

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			minlength: [3, 'Name must be at least 3 characters long'],
			maxlength: [50, 'Name must be at most 50 characters long'],
		},
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
		},
		avatar: {
			type: String,
			default: 'default.jpg',
		},
		bio: {
			type: String,
			maxlength: [160, 'Bio must be at most 160 characters long'],
		},
		level: {
			type: Number,
			default: 1,
			min: [1, 'Level must be at least 1'],
			max: [100, 'Level must be at most 100'],
		},

		points: {
			type: Number,
			default: 0,
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [8, 'Password must be at least 8 characters long'],
			select: false,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		verificationToken: { type: String },
		isVerified: { type: Boolean, default: false },
		passwordResetToken: { type: String },
		passwordToken: { type: String },
		passwordTokenExpires: { type: Date },
		accountStatus: {
			type: String,
			enum: ['active', 'inactive', 'suspended'],
			default: 'inactive',
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},
		isFirstLogin: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * @type User types
 * @description extracted from the schema
 */
type IUser = InferSchemaType<typeof UserSchema>;

/**
 * @type User methods
 */
interface IUserMethods {
	comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * @description Validate email
 */
UserSchema.path('email').validate(async (email: string) => {
	EmailValidator(email);
}, 'Invalid email');

/**
 *
 * @param enteredPassword
 * @returns  boolean
 * @description Compare password
 */
UserSchema.methods.comparePassword = async function (enteredPassword: any) {
	const user = await mongoose
		.model('User')
		.findById(this._id)
		.select('+password');
	const password = user?.password;
	if (!password) {
		return false;
	}
	const isMatch = await bcrypt.compare(enteredPassword, password);

	return isMatch;
};

/**
 * @description Hash password before saving
 */
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const admin = await mongoose.model('User').findOne({ isAdmin: true });
	if (admin) {
		throw new BadRequestError('Admin already created');
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<IUser & IUserMethods>('User', UserSchema);

export default User;
