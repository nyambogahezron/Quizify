import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/fetchApi';

// Auth services
export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: { email: string; password: string }) => {
			const response = await api.post('/auth/login', credentials);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['user'], data.user);
		},
	});
};

export const useRegister = () => {
	return useMutation({
		mutationFn: async (userData: {
			username: string;
			email: string;
			password: string;
		}) => {
			const response = await api.post('/auth/register', userData);
			return response.data;
		},
	});
};

// Quiz services
export const useQuizzes = () => {
	return useQuery({
		queryKey: ['quizzes'],
		queryFn: async () => {
			const response = await api.get('/quizzes');
			return response.data.quizzes;
		},
	});
};

export const useQuizById = (quizId: string) => {
	return useQuery({
		queryKey: ['quiz', quizId],
		queryFn: async () => {
			const response = await api.get(`/quizzes/${quizId}`);
			return response.data;
		},
	});
};

export const useQuizByCategory = (category: string) => {
	return useQuery({
		queryKey: ['quiz', category],
		queryFn: async () => {
			const response = await api.get(`/quizzes/category/${category}`);
			return response.data;
		},
	});
};

export const useSubmitQuiz = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (quizData: {
			quizId: string;
			answers: Record<string, string>;
		}) => {
			const response = await api.post('/quizzes/submit', quizData);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['quizzes'] });
			queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
		},
	});
};

// Leaderboard services
export const useLeaderboard = () => {
	return useQuery({
		queryKey: ['leaderboard'],
		queryFn: async () => {
			const response = await api.get('/leaderboard');
			return response.data;
		},
	});
};

// Achievement services
export const useAchievements = () => {
	return useQuery({
		queryKey: ['achievements'],
		queryFn: async () => {
			const response = await api.get('/achievements');
			return response.data;
		},
	});
};

//get user rankings
export const useUserRankings = () => {
	return useQuery({
		queryKey: ['user-rankings'],
		queryFn: async () => {
			const response = await api.get('/leaderboard/user');
			return response.data;
		},
	});
};

// Daily task services
export const useDailyTasks = () => {
	return useQuery({
		queryKey: ['daily-tasks'],
		queryFn: async () => {
			const response = await api.get('/daily-tasks');
			return response.data.tasks;
		},
	});
};

// Daily task services
export const useCompleteDailyTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (taskId: string) => {
			const response = await api.post(`/daily-tasks/${taskId}/complete`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
		},
	});
};

// Category services
export const useCategories = () => {
	return useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			const response = await api.get('/quizzes/categories');
			return response.data.categories;
		},
	});
};
