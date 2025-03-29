export interface RootStackParamList {
	[index: string]: undefined | object;
	Home: undefined;
	Profile: undefined;
	Quiz: { category: string };
	QuizList: { categories: any[] };
	WordGame: undefined;
	Leaderboard: undefined;
	DailyTasks: undefined;
}
