import React, { useRef, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '@/interface';

import {
	CustomTextInput,
	CustomPasswordInput,
} from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Animation values
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

	const validateEmail = (email: string) => {
		return email.match(
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	};

	const handleRegister = async () => {
		// Form validation
		if (
			username.trim() === '' ||
			email.trim() === '' ||
			password.trim() === ''
		) {
			Alert.alert('Registration Error', 'Please fill in all required fields.');
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (!validateEmail(email)) {
			Alert.alert('Registration Error', 'Please enter a valid email address.');
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert('Registration Error', 'Passwords do not match.');
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (password.length < 6) {
			Alert.alert(
				'Registration Error',
				'Password must be at least 6 characters long.'
			);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setIsLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Navigate to home screen
			navigation.navigate('Home');
		} catch (error) {
			console.error('Registration error:', error);
			Alert.alert('Registration Error', 'An error occurred while registering.');
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
		} finally {
			setIsLoading(false);
		}
	};

	const navigateToLogin = () => {
		Haptics.selectionAsync();
		navigation.navigate('Login');
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<LinearGradient
					colors={[Colors.background3, Colors.background2]}
					style={{ flex: 1 }}
				>
					<Animated.ScrollView
						contentContainerStyle={[
							styles.scrollContent,
							{ transform: [{ translateY: slideAnim }] },
						]}
					>
						<View style={styles.header}>
							<TouchableOpacity
								style={styles.backButton}
								onPress={navigateToLogin}
							>
								<Ionicons name='chevron-back' size={24} color='#333333' />
							</TouchableOpacity>
							<Text style={styles.title}>Create Account</Text>
							<View style={{ width: 32 }} />
						</View>

						<Text style={styles.subtitle}>
							Join Quizify to challenge yourself with fun quizzes and track your
							progress!
						</Text>

						<View style={styles.formContainer}>
							<CustomTextInput
								placeholder='Name*'
								value={displayName}
								onChangeText={setDisplayName}
								icon='person-outline'
							/>

							<CustomTextInput
								placeholder='Username*'
								value={username}
								onChangeText={setUsername}
								icon='person-outline'
							/>
							<CustomTextInput
								placeholder='Email*'
								value={email}
								onChangeText={setEmail}
								icon='mail-outline'
							/>

							<CustomPasswordInput
								placeholder='Password*'
								value={password}
								onChangeText={setPassword}
								password={password}
								setPassword={setPassword}
							/>

							<CustomPasswordInput
								placeholder='Confirm Password*'
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								password={confirmPassword}
								setPassword={setConfirmPassword}
							/>

							<Text style={styles.termsText}>
								By signing up, you agree to our{' '}
								<Text style={styles.termsLink}>Terms of Service</Text> and{' '}
								<Text style={styles.termsLink}>Privacy Policy</Text>.
							</Text>

							<CustomButton
								label='Create Account'
								onPress={handleRegister}
								disabled={isLoading}
								isLoading={isLoading}
							/>
						</View>

						<View style={styles.footer}>
							<Text style={styles.footerText}>Already have an account? </Text>
							<TouchableOpacity onPress={navigateToLogin}>
								<Text style={styles.loginLink}>Sign In</Text>
							</TouchableOpacity>
						</View>
					</Animated.ScrollView>
				</LinearGradient>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 10,
		paddingBottom: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	backButton: {
		width: 38,
		height: 38,
		borderRadius: 10,
		backgroundColor: Colors.dim,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontFamily: 'Poppins-Bold',
		fontSize: 20,
		color: Colors.text,
		textAlign: 'center',
	},
	subtitle: {
		fontFamily: 'Nunito-Regular',
		fontSize: 14,
		color: Colors.text2,
		textAlign: 'center',
		marginBottom: 32,
	},
	formContainer: {
		marginBottom: 24,
	},

	termsText: {
		fontFamily: 'Nunito-Regular',
		fontSize: 12,
		color: Colors.textLight,
		textAlign: 'center',
		marginVertical: 24,
	},
	termsLink: {
		fontFamily: 'Nunito-Bold',
		color: Colors.primary,
	},

	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	footerText: {
		fontFamily: 'Nunito-Regular',
		fontSize: 14,
		color: Colors.textLight,
	},
	loginLink: {
		fontFamily: 'Nunito-Bold',
		fontSize: 14,
		color: Colors.primary,
	},
});
