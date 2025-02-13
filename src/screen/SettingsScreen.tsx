import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
	const [notifications, setNotifications] = React.useState(true);
	const [sound, setSound] = React.useState(true);
	const [vibration, setVibration] = React.useState(true);

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
				style={styles.container}
			>
				<ScrollView style={styles.content}>
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
						<TouchableOpacity style={styles.menuItem}>
							<View style={styles.settingLeft}>
								<Ionicons
									name='person-outline'
									size={24}
									color={Colors.yellow}
								/>
								<Text style={styles.settingText}>Edit Profile</Text>
							</View>
							<Ionicons
								name='chevron-forward'
								size={24}
								color={Colors.yellow}
							/>
						</TouchableOpacity>
						<TouchableOpacity style={styles.menuItem}>
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

					<TouchableOpacity style={styles.logoutButton}>
						<Text style={styles.logoutText}>Log Out</Text>
					</TouchableOpacity>
				</ScrollView>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		marginTop: 20,
		padding: 15,
		marginBottom: 70,
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
});
