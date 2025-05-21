import { useState, useEffect } from 'react';
import './dashboard.css';

interface DashboardStats {
	quizCount: number;
	questionCount: number;
	userCount: number;
	quizAttempts: number;
}

interface Quiz {
	id: string;
	title: string;
	category: string;
	questionCount: number;
	createdAt: string;
}

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats>({
		quizCount: 0,
		questionCount: 0,
		userCount: 0,
		quizAttempts: 0,
	});
	const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const [quizzesResponse, statsResponse] = await Promise.all([
				fetch('/api/v1/admin/quizzes?limit=5'),
				fetch('/api/v1/admin/stats'),
			]);

			if (!quizzesResponse.ok || !statsResponse.ok) {
				throw new Error('Failed to load dashboard data');
			}

			const quizzes = await quizzesResponse.json();
			const statsData = await statsResponse.json();

			setRecentQuizzes(quizzes);
			setStats(statsData);
		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className='loading'>Loading dashboard data...</div>;
	}

	return (
		<div className='dashboard-page'>
			<div className='page-header'>
				<h2>Dashboard</h2>
				<p>Welcome to the Quizify admin dashboard</p>
			</div>

			<div className='stats-cards'>
				<div className='stat-card'>
					<div className='stat-card-icon'>
						<i className='fas fa-list'></i>
					</div>
					<div className='stat-card-info'>
						<div className='stat-card-value'>{stats.quizCount}</div>
						<div className='stat-card-title'>Total Quizzes</div>
					</div>
				</div>
				<div className='stat-card'>
					<div className='stat-card-icon'>
						<i className='fas fa-question-circle'></i>
					</div>
					<div className='stat-card-info'>
						<div className='stat-card-value'>{stats.questionCount}</div>
						<div className='stat-card-title'>Total Questions</div>
					</div>
				</div>
				<div className='stat-card'>
					<div className='stat-card-icon'>
						<i className='fas fa-users'></i>
					</div>
					<div className='stat-card-info'>
						<div className='stat-card-value'>{stats.userCount}</div>
						<div className='stat-card-title'>Users</div>
					</div>
				</div>
				<div className='stat-card'>
					<div className='stat-card-icon'>
						<i className='fas fa-chart-bar'></i>
					</div>
					<div className='stat-card-info'>
						<div className='stat-card-value'>{stats.quizAttempts}</div>
						<div className='stat-card-title'>Quiz Attempts</div>
					</div>
				</div>
			</div>

			<div className='recent-section'>
				<div className='section-header'>
					<h3>Recent Quizzes</h3>
					<button className='btn btn-primary btn-sm'>View All</button>
				</div>
				<div className='table-responsive'>
					<table className='data-table'>
						<thead>
							<tr>
								<th>Quiz Title</th>
								<th>Category</th>
								<th>Questions</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{recentQuizzes.map((quiz) => (
								<tr key={quiz.id}>
									<td>{quiz.title}</td>
									<td>{quiz.category}</td>
									<td>{quiz.questionCount}</td>
									<td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
									<td>
										<button className='btn btn-sm btn-outline'>
											<i className='fas fa-edit'></i>
										</button>
										<button className='btn btn-sm btn-outline'>
											<i className='fas fa-trash'></i>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
