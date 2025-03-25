import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../App';
import { socketService } from '@/lib/socket';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/screen';

const USER_DATA_KEY = 'user_data';

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	level?: number;
	points?: number;
	createdAt?: string;
	updatedAt?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	setToken: (token: string) => void;
	logout: () => Promise<void>;
	initialize: () => Promise<void>;
}

interface QuizState {
	currentQuiz: any | null;
	quizHistory: any[];
	setCurrentQuiz: (quiz: any | null) => void;
	addToHistory: (quiz: any) => void;
}

interface AchievementState {
	achievements: any[];
	setAchievements: (achievements: any[]) => void;
	addAchievement: (achievement: any) => void;
}

interface DailyTaskState {
	tasks: any[];
	setTasks: (tasks: any[]) => void;
	updateTask: (taskId: string, updates: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	setUser: (user) => set({ user, isAuthenticated: !!user }),
	setToken: (token) => set({ token }),
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
	setAchievements: (achievements) => set({ achievements }),
	addAchievement: (achievement) =>
		set((state) => ({
			achievements: [...state.achievements, achievement],
		})),
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
