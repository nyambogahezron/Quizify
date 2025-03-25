import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
	process.env.EXPO_PUBLIC_API_URL ||
	'https://gb5zk1b0-5000.uks1.devtunnels.ms/api/v1';

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	async (config) => {
		const token = await AsyncStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling errors
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			await AsyncStorage.removeItem('token');
			// You might want to redirect to login here
		}
		return Promise.reject(error);
	}
);
