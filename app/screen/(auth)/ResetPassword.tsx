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
import Colors from '@/constants/Colors';
import { useRoute } from '@react-navigation/native';

export default function ResetPasswordScreen({
	navigation,
}: {
	navigation: any;
}) {
	const route = useRoute();
	const { email } = route.params as { email: string };
	const [token, settToken] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleResetPassword = async () => {
		if (!email || !token || !password || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		if (password.length < 8) {
			Alert.alert('Too short', 'Password must be at least 8 characters long');
			return;
		}

		if (token.length !== 6) {
			Alert.alert('Token Error', 'Code must be 6 digits long');
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match');
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(
				'https://gb5zk1b0-5000.uks1.devtunnels.ms/api/v1/auth/reset-password',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, token, password }),
				}
			);

			const data = await response.json();
			console.log(data);

			if (!response.ok) {
				setIsLoading(false);
				throw new Error(data.message || 'Login failed');
			}

			setIsLoading(false);

			navigation.navigate('Login');
			Alert.alert('Password reset successful');
		} catch (error) {
			setIsLoading(false);
			console.log(error);

			if (error instanceof Error && error.message.startsWith('Token expired')) {
				Alert.alert('Token expired', 'Please request a new code', [
					{
						text: 'Resend Code',
						onPress: () => navigation.navigate('ForgotPassword'),
					},
				]);
				navigation.navigate('ForgotPassword');
				return;
			}
			const message = error instanceof Error ? error.message : 'Login failed';
			toast.error(message);
			Alert.alert('Password reset failed', message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={[styles.container, isLoading && { opacity: 0.9 }]}>
				<Toaster />
				<LinearGradient
					colors={[Colors.background3, Colors.background2]}
					style={styles.gradient}
				>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						style={styles.content}
					>
						<View style={styles.header}>
							<Text style={styles.title}>Reset Password</Text>
							<Text style={styles.subtitle}>
								Enter your email to reset password
							</Text>
						</View>

						<View style={styles.form}>
							<View style={styles.inputContainer}>
								<MaterialCommunityIcons name='email' size={24} color='white' />
								<TextInput
									style={styles.input}
									placeholder='Code'
									placeholderTextColor='#A0A0A0'
									value={token}
									onChangeText={settToken}
									autoCapitalize='none'
									keyboardType='numeric'
								/>
							</View>

							<View style={styles.inputContainer}>
								<MaterialCommunityIcons name='lock' size={24} color='white' />
								<TextInput
									onChangeText={setPassword}
									style={styles.input}
									placeholder='Password'
									value={password}
									placeholderTextColor='#A0A0A0'
								/>
							</View>

							<View style={styles.inputContainer}>
								<MaterialCommunityIcons name='lock' size={24} color='white' />
								<TextInput
									onChangeText={setConfirmPassword}
									style={styles.input}
									value={confirmPassword}
									placeholder='Confirm Password'
									placeholderTextColor='#A0A0A0'
								/>
							</View>
							<TouchableOpacity
								style={[
									styles.loginButton,
									isLoading || !email ? styles.disabledButton : null,
								]}
								onPress={handleResetPassword}
								disabled={
									isLoading || !email || !token || !password || !confirmPassword
								}
							>
								{isLoading ? (
									<ActivityIndicator size='small' color={Colors.background} />
								) : (
									<Text style={styles.loginButtonText}>Reset Password</Text>
								)}
							</TouchableOpacity>
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
	disabledButton: {
		backgroundColor: '#ccc',
	},
});
