import express, {
	Router,
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from 'express';
import LeaderboardController from '../controllers/Leaderboard.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Helper to make controller methods work with Express
const asyncHandler =
	(fn: Function): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// Public routes
router.get('/global', asyncHandler(LeaderboardController.getGlobalLeaderboard));
router.get(
	'/quiz/:quizId',
	asyncHandler(LeaderboardController.getQuizLeaderboard)
);

// Protected routes
router.get(
	'/user',
	authenticateUser,
	asyncHandler(LeaderboardController.getUserRankings)
);

export default router;
