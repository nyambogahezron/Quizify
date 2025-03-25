import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigation } from 'components/navigation/BottomTab';
import SCREENS, { RootStackParamList } from 'screen';
import Colors from 'constants/Colors';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/useStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
	const { isAuthenticated } = useAuthStore();
	const isFirstTime = false;

	return (
		<NavigationContainer>
			{isAuthenticated ? (
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
					}}
					initialRouteName='MainTabs'
				>
					<Stack.Screen
						name='MainTabs'
						component={BottomTabNavigation}
						options={{
							statusBarBackgroundColor: Colors.background,
							statusBarStyle: 'light',
							contentStyle: {
								backgroundColor: Colors.background2,
							},
						}}
					/>
					<Stack.Screen name='Quiz' component={SCREENS.QuizScreen} />
					<Stack.Screen name='Result' component={SCREENS.ResultScreen} />
					<Stack.Screen
						name='Profile'
						component={SCREENS.ProfileScreen}
						options={{
							headerShown: true,
							headerTitle: 'Profile',
							headerStyle: { backgroundColor: Colors.background },
							headerTitleStyle: { color: Colors.white },
							headerTintColor: Colors.white,
						}}
					/>
					<Stack.Screen
						name='Bookmark'
						component={SCREENS.BookmarksScreen}
						options={{
							headerShown: true,
							headerTitle: 'Bookmarks',
							headerStyle: { backgroundColor: Colors.background },
							headerTitleStyle: { color: Colors.white },
							headerTintColor: Colors.white,
						}}
					/>
					<Stack.Screen
						name='Settings'
						component={SCREENS.SettingsScreen}
						options={{
							headerShown: true,
							headerTitle: 'Settings',
							headerStyle: { backgroundColor: Colors.background },
							headerTitleStyle: { color: Colors.white },
							headerTintColor: Colors.white,
						}}
					/>
					<Stack.Screen
						name='Leaderboard'
						component={SCREENS.LeaderboardScreen}
					/>
					<Stack.Screen name='WordGame' component={SCREENS.WordMakerScreen} />
					<Stack.Screen
						name='QuizList'
						component={SCREENS.QuizList}
						options={{
							headerShown: true,
							headerTitle: 'Quiz List',
							headerStyle: { backgroundColor: Colors.background },
							headerTitleStyle: { color: Colors.white },
							headerTintColor: Colors.white,
						}}
					/>

					<Stack.Screen
						name='DailyTasks'
						component={SCREENS.DailyTasksScreen}
					/>
				</Stack.Navigator>
			) : (
				<Stack.Navigator>
					{isFirstTime ? (
						<Stack.Screen name='OnBoard' component={SCREENS.OnboardingScreen} />
					) : (
						<>
							<Stack.Screen
								name='Login'
								component={SCREENS.LoginScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name='Register'
								component={SCREENS.RegisterScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name='ForgotPassword'
								component={SCREENS.ForgotPasswordScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name='ResetPassword'
								component={SCREENS.ResetPasswordScreen}
								options={{ headerShown: false }}
							/>
						</>
					)}
				</Stack.Navigator>
			)}
		</NavigationContainer>
	);
}
