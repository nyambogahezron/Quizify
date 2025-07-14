import express, { Router } from 'express';
import QuizController from '../controllers/Quiz.controller';
import authenticateUser from '../middleware/Authenticate';
import requireAdmin from '../middleware/AdminAuth';
import AdminController from '../controllers/Admin.controller';

const router: Router = express.Router();

// Admin dashboard summary
router.get(
	'/dashboard',
	authenticateUser,
	requireAdmin,
	AdminController.dashboardSummary
);

// Get all unique quiz categories
router.get(
	'/quizzes/categories',
	authenticateUser,
	requireAdmin,
	QuizController.getCategories
);

// Admin routes for quiz management
router.get(
	'/quizzes',
	authenticateUser,
	requireAdmin,
	AdminController.getAllQuizzes
);

// Get single quiz (admin version with all data)
router.get(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	QuizController.getQuiz
);

// Create new quiz
router.post(
	'/quizzes',
	authenticateUser,
	requireAdmin,
	QuizController.createQuiz
);

// Update quiz
router.put(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	QuizController.updateQuiz
);

// Delete quiz
router.delete(
	'/quizzes/:id',
	authenticateUser,
	requireAdmin,
	QuizController.deleteQuiz
);

// Get all users (admin only)
router.get(
	'/users',
	authenticateUser,
	requireAdmin,
	AdminController.getAllUsers
);

export default router;
