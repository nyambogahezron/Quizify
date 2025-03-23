import express, {
	Router,
	Request,
	Response,
	NextFunction,
	RequestHandler,
} from 'express';
import QuizController from '../controllers/Quiz.controller';
import authenticateUser from '../middleware/Authenticate';

const router: Router = express.Router();

// Helper to make controller methods work with Express
const asyncHandler =
	(fn: Function): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

// Public routes
router.get('/', asyncHandler(QuizController.getAllQuizzes));
router.get('/categories', asyncHandler(QuizController.getCategories));
router.get('/:id', asyncHandler(QuizController.getQuiz));

// Protected routes
router.post('/', authenticateUser, asyncHandler(QuizController.createQuiz));
router.put('/:id', authenticateUser, asyncHandler(QuizController.updateQuiz));
router.delete(
	'/:id',
	authenticateUser,
	asyncHandler(QuizController.deleteQuiz)
);
router.get(
	'/user/created',
	authenticateUser,
	asyncHandler(QuizController.getUserCreatedQuizzes)
);
router.get(
	'/user/attempts',
	authenticateUser,
	asyncHandler(QuizController.getUserQuizAttempts)
);
router.get(
	'/attempts/:quizId',
	authenticateUser,
	asyncHandler(QuizController.getQuizAttempts)
);

export default router;
