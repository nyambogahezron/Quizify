import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:3000';

class SocketService {
	private socket: Socket | null = null;

	async connect() {
		if (this.socket) return;

		const token = await AsyncStorage.getItem('token');
		if (!token) return;

		this.socket = io(SOCKET_URL, {
			auth: { token },
			transports: ['websocket'],
			autoConnect: true,
		});

		this.socket.on('connect', () => {
			console.log('Socket connected');
		});

		this.socket.on('disconnect', () => {
			console.log('Socket disconnected');
		});

		this.socket.on('error', (error) => {
			console.error('Socket error:', error);
		});
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	getSocket() {
		return this.socket;
	}

	// Quiz related events
	joinQuiz(quizId: string) {
		this.socket?.emit('join_quiz', { quizId });
	}

	leaveQuiz(quizId: string) {
		this.socket?.emit('leave_quiz', { quizId });
	}

	submitAnswer(quizId: string, questionId: string, answer: string) {
		this.socket?.emit('submit_answer', { quizId, questionId, answer });
	}

	// Leaderboard events
	onLeaderboardUpdate(callback: (data: any) => void) {
		this.socket?.on('leaderboard_update', callback);
	}

	// Achievement events
	onAchievementUnlocked(callback: (data: any) => void) {
		this.socket?.on('achievement_unlocked', callback);
	}

	// Daily task events
	onDailyTaskUpdate(callback: (data: any) => void) {
		this.socket?.on('daily_task_update', callback);
	}
}

export const socketService = new SocketService();
