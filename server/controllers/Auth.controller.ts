import { Request, Response } from 'express';
import crypto from 'crypto';
import AsyncHandler from '../middleware/AsyncHandler';
import User from '../models/User.model';
import Token from '../models/Token.model';
import { BadRequestError, UnauthorizedError } from '../errors';
import { generateCode } from '../lib/GenerateCode';
import { StatusCodes } from 'http-status-codes';
import attachCookieToResponse from '../lib/JWT';
import CreateHash from '../lib/CreateHash';
import { UserProps } from '../types';
import SendEmail from '../lib/SendEmail';

class AuthController {
	/**
	 * @description Register User
	 * @route POST /api/v1/auth/register
	 * @access Public
	 */
	static registerUser = AsyncHandler(async (req: Request, res: Response) => {
		const { name, username, email, password } = req.body;

		if (!name || !username || !email || !password) {
			throw new BadRequestError('Please provide all fields');
		}

		const emailExists = await User.findOne({ email }).select('-password');

		if (emailExists) {
			throw new BadRequestError('Email already exists');
		}

		const verificationToken = generateCode();

		const user = await User.create({
			name,
			email,
			username,
			password,
			verificationToken,
			isFirstLogin: true,
		});

		await SendEmail({
			email: user.email,
			name: user.name,
			subject: 'Quizify - Email Verification',
			intro: 'Welcome to Quizify',
			instructions: 'Use the code below to verify your email to get started',
			buttonTxt: verificationToken,
		});

		user.set('password', undefined, { strict: false });
		res.status(StatusCodes.CREATED).json({ data: user });
	});

	/**
	 * @description Verify Email
	 * @route POST /api/v1/auth/verify-email
	 * @access Public
	 */
	static verifyEmail = AsyncHandler(async (req: Request, res: Response) => {
		const { verificationToken, email } = req.body;

		if (!verificationToken || !email) {
			throw new BadRequestError('A verification token and email are required');
		}

		const user = await User.findOne({ email, verificationToken });

		if (!user) {
			throw new BadRequestError('Invalid verification token');
		}

		if (user.isVerified) {
			throw new BadRequestError('Email already verified');
		}

		user.isVerified = true;
		user.accountStatus = 'active';
		user.verificationToken = '';

		await user.save();

		await SendEmail({
			email: user.email,
			name: user.name,
			subject: 'Quizify - Welcome',
			intro: 'Welcome to Quizify',
			instructions: 'Your email has been verified, enjoy the app',
			buttonLink: 'https://quizify.com',
			buttonTxt: 'Get Started',
		});

		res.status(StatusCodes.OK).json({ msg: 'Email verified successfully' });
	});

	/**
	 * @description Login User
	 * @route POST /api/v1/auth/login
	 * @access Public
	 */
	static loginUser = AsyncHandler(async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new BadRequestError('Please provide an email and password');
		}

		const user = await User.findOne({ email });

		if (!user) {
			throw new UnauthorizedError('Invalid credentials');
		}

		if (!user.isVerified) {
			throw new UnauthorizedError('Email not verified');
		}

		if (user.accountStatus !== 'active') {
			throw new UnauthorizedError(
				'Your Account is suspended due to too many login attempts, click forgot password to reset your password'
			);
		}

		const isPasswordCorrect = await user.comparePassword(password);

		if (!isPasswordCorrect) {
			user.loginAttempts += 1;
			await user.save();

			if (user.loginAttempts >= 4) {
				const verificationToken = generateCode();
				const device = req.headers['user-agent'] || 'unknown device';
				const time = new Date().toLocaleString();

				const resetToken = generateCode();
				const tenMinutes = 10 * 60 * 1000;
				const passwordResetExpires = Date.now() + tenMinutes;

				user.passwordToken = CreateHash(resetToken);
				user.passwordTokenExpires = new Date(passwordResetExpires);

				await user.save();

				await SendEmail({
					email: user.email,
					name: user.name,
					subject: 'Quizify - Login Attempts',
					intro: `Your account has been suspended due to multiple login attempts on ${device} at ${time}`,
					instructions: 'Use the code below to reset your password',
					buttonTxt: verificationToken,
				});

				throw new UnauthorizedError(
					'Account locked due to too many failed login attempts. Please contact support.'
				);
			}
			throw new UnauthorizedError('Username or password is incorrect');
		}

		const tokenObj: UserProps = {
			userId: user._id,
			name: user.name,
			email: user.email,
			username: user.username,
			isAdmin: user.isAdmin,
		};

		let refreshToken = '';

		const existingRefreshToken = await Token.findOne({ user: user._id });

		if (existingRefreshToken) {
			const { isValid } = existingRefreshToken;

			if (!isValid) {
				throw new UnauthorizedError('Invalid refresh token');
			}

			refreshToken = existingRefreshToken.token;
			attachCookieToResponse({ res, user: tokenObj, token: refreshToken });
			res.status(StatusCodes.OK).json({ user: tokenObj });
			return;
		}

		refreshToken = crypto.randomBytes(40).toString('hex');

		const userToken = {
			user: user._id,
			token: refreshToken,
			type: 'emailLogin',
			ip: req.ip,
			userAgent: req.headers['user-agent'],
			isValid: true,
		};

		await Token.create(userToken);

		attachCookieToResponse({ res, user: tokenObj, token: refreshToken });

		if (user.isFirstLogin) {
			user.points += 100;
			user.isFirstLogin = false;
			await user.save();
		}

		res.status(StatusCodes.OK).json({ user: tokenObj, token: refreshToken });
	});

	/**
	 * @description Logout User
	 * @route DELETE /api/v1/auth/logout
	 * @access Private
	 */
	static logoutUser = AsyncHandler(async (req: Request, res: Response) => {
		const { userId } = req.body;
		await Token.findOneAndDelete({ user: userId });

		res.cookie('accessToken', 'logout', {
			httpOnly: true,
			expires: new Date(Date.now()),
		});
		res.cookie('refreshToken', 'logout', {
			httpOnly: true,
			expires: new Date(Date.now()),
		});
		res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
	});
}

export default AuthController;
