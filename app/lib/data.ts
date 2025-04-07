import { moreGames } from '@/interface';

export const bookmarkedQuizzes = [
	{
		id: '1',
		title: 'World History',
		questions: 15,
		completed: 8,
		icon: '🌍',
	},
	{
		id: '2',
		title: 'Mathematics',
		questions: 20,
		completed: 12,
		icon: '📐',
	},
	{
		id: '3',
		title: 'Science',
		questions: 10,
		completed: 5,
		icon: '🔬',
	},
	{
		id: '4',
		title: 'Geography',
		questions: 25,
		completed: 17,
		icon: '🌏',
	},
	{
		id: '5',
		title: 'Computer Science',
		questions: 30,
		completed: 22,
		icon: '💻',
	},
];

export const moreGamesList: moreGames[] = [
	{
		id: 1,
		name: 'Word Maker',
		questions: 12,
		players: '12.5k',
		icon: '🎯',
		description: 'Create a word by filling in the missing letters',
		path: 'WordMakerLevels',
	},
	{
		id: 2,
		name: 'Word Fill',
		questions: 1,
		players: '24.7k',
		icon: '🔤',
		description: 'Fill in the missing letters to complete the word',
		path: 'WordFillLevels',
	},
];

export const leaderboardData = [
	{
		id: '1',
		name: 'John Doe',
		score: 2800,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '2',
		name: 'Jane Smith',
		score: 2650,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '3',
		name: 'Mike Johnson',
		score: 2400,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '4',
		name: 'Anna Brown',
		score: 2200,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '5',
		name: 'Kevin Miller',
		score: 2000,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '6',
		name: 'Sarah Lee',
		score: 1800,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '7',
		name: 'David Wilson',
		score: 1600,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '8',
		name: 'Emily Davis',
		score: 1400,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '9',
		name: 'James White',
		score: 1200,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
	{
		id: '10',
		name: 'Emma Harris',
		score: 1000,
		avatar:
			'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg',
	},
];

export const achievements = [
	{
		id: '1',
		title: 'Quick Learner',
		description: 'Complete 5 quizzes in a day',
		icon: '🚀',
		progress: 3,
		total: 5,
	},
	{
		id: '2',
		title: 'Knowledge Master',
		description: 'Score 100% in 3 quizzes',
		icon: '🎯',
		progress: 2,
		total: 3,
	},
	{
		id: '3',
		title: 'Quiz Champion',
		description: 'Win 10 daily challenges',
		icon: '👑',
		progress: 7,
		total: 10,
	},
	{
		id: '4',
		title: 'Quiz Expert',
		description: 'Score 100% in 10 quizzes',
		icon: '🏆',
		progress: 5,
		total: 10,
	},
	{
		id: '5',
		title: 'Quiz Master',
		description: 'Complete 50 quizzes',
		icon: '🧠',
		progress: 25,
		total: 50,
	},
	{
		id: '6',
		title: 'Quiz Pro',
		description: 'Score 100% in 20 quizzes',
		icon: '🎖',
		progress: 10,
		total: 20,
	},
	{
		id: '7',
		title: 'Quiz Whiz',
		description: 'Complete 100 quizzes',
		icon: '🧐',
		progress: 50,
		total: 100,
	},
	{
		id: '8',
		title: 'Quiz Genius',
		description: 'Score 100% in 50 quizzes',
		icon: '🤯',
		progress: 30,
		total: 50,
	},
];

export const recentActivity = [
	{
		id: '1',
		quiz: 'World History',
		score: 8,
		total: 10,
		date: '2 hours ago',
		icon: '🌍',
	},
	{
		id: '2',
		quiz: 'Mathematics',
		score: 9,
		total: 10,
		date: 'Yesterday',
		icon: '📐',
	},
	{
		id: '3',
		quiz: 'Science',
		score: 7,
		total: 10,
		date: '2 days ago',
		icon: '🔬',
	},
	{
		id: '4',
		quiz: 'Geography',
		score: 10,
		total: 10,
		date: '3 days ago',
		icon: '🌏',
	},
	{
		id: '5',
		quiz: 'Computer Science',
		score: 8,
		total: 10,
		date: '4 days ago',
		icon: '💻',
	},
	{
		id: '6',
		quiz: 'Language Quiz',
		score: 6,
		total: 10,
		date: '5 days ago',
		icon: '⚔️',
	},
	{
		id: '7',
		quiz: 'Exam Quiz',
		score: 7,
		total: 10,
		date: '6 days ago',
		icon: '🎯',
	},
	{
		id: '8',
		quiz: 'Math Quiz',
		score: 9,
		total: 10,
		date: '1 week ago',
		icon: '🧮',
	},
];

export const mockQuestions = [
	{
		question: 'Which soccer team won the FIFA World Cup for the first time?',
		options: ['Uruguay', 'Brazil', 'Italy', 'Germany'],
		correctAnswer: 0,
	},
	{
		question: 'Which planet is known as the Red Planet?',
		options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
		correctAnswer: 1,
	},
	{
		question: 'What is the capital of Spain?',
		options: ['Barcelona', 'Madrid', 'Seville', 'Valencia'],
		correctAnswer: 1,
	},
	{
		question: 'What is the largest mammal in the world?',
		options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
		correctAnswer: 1,
	},
	{
		question: 'What is the currency of Japan?',
		options: ['Yuan', 'Yen', 'Won', 'Dollar'],
		correctAnswer: 1,
	},
	{
		question: 'What is the largest ocean in the world?',
		options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
		correctAnswer: 3,
	},
	{
		question: 'What is the capital of France?',
		options: ['Lyon', 'Marseille', 'Paris', 'Nice'],
		correctAnswer: 2,
	},
	{
		question: 'What is the largest country in the world?',
		options: ['Canada', 'China', 'Russia', 'United States'],
		correctAnswer: 2,
	},
	{
		question: 'Which country is known as the Land of the Rising Sun?',
		options: ['China', 'Korea', 'Japan', 'Vietnam'],
		correctAnswer: 2,
	},
	{
		question: 'What is the smallest country in the world?',
		options: ['Monaco', 'Maldives', 'Vatican City', 'San Marino'],
		correctAnswer: 2,
	},
];

export const slides = [
	{
		id: 1,
		key: 'welcome',
		title: 'Welcome to Quizify',
		description:
			'Embark on a journey of knowledge and fun with our interactive quiz platform.',
		icon: '🎯',
	},
	{
		id: 2,
		key: 'info',
		title: 'User Agreement',
		description:
			'By continuing, you agree to our Terms of Service and Privacy Policy. We value your privacy and ensure your data is protected.',
		icon: '📜',
	},
	{
		id: 3,
		key: 'userAgreement',
		title: 'Learn & Compete',
		description:
			'Challenge yourself with various quiz categories, track your progress, and compete with friends.',
		icon: '🏆',
	},
];
