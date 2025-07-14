import express, { Router } from 'express';
import AuthController from '../controllers/Auth.controller';

const router: Router = express.Router();

router.post('/register', AuthController.registerUser);

router.post('/login', AuthController.loginUser);

router.delete('/logout', AuthController.logoutUser);

router.post('/verify-email', AuthController.verifyEmail);

export default router;
