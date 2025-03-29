interface RootStackParamList {
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

export type { RootStackParamList, Category };
