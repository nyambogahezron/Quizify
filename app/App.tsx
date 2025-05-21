import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import Navigation from './navigation';
import { socketService } from './lib/socket';
import { useAuthStore } from './store/useStore';
import { StatusBar } from 'react-native';
import { queryClient } from './lib/queryClient';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import LevelUpModal from './components/LevelUpModal';
import { useLevelUp } from './hooks/useLevelUp';

import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated';
import Colors from './constants/Colors';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function App() {
	const [appIsReady, setAppIsReady] = React.useState(false);
	const [showSessionExpired, setShowSessionExpired] = React.useState(false);
	const { isAuthenticated, initialize, logout } = useAuthStore();
	const { isLevelUpVisible, levelUpData, handleCloseLevelUp } = useLevelUp();

	React.useEffect(() => {
		async function prepare() {
			try {
				await Font.loadAsync({
					'Rb-bold': require('./assets/fonts/RobotoCondensed-Bold.ttf'),
					'Rb-regular': require('./assets/fonts/RobotoCondensed-Regular.ttf'),
					'Rb-medium': require('./assets/fonts/RobotoCondensed-Medium.ttf'),
				});
				await initialize();
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
				await SplashScreen.hideAsync();
			}
		}
		prepare();
	}, [initialize]);

	React.useEffect(() => {
		if (isAuthenticated) {
			socketService.connect();
		} else {
			socketService.disconnect();
		}

		return () => {
			socketService.disconnect();
		};
	}, [isAuthenticated]);

	React.useEffect(() => {
		socketService.onSessionExpire(() => {
			setShowSessionExpired(true);
			logout();
		});
	}, [logout]);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady) {
			SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	if (!appIsReady) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<StatusBar
				barStyle='light-content'
				backgroundColor={Colors.background3}
			/>
			<GestureHandlerRootView onLayout={onLayoutRootView}>
				<Navigation />
				<SessionExpiredModal
					visible={showSessionExpired}
					onClose={() => setShowSessionExpired(false)}
				/>
				<LevelUpModal
					isVisible={isLevelUpVisible}
					newLevel={levelUpData?.newLevel || 0}
					previousLevel={levelUpData?.previousLevel || 0}
					onClose={handleCloseLevelUp}
				/>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
