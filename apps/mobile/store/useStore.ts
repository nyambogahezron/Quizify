import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '@/lib/socket';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/screen';
import { queryClient } from '@/lib/queryClient';
import {
	AuthState,
	QuizState,
	AchievementState,
	DailyTaskState,
} from '@/interface/index.d';

const USER_DATA_KEY = 'user_data';

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	setUser: (user) => set({ user, isAuthenticated: !!user }),
	setToken: (token) => set({ token }),
	updatePoints: (points) =>
		set((state) => ({
			user: state.user
				? { ...state.user, points: (state.user.points || 0) + points }
				: null,
		})),
	updateUser: (userData) =>
		set((state) => ({
			user: state.user ? { ...state.user, ...userData } : null,
		})),
	logout: async () => {
		await AsyncStorage.removeItem(USER_DATA_KEY);
		await AsyncStorage.removeItem('token');
		set({ user: null, token: null, isAuthenticated: false });
		queryClient.invalidateQueries({ queryKey: ['user'] });
		socketService.disconnect();
		queryClient.clear();

		const navigation =
			useNavigation<NativeStackNavigationProp<RootStackParamList>>();
		navigation.navigate('Login');
	},

	setIsAuthenticated: (isAuthenticated: boolean) =>
		set({ isAuthenticated: isAuthenticated }),
	initialize: async () => {
		try {
			const userData = await AsyncStorage.getItem(USER_DATA_KEY);
			if (userData) {
				set({ user: JSON.parse(userData), isAuthenticated: true });
			}
		} catch (e) {
			console.error('Failed to load user from AsyncStorage:', e);
		}
	},
}));

export const useQuizStore = create<QuizState>((set) => ({
	currentQuiz: null,
	quizHistory: [],
	setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
	addToHistory: (quiz) =>
		set((state) => ({
			quizHistory: [quiz, ...state.quizHistory],
		})),
}));

export const useAchievementStore = create<AchievementState>((set) => ({
	achievements: [],
	userRankings: null,
	setAchievements: (achievements) => set({ achievements }),
	addAchievement: (achievement) =>
		set((state) => ({
			achievements: [...state.achievements, achievement],
		})),
	setUserRankings: (userRankings) => set({ userRankings }),
	initialize: async () => {},
}));

export const useDailyTaskStore = create<DailyTaskState>((set) => ({
	tasks: [],
	setTasks: (tasks) => set({ tasks }),
	updateTask: (taskId, updates) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId ? { ...task, ...updates } : task
			),
		})),
}));
