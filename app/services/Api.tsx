import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://localhost:5000/api';

const token =  async()  => {
    const token = await AsyncStorage.getItem('token');
    return token;
}

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
}   

export async function fetchApi(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}/${path}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
}




