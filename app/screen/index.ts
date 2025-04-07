import QuizScreen from './(quiz)/QuizScreen';
import ResultScreen from './(quiz)/ResultScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import LeaderboardScreen from './(tabs)/LeaderboardScreen';
import WordMakerScreen from './(games)/WordMakerGame';
import OnboardingScreen from './OnBoardScreen';
import HomeScreen from './(tabs)/HomeScreen';
import QuizList from './(quiz)/QuizList';
import LoginScreen from './(auth)/Login';
import RegisterScreen from './(auth)/Register';
import ResetPasswordScreen from './(auth)/ResetPassword';
import ForgotPasswordScreen from './(auth)/ForgotPassword';
import DailyTasksScreen from './DailyTasks';
import ReviewScreen from './(quiz)/ReviewScreen';
import WordFillScreen from './(games)/WordFill';
import BookmarksScreen from './BookmarksScreen';
import WordFillLevels from './WordFillLevels';
import WordMakerLevels from './WordMakerLevels';
import Gamelist from './(tabs)/Gamelist';
import NotificationScreen from './Notifications';

const SCREENS = {
	HomeScreen,
	QuizScreen,
	ResultScreen,
	ProfileScreen,
	SettingsScreen,
	LeaderboardScreen,
	WordMakerScreen,
	WordFillScreen,
	BookmarksScreen,
	OnboardingScreen,
	QuizList,
	LoginScreen,
	RegisterScreen,
	ResetPasswordScreen,
	ForgotPasswordScreen,
	DailyTasksScreen,
	ReviewScreen,
	WordFillLevels,
	WordMakerLevels,
	Gamelist,
	NotificationScreen,
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
	WordGame: { levelId: number };
	WordFill: { levelId: number };
	WordMakerLevels: undefined;
	WordFillLevels: undefined;
	OnBoard: undefined;
	QuizList: { categories: Category[] };
	Login: undefined;
	Register: undefined;
	ResetPassword: undefined;
	ForgotPassword: undefined;
	DailyTasks: undefined;
	Games: undefined;
	Notification: undefined;
};

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}
