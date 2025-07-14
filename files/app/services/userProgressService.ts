import { api } from '../lib/fetchApi';

interface WordFound {
  word: string;
  foundAt: Date;
}

interface UserProgress {
  level: number;
  score: number;
  wordsFound: WordFound[];
  timeSpent: number;
  stars: number;
  status: 'locked' | 'unlocked' | 'completed';
  completedAt: Date | null;
}

export const getUserProgress = async (): Promise<UserProgress[]> => {
  const response = await api.get('/user-progress');
  return response.data;
};

export const updateUserProgress = async (
  level: number,
  score: number,
  wordsFound: WordFound[],
  timeSpent: number
): Promise<UserProgress> => {
  const response = await api.post('/user-progress/update', {
    level,
    score,
    wordsFound,
    timeSpent,
  });
  return response.data;
}; 