import express, { Router } from 'express';
import AchievementController from '../controllers/Achievement.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Public routes
router.get('/', AchievementController.getAllAchievements);

router.get(
	'/user',
	authenticateUser,
	AchievementController.getUserAchievements
);

export default router;
