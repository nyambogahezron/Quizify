import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAuthentication();
	}, []);

	const checkAuthentication = async () => {
		try {
			const response = await fetch('/api/v1/admin/dashboard', {
				method: 'GET',
				credentials: 'include',
				headers: {
					Accept: 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					Pragma: 'no-cache',
					Expires: '0',
				},
			});

			if (response.ok) {
				setIsAuthenticated(true);
				if (location.pathname === '/') {
					navigate('/dashboard');
				}
			} else {
				navigate('/login');
			}
		} catch (error) {
			console.error('Authentication check failed:', error);
			navigate('/login');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch('/api/v1/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});
			localStorage.removeItem('adminLoggedIn');
			localStorage.removeItem('adminLoginTime');
			navigate('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	if (loading) {
		return (
			<div className='loading-overlay'>
				<div className='spinner'></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='dashboard'>
			<aside className='sidebar'>
				<div className='logo'>
					<h1>Quizify</h1>
				</div>
				<nav className='nav-menu'>
					<ul>
						<li className={location.pathname === '/dashboard' ? 'active' : ''}>
							<button onClick={() => navigate('/dashboard')}>
								<i className='fas fa-chart-line'></i>
								<span>Dashboard</span>
							</button>
						</li>
						<li className={location.pathname === '/quizzes' ? 'active' : ''}>
							<button onClick={() => navigate('/quizzes')}>
								<i className='fas fa-list'></i>
								<span>Quizzes</span>
							</button>
						</li>
						<li
							className={location.pathname === '/create-quiz' ? 'active' : ''}
						>
							<button onClick={() => navigate('/create-quiz')}>
								<i className='fas fa-plus-circle'></i>
								<span>Create Quiz</span>
							</button>
						</li>
						<li className={location.pathname === '/settings' ? 'active' : ''}>
							<button onClick={() => navigate('/settings')}>
								<i className='fas fa-cog'></i>
								<span>Settings</span>
							</button>
						</li>
						<li>
							<button onClick={handleLogout}>
								<i className='fas fa-sign-out-alt'></i>
								<span>Logout</span>
							</button>
						</li>
					</ul>
				</nav>
				<div className='admin-info'>
					<div className='admin-avatar'>
						<img
							src='https://ui-avatars.com/api/?name=Admin+User&background=7E57C2&color=fff'
							alt='Admin User'
						/>
					</div>
					<div className='admin-name'>Admin User</div>
					<div className='admin-role'>Administrator</div>
				</div>
			</aside>

			<main className='content'>
				<header className='top-header'>
					<div className='search-bar'>
						<i className='fas fa-search'></i>
						<input type='text' placeholder='Search...' />
					</div>
					<div className='header-actions'>
						<button className='btn btn-outline'>
							<i className='fas fa-bell'></i>
						</button>
						<button className='btn btn-outline'>
							<i className='fas fa-envelope'></i>
						</button>
					</div>
				</header>

				<Outlet />
			</main>
		</div>
	);
}
