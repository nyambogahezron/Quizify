import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Toaster, toast } from 'sonner-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

const USER_DATA_KEY = 'user_data';

export default function LoginScreen({ navigation }: { navigation: any }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) {
			toast.error('Please fill in all fields');
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(
				'https://gb5zk1b0-5000.uks1.devtunnels.ms/api/v1/auth/login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password }),
				}
			);

			const data = await response.json();

			if (data && data.user) {
				await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

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
				<StatusBar style='light' backgroundColor={Colors.background} />
				<Toaster />
				<LinearGradient
					colors={[Colors.background, Colors.background2]}
					style={styles.gradient}
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
							<View style={styles.inputContainer}>
								<MaterialCommunityIcons name='email' size={24} color='white' />
								<TextInput
									style={styles.input}
									placeholder='Email'
									placeholderTextColor='#A0A0A0'
									value={email}
									onChangeText={setEmail}
									autoCapitalize='none'
									keyboardType='email-address'
								/>
							</View>
							<View style={styles.inputContainer}>
								<MaterialCommunityIcons name='lock' size={24} color='white' />
								<TextInput
									style={styles.input}
									placeholder='Password'
									placeholderTextColor='#A0A0A0'
									value={password}
									onChangeText={setPassword}
									secureTextEntry
								/>
							</View>
							<TouchableOpacity
								onPress={() => navigation.navigate('ForgotPassword')}
								style={styles.forgotPassword}
							>
								<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.loginButton}
								onPress={handleLogin}
								disabled={isLoading}
							>
								{isLoading ? (
									<ActivityIndicator size='small' color={Colors.background} />
								) : (
									<Text style={styles.loginButtonText}>Login</Text>
								)}
							</TouchableOpacity>
							<View style={styles.signupContainer}>
								<Text style={styles.signupText}>Don't have an account?</Text>
								<TouchableOpacity
									style={styles.signupButton}
									onPress={() => navigation.navigate('Register')}
								>
									<Text style={styles.signupButtonText}>Signup</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.socialLogin}>
								<Text style={styles.socialText}>Or login with</Text>
								<View style={styles.socialButtons}>
									<TouchableOpacity style={styles.socialButton}>
										<MaterialCommunityIcons
											name='google'
											size={24}
											color='white'
										/>
									</TouchableOpacity>
									<TouchableOpacity style={styles.socialButton}>
										<MaterialCommunityIcons
											name='facebook'
											size={24}
											color='white'
										/>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</KeyboardAvoidingView>
				</LinearGradient>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
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
		gap: 20,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 10,
		padding: 15,
		gap: 10,
	},
	input: {
		flex: 1,
		color: 'white',
		fontSize: 16,
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
	socialLogin: {
		marginTop: 40,
		alignItems: 'center',
		gap: 20,
	},
	socialText: {
		color: '#E0E0E0',
		fontSize: 14,
	},
	socialButtons: {
		flexDirection: 'row',
		gap: 20,
	},
	socialButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		padding: 15,
		borderRadius: 10,
	},
	demoButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		padding: 12,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 10,
	},
	demoButtonText: {
		color: '#3b5998',
		fontSize: 16,
		fontWeight: '600',
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
