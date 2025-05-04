import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './routes/dashboard';
import Login from './routes/auth/login';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{
				path: 'dashboard',
				element: <Dashboard />,
			},
		],
	},
	{
		path: '/login',
		element: <Login />,
	},
]);
