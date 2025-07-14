import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('admin@quizify.com');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Login failed');
			}

			const data = await response.json();

			if (!data.user.isAdmin) {
				throw new Error('Admin access required');
			}

			// Store login information
			localStorage.setItem('adminLoggedIn', 'true');
			localStorage.setItem('adminLoginTime', new Date().getTime().toString());

			// Navigate to dashboard
			navigate('/dashboard');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='login-container'>
			<div className='login-card'>
				<div className='login-header'>
					<h1>Quizify</h1>
					<p>Admin Dashboard Login</p>
				</div>

				<form onSubmit={handleSubmit} className='login-form'>
					<div className='form-group'>
						<label htmlFor='email'>Email:</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password:</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{error && <div className='error-message'>{error}</div>}

					<div className='login-actions'>
						<button
							type='submit'
							className='btn btn-primary btn-block'
							disabled={loading}
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
