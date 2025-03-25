import QuizScreen from './QuizScreen';
import ResultScreen from './ResultScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import LeaderboardScreen from './LeaderboardScreen';
import CreateAccountScreen from './CreateAccountScreen';
import WordMakerScreen from './WordMakerGameScreen';
import BookmarksScreen from './BookmarksScreen';
import OnboardingScreen from './OnBoardScreen';
import HomeScreen from './HomeScreen';
import QuizList from './QuizList';
import LoginScreen from './Login';
import RegisterScreen from './Register';
import ResetPasswordScreen from './ResetPassword';
import ForgotPasswordScreen from './ForgotPassword';
import DailyTasksScreen from './DailyTasks';

const SCREENS = {
	HomeScreen,
	QuizScreen,
	ResultScreen,
	ProfileScreen,
	SettingsScreen,
	LeaderboardScreen,
	CreateAccountScreen,
	WordMakerScreen,
	BookmarksScreen,
	OnboardingScreen,
	QuizList,
	LoginScreen,
	RegisterScreen,
	ResetPasswordScreen,
	ForgotPasswordScreen,
	DailyTasksScreen,
};

export default SCREENS;

export type RootStackParamList = {
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
};

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}
