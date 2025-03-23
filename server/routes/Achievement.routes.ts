import express, {
	Router,
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from 'express';
import AchievementController from '../controllers/Achievement.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Helper to make controller methods work with Express
const asyncHandler =
	(fn: Function): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// Public routes
router.get(
	'/user',
	authenticateUser,
	asyncHandler(AchievementController.getUserAchievements)
);

export default router;
