import express, {
	Router,
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from 'express';
import DailyTaskController from '../controllers/DailyTask.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Helper to make controller methods work with Express
const asyncHandler =
	(fn: Function): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// Protected routes
router.get(
	'/',
	authenticateUser,
	asyncHandler(DailyTaskController.getDailyTasks)
);
router.put(
	'/:taskId/progress',
	authenticateUser,
	asyncHandler(DailyTaskController.updateTaskProgress)
);

export default router;
