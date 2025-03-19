import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'https://gb5zk1b0-5000.uks1.devtunnels.ms/api/v1';

export async function fetchApi(path: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}/${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
}




