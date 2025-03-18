import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'lib/types';
import { useUserStore } from 'store';
import Colors from 'constants/Colors';

type Props = {
	navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;
};

export default function CreateAccountScreen({ navigation }: Props) {
	const [isLoading, setIsLoading] = React.useState(false);
	const user = useUserStore((state) => state.user);
	const [name, setName] = React.useState<string>('');
	const [username, setUsername] = React.useState<string>('');
	const [email, setEmail] = React.useState<string>('');
	const [avatar, setAvatar] = React.useState<string | null>('');

	React.useEffect(() => {
		if (user) {
			navigation.push('MainTabs');
		}
	}, []);

	const handleCreateAccount = async () => {};
	return (
		<LinearGradient
			colors={[Colors.background, Colors.background2]}
			style={{ flex: 1 }}
		>
			<SafeAreaView style={{ flex: 1 }}>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={{ flex: 1 }}
				>
					<View style={styles.content}>
						<View style={styles.header}>
							<Text style={styles.title}>Create Account</Text>
							<Text style={styles.subtitle}>
								Join our community of quiz enthusiasts
							</Text>
						</View>

						<View style={styles.form}>
							<View style={styles.inputContainer}>
								<Text style={styles.label}>Name</Text>
								<TextInput
									style={styles.input}
									placeholder='Enter your name'
									placeholderTextColor='#666'
									value={name}
									onChangeText={setName}
									autoCapitalize='words'
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Username</Text>
								<TextInput
									style={styles.input}
									placeholder='Choose a username'
									placeholderTextColor='#666'
									value={username}
									onChangeText={setUsername}
									autoCapitalize='none'
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Email</Text>
								<TextInput
									style={styles.input}
									placeholder='Enter your email'
									placeholderTextColor='#666'
									value={email}
									onChangeText={setEmail}
									autoCapitalize='none'
								/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.label}>Avatar</Text>
								<TextInput
									style={styles.input}
									placeholder='Enter your avatar URL'
									placeholderTextColor='#666'
									value={avatar ?? ''}
									onChangeText={setAvatar}
									autoCapitalize='none'
								/>
							</View>

							<TouchableOpacity
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleCreateAccount}
								disabled={isLoading}
							>
								<Text style={styles.buttonText}>
									{isLoading ? 'Creating Account...' : 'Create Account'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
	},
	header: {
		alignItems: 'center',
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: 'white',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
		textAlign: 'center',
	},
	form: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#F8F9FA',
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: '#333',
	},
	button: {
		backgroundColor: Colors.red1,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 20,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});
