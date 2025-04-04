import React, { useRef, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Toaster, toast } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

import {
	CustomTextInput,
	CustomPasswordInput,
} from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';
import { useAuthStore } from '@/store/useStore';

const USER_DATA_KEY = 'user_data';

export default function LoginScreen({ navigation }: { navigation: any }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { setIsAuthenticated, setUser } = useAuthStore();

	const slideAnim = useRef(new Animated.Value(50)).current;

	// Start animations on mount
	React.useEffect(() => {
		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 500,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handleLogin = async () => {
		if (!email || !password) {
			toast.error('Please fill in all fields');
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password }),
					credentials: 'include',
				}
			);

			const data = await response.json();

			if (data && data.user) {
				await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
				setUser(data.user);
				setIsAuthenticated(true);

				navigation.navigate('MainTabs');
			}

			if (!response.ok) {
				setIsLoading(false);
				throw new Error(data.message || 'Login failed');
			}

			toast.success('Login successful');
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			console.log(error);

			if (
				error instanceof Error &&
				error.message.startsWith('Your Account is suspended')
			) {
				Alert.alert('Authentication Error', 'Your Account is suspended', [
					{
						text: 'RESET PASSWORD',
						onPress: () => navigation.navigate('ForgotPassword'),
					},
				]);
				return;
			}
			const message = error instanceof Error ? error.message : 'Login failed';
			Alert.alert('Authentication Error', message); //TODO: remove this error message in production
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={[styles.container, isLoading && { opacity: 0.9 }]}>
				<Toaster />
				<Animated.View
					style={[{ transform: [{ translateY: slideAnim }] }, { flex: 1 }]}
				>
					<LinearGradient
						colors={[Colors.background, Colors.background2]}
						style={{ flex: 1 }}
					>
						<KeyboardAvoidingView
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
							style={styles.content}
						>
							<View style={styles.header}>
								<Text style={styles.title}>Welcome Back!</Text>
								<Text style={styles.subtitle}>
									Login to continue your journey
								</Text>
							</View>

							<View style={styles.form}>
								<CustomTextInput
									placeholder='Email'
									value={email}
									onChangeText={setEmail}
									icon='mail-outline'
								/>

								<CustomPasswordInput
									placeholder='Password'
									value={password}
									onChangeText={setPassword}
									password={password}
									setPassword={setPassword}
								/>
							</View>

							<TouchableOpacity
								onPress={() => navigation.navigate('ForgotPassword')}
								style={styles.forgotPassword}
							>
								<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
							</TouchableOpacity>

							<CustomButton
								customStyle={{ marginTop: 20 }}
								label='Login'
								onPress={handleLogin}
								disabled={isLoading}
								isLoading={isLoading}
							/>

							<View style={styles.signupContainer}>
								<View style={styles.signupContainer}>
									<Text style={styles.signupText}>Don't have an account?</Text>
									<TouchableOpacity
										style={styles.signupButton}
										onPress={() => navigation.navigate('Register')}
									>
										<Text style={styles.signupButtonText}>Signup</Text>
									</TouchableOpacity>
								</View>
							</View>
						</KeyboardAvoidingView>
					</LinearGradient>
				</Animated.View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	header: {
		alignItems: 'center',
		marginTop: 40,
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#E0E0E0',
		marginTop: 10,
	},
	form: {
		gap: 10,
	},

	forgotPassword: {
		alignSelf: 'flex-end',
	},
	forgotPasswordText: {
		color: '#E0E0E0',
		fontSize: 14,
	},
	loginButton: {
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
	},
	loginButtonText: {
		color: '#3b5998',
		fontSize: 18,
		fontWeight: 'bold',
	},

	signupContainer: {
		alignItems: 'center',
		gap: 10,
	},
	signupText: {
		color: '#E0E0E0',
		fontSize: 14,
	},
	signupButton: {
		backgroundColor: 'transparent',
		padding: 10,
		borderRadius: 10,
	},
	signupButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
