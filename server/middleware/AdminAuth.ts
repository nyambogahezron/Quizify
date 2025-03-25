import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';
import AsyncHandler from './AsyncHandler';
/**
 * Middleware to check if the user is an admin
 * This should be used after the regular authentication middleware
 */
const requireAdmin = AsyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Check if user is authenticated first
		const user = req.user;

		if (!user) {
			throw new UnauthorizedError('Authentication required');
		}

		if (!user.isAdmin) {
			throw new ForbiddenError('Admin access required');
		}

		// User is an admin, proceed to the next middleware/route handler
		next();
	}
);

export default requireAdmin;
