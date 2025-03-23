import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { ContextProvider } from 'context/ConxtextProvider';
import Navigation from './navigation';

SplashScreen.preventAutoHideAsync();

export default function App() {
	const [appIsReady, setAppIsReady] = React.useState(false);

	React.useEffect(() => {
		async function prepare() {
			try {
				await Font.loadAsync({
					'Rb-bold': require('./assets/fonts/RobotoCondensed-Bold.ttf'),
					'Rb-regular': require('./assets/fonts/RobotoCondensed-Regular.ttf'),
					'Rb-medium': require('./assets/fonts/RobotoCondensed-Medium.ttf'),
				});
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
				await SplashScreen.hideAsync();
			}
		}
		prepare();
	}, []);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady) {
			SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	if (!appIsReady) {
		return null;
	}

	return (
		<GestureHandlerRootView onLayout={onLayoutRootView}>
			<ContextProvider>
				<Navigation />
			</ContextProvider>
		</GestureHandlerRootView>
	);
}
