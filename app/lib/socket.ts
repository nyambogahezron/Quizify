import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL!;

class SocketService {
	private socket: Socket | null = null;
	private isConnecting = false;
	private connectionAttempts = 0;
	private maxConnectionAttempts = 5;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private onSessionExpired: (() => void) | null = null;

	onSessionExpire(callback: () => void) {
		this.onSessionExpired = callback;
	}

	async connect() {
		if (this.socket?.connected || this.isConnecting) return;

		try {
			this.isConnecting = true;
			this.connectionAttempts++;
			console.log(
				`Attempting to connect to socket server at: ${SOCKET_URL} (Attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`
			);

			this.socket = io(SOCKET_URL, {
				transports: ['websocket'],
				autoConnect: true,
				withCredentials: true,
				reconnection: false,
				timeout: 10000,
				forceNew: true,
				path: '/socket.io/',
				extraHeaders: {
					'Access-Control-Allow-Origin': '*',
				},
			});

			return new Promise<void>((resolve, reject) => {
				if (!this.socket) {
					reject(new Error('Socket initialization failed'));
					return;
				}

				const timeoutId = setTimeout(() => {
					this.isConnecting = false;
					reject(new Error('Connection timeout'));
				}, 10000);

				this.socket.on('connect', () => {
					clearTimeout(timeoutId);
					console.log('Socket connected successfully');
					this.isConnecting = false;
					this.connectionAttempts = 0;
					this.testConnection();
					resolve();
				});

				this.socket.on('connect_error', (error) => {
					clearTimeout(timeoutId);
					console.error('Socket connection error:', error.message);
					console.error('Error details:', error);
					this.isConnecting = false;

					if (
						error.message?.includes('Authentication error: Invalid session')
					) {
						this.onSessionExpired?.();
						reject(error);
						return;
					}

					if (this.connectionAttempts >= this.maxConnectionAttempts) {
						reject(
							new Error(
								`Failed to connect after ${this.maxConnectionAttempts} attempts`
							)
						);
					} else {
						if (this.reconnectTimer) {
							clearTimeout(this.reconnectTimer);
						}
						this.reconnectTimer = setTimeout(() => {
							this.connect();
						}, 2000);
						reject(error);
					}
				});

				this.socket.on('disconnect', (reason) => {
					console.log('Socket disconnected:', reason);
					this.isConnecting = false;
				});

				this.socket.on('data', (data) => {
					console.log('Data:', data);
				});

				this.socket.on('error', (error) => {
					console.error('Socket error:', error);
					this.isConnecting = false;
				});

				this.socket.on('test_connection_response', (data) => {
					console.log('Test connection response:', data);
				});

				this.socket.on('reconnect_attempt', (attemptNumber) => {
					console.log('Reconnection attempt:', attemptNumber);
				});

				this.socket.on('reconnect_error', (error) => {
					console.error('Reconnection error:', error);
				});

				this.socket.on('reconnect_failed', () => {
					console.log('Reconnection failed');
				});
			});
		} catch (error) {
			this.isConnecting = false;
			console.error('Error connecting to socket:', error);
			throw error;
		}
	}

	disconnect() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	getSocket() {
		return this.socket;
	}

	testConnection() {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Testing connection...');
		this.socket.emit('test_connection');
	}

	// Quiz related events
	joinQuiz(quizId: string) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Joining quiz:', quizId);
		this.socket.emit('quiz:start', quizId);
	}

	leaveQuiz(quizId: string) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Leaving quiz:', quizId);
		this.socket.emit('leave_quiz', { quizId });
	}

	submitAnswer(
		quizId: string,
		questionId: string,
		answer: number,
		timeSpent: number
	) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Submitting answer:', {
			quizId,
			questionId,
			answer,
			timeSpent,
		});
		this.socket.emit('quiz:submit-answer', {
			quizId,
			questionId,
			answer,
			timeSpent,
		});
	}

	// Leaderboard events
	onLeaderboardUpdate(callback: (data: any) => void) {
		this.socket?.on('leaderboard:updated', callback);
	}

	// Achievement events
	onAchievementUnlocked(callback: (data: any) => void) {
		this.socket?.on('achievement_unlocked', callback);
	}

	// Daily task events
	onDailyTaskUpdate(callback: (data: any) => void) {
		this.socket?.on('daily_task_update', callback);
	}

	// Word Maker game events
	startWordMakerLevel(levelId: string) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect()
				.then(() => {
					if (this.socket?.connected) {
						console.log('Starting word maker level:', levelId);
						this.socket.emit('wordmaker:start', levelId);
					} else {
						console.error('Failed to connect to socket');
					}
				})
				.catch((error) => {
					console.error('Error connecting to socket:', error);
				});
			return;
		}
		console.log('Starting word maker level:', levelId);
		this.socket.emit('wordmaker:start', levelId);
	}

	onWordMakerLevelData(callback: (data: any) => void) {
		this.socket?.on('wordmaker:level-data', callback);
	}

	submitWordFound(levelId: string, word: string, timeSpent: number) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Submitting word found:', { levelId, word, timeSpent });
		this.socket.emit('wordmaker:word-found', { levelId, word, timeSpent });
	}

	onWordMakerProgressUpdate(callback: (data: any) => void) {
		this.socket?.on('wordmaker:progress-updated', callback);
	}

	onWordMakerLevelCompleted(callback: (data: any) => void) {
		this.socket?.on('wordmaker:level-completed', callback);
	}

	leaveWordMakerLevel(levelId: string) {
		if (!this.socket?.connected) {
			console.log('Socket not connected, attempting to connect...');
			this.connect();
			return;
		}
		console.log('Leaving word maker level:', levelId);
		this.socket.emit('wordmaker:leave', levelId);
	}

	public getLeaderboard(quizId?: string) {
		if (this.socket) {
			this.socket.emit('leaderboard:get', { quizId });
		}
	}

	public onLeaderboardData(callback: (data: any) => void) {
		this.socket?.on('leaderboard:data', callback);
	}

	public offLeaderboardData(callback: (data: any) => void) {
		this.socket?.off('leaderboard:data', callback);
	}
}

export const socketService = new SocketService();
