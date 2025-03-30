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
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen({
	navigation,
}: {
	navigation: any;
}) {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);



	 // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Start animations on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


	const handleLogin = async () => {
		if (!email) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(
				'https://gb5zk1b0-5000.uks1.devtunnels.ms/api/v1/auth/forgot-password',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setIsLoading(false);
				throw new Error(
					data.message || 'Somethings went wrong, please try again'
				);
			}

			setIsLoading(false);
			navigation.navigate('ResetPassword', { email });
		} catch (error) {
			setIsLoading(false);
			console.log(error);
			const message =
				error instanceof Error
					? error.message
					: 'Somethings went wrong, please try again';
			toast.error(message);
			Alert.alert('Authentication Error', message);
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
							<Text style={styles.title}>Forgot Password</Text>
							<Text style={styles.subtitle}>
								Enter your email to reset password
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

							<TouchableOpacity
								style={[
									styles.loginButton,
									isLoading || !email ? styles.disabledButton : null,
								]}
								onPress={handleLogin}
								disabled={isLoading || !email}
							>
								{isLoading ? (
									<ActivityIndicator size='small' color={Colors.background} />
								) : (
									<Text style={styles.loginButtonText}>Send Code</Text>
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
