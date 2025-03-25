import express, { Router } from 'express';
import DailyTaskController from '../controllers/DailyTask.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Protected routes
router.get('/', authenticateUser, DailyTaskController.getDailyTasks);
router.put(
	'/:taskId/progress',
	authenticateUser,
	DailyTaskController.updateTaskProgress
);

export default router;
