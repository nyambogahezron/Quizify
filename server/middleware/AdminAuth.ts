import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.model';

/**
 * Middleware to check if the user is an admin
 * This should be used after the regular authentication middleware
 */
const requireAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Check if user is authenticated first
		if (!req.currentUser?.userId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'Authentication required',
			});
			return;
		}

		// Find the user and check if they are an admin
		const user = await User.findById(req.currentUser.userId);

		if (!user) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: 'User not found',
			});
			return;
		}

		if (!user.isAdmin) {
			res.status(StatusCodes.FORBIDDEN).json({
				message: 'Admin access required',
			});
			return;
		}

		// User is an admin, proceed to the next middleware/route handler
		next();
		return;
	} catch (error) {
		console.error('Admin authentication error:', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: 'Admin authentication failed',
		});
		return;
	}
};

export default requireAdmin;
