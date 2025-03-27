import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextProvider } from 'context/ConxtextProvider';
import Navigation from './navigation';
import { socketService } from './lib/socket';
import { useAuthStore } from './store/useStore';
import { StatusBar } from 'react-native';
import Colors from './constants/Colors';

SplashScreen.preventAutoHideAsync();

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
});

export default function App() {
	const [appIsReady, setAppIsReady] = React.useState(false);
	const { isAuthenticated, initialize } = useAuthStore();

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
			<StatusBar barStyle='light-content' backgroundColor={Colors.background} />
			<GestureHandlerRootView onLayout={onLayoutRootView}>
				<ContextProvider>
					<Navigation />
				</ContextProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
