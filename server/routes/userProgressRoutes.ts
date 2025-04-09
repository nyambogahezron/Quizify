import express from 'express';
import { getUserProgress, updateUserProgress } from '../controllers/userProgressController';
import authenticate from '../middleware/Authenticate';

const router = express.Router();

router.get('/', authenticate, getUserProgress);
router.post('/update', authenticate, updateUserProgress);

export default router; 