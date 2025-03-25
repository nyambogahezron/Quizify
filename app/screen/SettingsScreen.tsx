import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	ScrollView,
	TextInput,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from 'constants/Colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '.';
import { useNavigation } from '@react-navigation/native';
import Animated, {
	withSpring,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/useStore';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
	const [notifications, setNotifications] = React.useState(true);
	const [sound, setSound] = React.useState(true);
	const [vibration, setVibration] = React.useState(true);
	const [isFormVisible, setIsFormVisible] = React.useState(false);
	const { logout } = useAuthStore();
	// Form states
	const [name, setName] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [username, setUsername] = React.useState('');

	// Animation value
	const formHeight = useSharedValue(0);
	const scrollViewRef = React.useRef<ScrollView>(null);
	const formRef = React.useRef<View>(null);

	const animatedStyles = useAnimatedStyle(() => {
		return {
			height: formHeight.value,
			opacity: formHeight.value === 0 ? 0 : 1,
			overflow: 'hidden',
			marginBottom: formHeight.value === 0 ? 0 : 12,
		};
	});

	const toggleForm = () => {
		setIsFormVisible(!isFormVisible);
		formHeight.value = withSpring(isFormVisible ? 0 : 400, {
			damping: 20,
			stiffness: 90,
			mass: 0.5,
			velocity: 0.5,
		});

		if (!isFormVisible) {
			requestAnimationFrame(() => {
				formRef.current?.measureInWindow((x, y) => {
					scrollViewRef.current?.scrollTo({
						y: y - height / 2,
						animated: true,
					});
				});
			});
		}
	};

	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	const renderSettingItem = (
		icon: string,
		title: string,
		value: boolean,
		onValueChange: (value: boolean) => void
	) => (
		<View style={styles.settingItem}>
			<View style={styles.settingLeft}>
				<Ionicons name={icon as any} size={24} color={Colors.yellow} />
				<Text style={styles.settingText}>{title}</Text>
			</View>
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={{ false: '#E9ECEF', true: '#7C3AED' }}
				thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
			/>
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background, Colors.background2]}
				style={{ flex: 1 }}
			>
				<ScrollView ref={scrollViewRef} style={styles.content}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Preferences</Text>
						{renderSettingItem(
							'notifications-outline',
							'Notifications',
							notifications,
							setNotifications
						)}
						{renderSettingItem(
							'volume-medium-outline',
							'Sound',
							sound,
							setSound
						)}
						{renderSettingItem(
							'phone-portrait-outline',
							'Vibration',
							vibration,
							setVibration
						)}
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Account</Text>
						<TouchableOpacity style={styles.menuItem} onPress={toggleForm}>
							<View style={styles.settingLeft}>
								<Ionicons
									name='person-outline'
									size={24}
									color={Colors.yellow}
								/>
								<Text style={styles.settingText}>Edit Profile</Text>
							</View>
							<Ionicons
								name={isFormVisible ? 'chevron-down' : 'chevron-forward'}
								size={24}
								color={Colors.yellow}
							/>
						</TouchableOpacity>

						<Animated.View
							ref={formRef}
							style={[styles.formContainer, animatedStyles]}
						>
							<TextInput
								style={styles.input}
								placeholder='Name'
								placeholderTextColor={Colors.bg3}
								value={name}
								onChangeText={setName}
							/>
							<TextInput
								style={styles.input}
								placeholder='Email'
								placeholderTextColor={Colors.bg3}
								value={email}
								onChangeText={setEmail}
							/>
							<TextInput
								style={styles.input}
								placeholder='Username'
								placeholderTextColor={Colors.bg3}
								value={username}
								onChangeText={setUsername}
							/>

							<TouchableOpacity style={styles.saveButton}>
								<Text style={styles.saveButtonText}>Save Changes</Text>
							</TouchableOpacity>
						</Animated.View>

						<TouchableOpacity style={[styles.menuItem, styles.noBottomMargin]}>
							<View style={styles.settingLeft}>
								<Ionicons
									name='lock-closed-outline'
									size={24}
									color={Colors.yellow}
								/>
								<Text style={styles.settingText}>Change Password</Text>
							</View>
							<Ionicons
								name='chevron-forward'
								size={24}
								color={Colors.yellow}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity style={styles.logoutButton} onPress={logout}>
						<Text style={styles.logoutText}>Log Out</Text>
					</TouchableOpacity>
				</ScrollView>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 15,
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: Colors.white,
		marginBottom: 16,
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: Colors.grayLight,
		paddingVertical: 18,
		borderRadius: 12,
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	settingLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	settingText: {
		fontSize: 16,
		color: Colors.white,
		marginLeft: 12,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 18,
		backgroundColor: Colors.grayLight,
		borderRadius: 12,
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	logoutButton: {
		backgroundColor: Colors.red1,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 'auto',
	},
	logoutText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	formContainer: {
		backgroundColor: Colors.grayLight,
		borderRadius: 12,
		padding: 16,
		marginTop: 8,
	},
	avatarContainer: {
		alignItems: 'center',
		marginBottom: 16,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 8,
	},
	changeAvatarButton: {
		padding: 8,
	},
	changeAvatarText: {
		color: Colors.yellow,
		fontSize: 14,
	},
	input: {
		backgroundColor: Colors.background,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		color: Colors.white,
		fontSize: 16,
	},
	saveButton: {
		backgroundColor: Colors.yellow,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	saveButtonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: '600',
	},
	noBottomMargin: {
		marginBottom: 0,
	},
});
