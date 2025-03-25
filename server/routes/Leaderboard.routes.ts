import express, { Router } from 'express';
import LeaderboardController from '../controllers/Leaderboard.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Public routes
router.get('/global', LeaderboardController.getGlobalLeaderboard);
router.get('/quiz/:quizId', LeaderboardController.getQuizLeaderboard);

// Protected routes
router.get('/user', authenticateUser, LeaderboardController.getUserRankings);

export default router;
