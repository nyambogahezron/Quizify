import { Router } from 'express';
import UserController from '../controllers/User.controller';
import authenticate from '../middleware/Authenticate';

const router = Router();

// User Profile Routes
router.get('/me', authenticate, UserController.getCurrentUser);
router.patch('/update', authenticate, UserController.updateUser);
router.patch('/update-password', authenticate, UserController.updatePassword);
router.get('/:id', UserController.getSingleUser);



export default router;
