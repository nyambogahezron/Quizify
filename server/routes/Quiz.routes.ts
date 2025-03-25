import express, { Router } from 'express';
import QuizController from '../controllers/Quiz.controller';
import authenticateUser from '../middleware/Authenticate';
import requireAdmin from '../middleware/AdminAuth';
const router: Router = express.Router();

// Public routes
router.get('/', QuizController.getAllQuizzes);
router.get('/categories', QuizController.getCategories);
router.get('/:id', QuizController.getQuiz);
router.get('/category/:category', QuizController.getQuizByCategory);
router.get('/difficulty/:difficulty', QuizController.getQuizByDifficulty);

// Protected routes

router.get(
	'/user/attempts',
	authenticateUser,
	QuizController.getUserQuizAttempts
);
router.get(
	'/attempts/:quizId',
	authenticateUser,
	QuizController.getQuizAttempts
);

// Admin routes
router
	.route('/')
	.post(authenticateUser, requireAdmin, QuizController.createQuiz);

router
	.route('/:id')
	.patch(authenticateUser, requireAdmin, QuizController.updateQuiz)
	.delete(authenticateUser, requireAdmin, QuizController.deleteQuiz);

export default router;
