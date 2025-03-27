import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchApi(path: string, options: RequestInit = {}) {
	const token = await AsyncStorage.getItem('token');
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${BASE_URL}/${path}`, {
		...options,
		headers,
		credentials: 'include',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return response.json();
}

export async function logout() {
	try {
		await fetchApi('/logout', {
			method: 'POST',
		});
		await AsyncStorage.removeItem('token');
	} catch (error) {
		console.error('Logout error', error);
	}
}
