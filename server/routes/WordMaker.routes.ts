import { Router } from 'express';
import WordMakerController from '../controllers/WordMaker.controller';
import Authenticate from '../middleware/Authenticate';
import requireAdmin from '../middleware/AdminAuth';

const router = Router();

router
	.route('/')
	.post(Authenticate, requireAdmin, WordMakerController.createWordMaker)
	.get(Authenticate, WordMakerController.getWordMakers);

router
	.route('/:id')
	.put(Authenticate, requireAdmin, WordMakerController.updateWordMaker)
	.delete(Authenticate, requireAdmin, WordMakerController.deleteWordMaker)
	.get(Authenticate, WordMakerController.getWordMaker);

router
	.route('/user/progress')
	.get(Authenticate, WordMakerController.getUserProgress)
	.post(Authenticate, WordMakerController.createUserProgress)
	.patch(Authenticate, WordMakerController.updateUserProgress);

export default router;
