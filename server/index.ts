import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import ConnectDB from './config/database';
import cookieParser from './middleware/CookieParser';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

const app: Express = express();
const server = createServer(app);

// Define CORS options once
const corsOptions = {
	origin: [
		'http://localhost:3000',
		'http://172.18.0.49:8081',
		'exp://172.18.0.49:8081',
	],
	credentials: true,
	optionsSuccessStatus: 200,
	allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS to Express
app.use(cors(corsOptions));

// Extend Socket type to include userId
interface CustomSocket extends Socket {
	userId?: string;
}

// Create Socket.IO server with same CORS options
const io = new Server(server, {
	cors: corsOptions,
	path: '/socket.io/',
	transports: ['websocket'],
	pingTimeout: 10000,
	pingInterval: 5000,
	connectTimeout: 10000,
	allowEIO3: true,
});

//routes
import AuthRoutes from './routes/Auth.routes';
import UserRoutes from './routes/User.routes';
import QuizRoutes from './routes/Quiz.routes';
import LeaderboardRoutes from './routes/Leaderboard.routes';
import AchievementRoutes from './routes/Achievement.routes';
import DailyTaskRoutes from './routes/DailyTask.routes';
import AdminRoutes from './routes/Admin.routes';
import NotificationRoutes from './routes/notification.routes';
import UserProgressRoutes from './routes/userProgressRoutes';

//middlewares
import ErrorHandlerMiddleware from './middleware/ErrorsHandler';
import NotFoundHandler from './middleware/NotFound';

//socket handlers
import initSocketHandlers from './lib/socketHandlers';

app.use(express.json());

if (!process.env.JWT_SECRET) {
	throw new Error('JWT_SECRET is not defined');
}
app.use(cookieParser({ secret: process.env.JWT_SECRET }));

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/quizzes', QuizRoutes);
app.use('/api/v1/leaderboard', LeaderboardRoutes);
app.use('/api/v1/achievements', AchievementRoutes);
app.use('/api/v1/daily-tasks', DailyTaskRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/notifications', NotificationRoutes);
app.use('/api/v1/user-progress', UserProgressRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Simple redirect from /admin to /admin/dashboard
app.get('/admin', (req, res) => {
	res.redirect('/admin/dashboard');
});

// Serve admin dashboard HTML without authentication check
// We'll handle authentication with a modal on the client side
app.get('/admin/dashboard', (req, res) => {
	res.setHeader(
		'Cache-Control',
		'no-store, no-cache, must-revalidate, proxy-revalidate'
	);
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');

	res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.get('/', (req: Request, res: Response) => {
	res.send('Quizify API');
});

app.use(ErrorHandlerMiddleware as unknown as express.ErrorRequestHandler);
app.use(NotFoundHandler);

// Initialize socket handlers
initSocketHandlers(io);

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket: CustomSocket) => {
	console.log('New socket connection:', socket.id);

	// Handle user authentication
	socket.on('authenticate', (userId: string) => {
		connectedUsers.set(userId, socket.id);
		socket.userId = userId;
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		if (socket.userId) {
			connectedUsers.delete(socket.userId);
		}
		console.log('Socket disconnected:', socket.id);
	});
});

// Store io instance in app
app.set('io', io);

async function StartApp() {
	const port = process.env.PORT || 5000;

	try {
		await ConnectDB(process.env.MONGO_URI);

		server.listen(port, () => {
			console.log(`[server]: Server is running at http://localhost:${port}`);
			console.log(`[socket.io]: Socket.IO server is running`);
		});
	} catch (error) {
		console.log(error);
	}
}

StartApp();
