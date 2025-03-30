import QuizScreen from './QuizScreen';
import ResultScreen from './ResultScreen';
import ProfileScreen from './(tabs)/ProfileScreen';
import SettingsScreen from './(tabs)/SettingsScreen';
import LeaderboardScreen from './(tabs)/LeaderboardScreen';
import WordMakerScreen from './WordMakerGameScreen';
import BookmarksScreen from './BookmarksScreen';
import OnboardingScreen from './OnBoardScreen';
import HomeScreen from './(tabs)/HomeScreen';
import QuizList from './QuizList';
import LoginScreen from './(auth)/Login';
import RegisterScreen from './(auth)/Register';
import ResetPasswordScreen from './(auth)/ResetPassword';
import ForgotPasswordScreen from './(auth)/ForgotPassword';
import DailyTasksScreen from './DailyTasks';
import ReviewScreen from './ReviewScreen';

const SCREENS = {
	HomeScreen,
	QuizScreen,
	ResultScreen,
	ProfileScreen,
	SettingsScreen,
	LeaderboardScreen,
	WordMakerScreen,
	BookmarksScreen,
	OnboardingScreen,
	QuizList,
	LoginScreen,
	RegisterScreen,
	ResetPasswordScreen,
	ForgotPasswordScreen,
	DailyTasksScreen,
	ReviewScreen,
};

export default SCREENS;

export type RootStackParamList = {
	MainTabs: undefined;
	Quiz: { category: string };
	Result: {
		score: number;
		totalQuestions: number;
		quizId: string;
		reviewData: {
			questions: any[];
			answers: Record<string, string>;
			timeSpent: number;
			rank: number;
			totalParticipants: number;
			percentile: number;
		};
	};
	Review: {
		reviewData: {
			questions: any[];
			answers: Record<string, string>;
			timeSpent: number;
			rank: number;
			totalParticipants: number;
			percentile: number;
		};
	};
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
};

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}
