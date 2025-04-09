import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	ScrollView,
	TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from 'constants/Colors';
import { useAuthStore } from '@/store/useStore';

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
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<ScrollView style={styles.content}>
					<View>
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

					<View>
						<Text style={styles.sectionTitle}>Account</Text>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => setIsFormVisible(!isFormVisible)}
						>
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

						{isFormVisible && (
							<View style={styles.formContainer}>
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
							</View>
						)}

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

				{/* app info */}
				<View style={styles.appInfo}>
					<Text style={styles.appInfoText}>App Version 1.0.0</Text>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 10,
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
		backgroundColor: Colors.background2,
		paddingVertical: 10,
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
		backgroundColor: Colors.background2,
		borderRadius: 12,
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	logoutButton: {
		backgroundColor: Colors.red1,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 30,
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
	appInfo: {
		padding: 13,
		alignItems: 'center',
	},
	appInfoText: {
		color: Colors.white,
		fontSize: 13,
		fontWeight: '600',
	},
});
