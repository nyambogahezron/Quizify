import express, { Router } from 'express';
import UserController from '../controllers/User.controller';
import Authenticate from '../middleware/Authenticate';

const router: Router = express.Router();

router.get('/:id', UserController.getSingleUser);

router.get('/me', Authenticate, UserController.getCurrentUser);

router.patch('/update', Authenticate, UserController.updateUser);

router.patch('/update-password', Authenticate, UserController.updatePassword);

export default router;
