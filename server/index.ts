import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import ConnectDB from './config/database';
import cookieParser from './middleware/CookieParser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

//routes
import AuthRoutes from './routes/Auth.routes';
import UserRoutes from './routes/User.routes';
import QuizRoutes from './routes/Quiz.routes';
import LeaderboardRoutes from './routes/Leaderboard.routes';
import AchievementRoutes from './routes/Achievement.routes';
import DailyTaskRoutes from './routes/DailyTask.routes';
import AdminRoutes from './routes/Admin.routes';

//middlewares
import ErrorHandlerMiddleware from './middleware/ErrorsHandler';
import NotFoundHandler from './middleware/NotFound';

//socket handlers
import initSocketHandlers from './utils/socketHandlers';

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

const corsOptions = {
	origin: process.env.CLIENT_URL,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Initialize socket handlers
initSocketHandlers(io);

async function StartApp() {
	const port = process.env.PORT || 3000;

	try {
		await ConnectDB(process.env.MONGO_URI);

		httpServer.listen(port, () => {
			console.log(`[server]: Server is running at http://localhost:${port}`);
			console.log(`[socket.io]: Socket.IO server is running`);
		});
	} catch (error) {
		console.log(error);
	}
}

StartApp();
