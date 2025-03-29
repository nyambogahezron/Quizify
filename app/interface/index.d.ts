interface RootStackParamList {
	[index: string]: undefined | object;
	MainTabs: undefined;
	Quiz: { category: string };
	Result: { score: number; totalQuestions: number; coins: number };
	Profile: undefined;
	Bookmark: undefined;
	Settings: undefined;
	Leaderboard: undefined;
	CreateAccount: undefined;
	WordGame: undefined;
	OnBoard: undefined;
	QuizList: { categories: Category[] };
	Login: undefined;
	Register: undefined;
	ResetPassword: undefined;
	ForgotPassword: undefined;
	DailyTasks: undefined;
}

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}

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
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	logout: () => Promise<void>;
	initialize: () => Promise<void>;
	updatePoints: (points: number) => void;
}

interface QuizState {
	currentQuiz: any | null;
	quizHistory: any[];
	setCurrentQuiz: (quiz: any | null) => void;
	addToHistory: (quiz: any) => void;
}

interface Quiz {
	_id: string;
	title: string;
	category: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizRanking {
	quiz: Quiz;
	score: number;
	timeSpent: number;
	rank: number;
	totalParticipants: number;
	percentile: number;
}

interface GlobalRanking {
	totalScore: number;
	quizzesCompleted: number;
	averageScore: number;
	rank: number;
	totalParticipants: number;
	percentile: number;
}

interface UserRankings {
	global: GlobalRanking;
	quizzes: QuizRanking[];
}

interface AchievementState {
	achievements: any[];
	setAchievements: (achievements: any[]) => void;
	addAchievement: (achievement: any) => void;
	userRankings: UserRankings | null;
	setUserRankings: (userRankings: UserRankings) => void;
	initialize: () => Promise<void>;
}

interface DailyTaskState {
	tasks: any[];
	setTasks: (tasks: any[]) => void;
	updateTask: (taskId: string, updates: any) => void;
}

export type {
	RootStackParamList,
	Category,
	User,
	AuthState,
	QuizState,
	AchievementState,
	DailyTaskState,
	UserRankings,
	GlobalRanking,
	QuizRanking,
	Quiz,
};
