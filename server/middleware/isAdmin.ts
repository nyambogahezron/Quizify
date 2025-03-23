import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	// Check if user is authenticated and has isAdmin flag
	if (req.currentUser && req.currentUser.isAdmin) {
		next();
		return;
	} else {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Access denied. Admin privileges required.',
		});
	}
};
