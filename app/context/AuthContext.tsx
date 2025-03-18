import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Define user types
export interface User {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  profileTitle: string | null;
  score: number;
  rank: number;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  useDemoAccount: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the base API URL
const API_URL = 'http://localhost:5000/api';

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize - Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        
        if (token) {
          // Here we'd normally validate the token with the server
          // For this example, we'll just load the user data from secure storage
          const userData = await AsyncStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const userData = await response.json();
      
      // Save user data to secure storage
      await AsyncStorage.setItem('auth_token', 'demo-token'); // In a real app, this would be a real token
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
    } catch (e: any) {
      setError(e.message || 'Failed to login');
      Alert.alert('Login Failed', e.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Registration failed. Please try again.');
      }

      const userData = await response.json();
      
      // Save user data to secure storage
      await AsyncStorage.setItem('auth_token', 'demo-token'); // In a real app, this would be a real token
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
    } catch (e: any) {
      setError(e.message || 'Failed to register');
      Alert.alert('Registration Failed', e.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Here we would normally call the logout API endpoint
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Remove user data from secure storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
      // Still clear data on client side even if API call fails
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Use demo account function
  const useDemoAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Demo login failed. Please try again.');
      }

      const userData = await response.json();
      
      // Save user data to secure storage
      await AsyncStorage.setItem('auth_token', 'demo-token');
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
    } catch (e: any) {
      // If server demo login fails, create a local demo user
      console.log('Server demo login failed, using local demo user');
      
      const demoUser: User = {
        id: 999,
        username: 'demo',
        displayName: 'Demo User',
        email: 'demo@quizmaster.com',
        profileTitle: 'Quiz Enthusiast (Demo)',
        score: 500,
        rank: 42
      };
      
      await AsyncStorage.setItem('auth_token', 'demo-token');
      await AsyncStorage.setItem('user_data', JSON.stringify(demoUser));
      
      setUser(demoUser);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    useDemoAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}