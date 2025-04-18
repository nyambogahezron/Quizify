import { Request, Response } from 'express';
import AsyncHandler from '../middleware/AsyncHandler';
import User from '../models/User.model';
import { BadRequestError, UnauthorizedError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { processImage } from '../middleware/upload.middleware';

class UserController {
	/**
	 * @description Get Current User
	 * @route GET /api/v1/auth/me
	 * @access Private
	 */
	static getCurrentUser = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const user = await User.findById(req.user?.userId).select('-password');
		res.json({ success: true, data: user });
	});

	/**
	 * @description Update User
	 * @route PATCH /api/v1/auth/update
	 * @access Private
	 */
	static updateUser = AsyncHandler(async (req: Request, res: Response) => {
		const { name, email } = req.body;
		const userId = req.user?.userId;

		const user = await User.findById(userId);

		if (!user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		user.name = name || user.name;
		user.email = email || user.email;

		await user.save();

		res.json({ success: true, data: user });
	});

	/**
	 * @description Update Password
	 * @route PATCH /api/v1/auth/update-password
	 * @access Private
	 */
	static updatePassword = AsyncHandler(async (req: Request, res: Response) => {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user?.userId;

		if (!currentPassword || !newPassword) {
			throw new BadRequestError('Invalid credentials');
		}

		const user = await User.findById(userId).select('+password');

		if (!user) {
			throw new UnauthorizedError('Unauthorized access');
		}

		const isMatch = await user.comparePassword(currentPassword);

		if (!isMatch) {
			throw new BadRequestError('Invalid credentials');
		}

		user.password = newPassword;

		await user.save();

		res.json({ success: true, message: 'Password updated successfully' });
	});

	/**
	 * @description Get Single User
	 * @route GET /api/v1/auth/user/:id
	 * @access Public
	 */
	static getSingleUser = AsyncHandler(async (req: Request, res: Response) => {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			throw new BadRequestError('User not found');
		}

		res.json({ success: true, data: user });
	});

	static uploadAvatar = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new UnauthorizedError('Unauthorized');
		}

		if (!req.file) {
			throw new BadRequestError('Please upload an image');
		}

		// Process the image
		const processedImagePath = await processImage(req.file.path);

		// Get the relative path for the database
		const relativePath = processedImagePath.replace('uploads/', '');

		const user = await User.findByIdAndUpdate(
			req.user.userId,
			{ avatar: relativePath },
			{ new: true }
		);

		res.status(StatusCodes.OK).json({
			success: true,
			data: {
				avatar: user?.avatar,
			},
		});
	});
}

export default UserController;
