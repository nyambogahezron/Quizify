import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Use a different property name to avoid conflict
declare global {
	namespace Express {
		interface Request {
			currentUser?: {
				userId: string;
				username?: string;
				email?: string;
				isAdmin?: boolean;
			};
		}
	}
}

export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Check for JWT in the cookies or Authorization header
	const token =
		req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Authentication invalid',
		});
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || '') as {
			userId: string;
			username?: string;
			email?: string;
		};

		// Attach the user to the request object with new property name
		req.currentUser = {
			userId: payload.userId,
			username: payload.username,
			email: payload.email,
		};

		next();
		return;
	} catch (error) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Authentication invalid',
		});
	}
};

export default authenticateUser;
