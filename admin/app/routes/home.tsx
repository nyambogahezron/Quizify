import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
	return (
		<div className='p-4'>
			<h1 className='text-2xl font-bold mb-4'>Quizify Admin</h1>
			<nav className='space-x-4'>
				<Link to='/dashboard' className='text-blue-600 hover:underline'>
					Dashboard
				</Link>
				<Link to='/quizzes' className='text-blue-600 hover:underline'>
					Quizzes
				</Link>
				<Link to='/settings' className='text-blue-600 hover:underline'>
					Settings
				</Link>
			</nav>
		</div>
	);
}
