import { Request, Response } from 'express';
import { UserProgress } from '../models/UserProgress';
import { UnauthorizedError } from '../errors';
import AsyncHandler from '../middleware/AsyncHandler';

export const getUserProgress = AsyncHandler( async (req: Request, res: Response) => {
 

    const userId = req.user?.userId;
if (!userId) {
    throw new UnauthorizedError('Unauthorized access');
}

    const progress = await UserProgress.find({ userId })
      .sort({ level: 1 });
    res.json(progress);
 
})  ;

export const updateUserProgress = AsyncHandler( async (req: Request, res: Response) => {
 
    const userId = req.user?.userId;
    if (!userId) {
    throw new UnauthorizedError('Unauthorized access');
}
    const { level, score, wordsFound, timeSpent } = req.body;

    // Calculate stars based on performance
    const stars = calculateStars(score, timeSpent);

    const progress = await UserProgress.findOneAndUpdate(
      { userId, level },
      {
        score,
        wordsFound,
        timeSpent,
        stars,
        status: 'completed',
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Unlock next level if exists
    const nextLevel = level + 1;
    await UserProgress.findOneAndUpdate(
      { userId, level: nextLevel },
      { status: 'unlocked' },
      { upsert: true }
    );

    res.json(progress);
 
});

const calculateStars = (score: number, timeSpent: number): number => {
  // Example star calculation logic
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}; 