import axios from 'axios';

const API_URL =
	process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});
