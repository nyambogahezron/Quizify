import { StyleSheet, View } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import SCREENS from 'screen';
import Colors from 'constants/Colors';

type tabProps = {
	state: any;
	descriptors: any;
	navigation: any;
};

export function BottomTabBar({ state, descriptors, navigation }: tabProps) {
	const { buildHref } = useLinkBuilder();

	type tabBarIcon = {
		[key: string]: (props: any) => JSX.Element;
	};
	const icons: tabBarIcon = {
		Home: (props) => <AntDesign name={'home'} {...props} />,
		Leaderboard: (props) => (
			<Ionicons name={props.focused ? 'trophy' : 'trophy-outline'} {...props} />
		),
		Bookmarks: (props) => (
			<Ionicons
				name={props.focused ? 'bookmark' : 'bookmark-outline'}
				{...props}
			/>
		),
		Settings: (props) => (
			<Ionicons
				name={props.focused ? 'settings' : 'settings-outline'}
				{...props}
			/>
		),
	};

	return (
		<BlurView intensity={10} style={styles.wrapper}>
			{/* Wrap with BlurView */}
			{state.routes.map((route: any, index: number) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
						? options.title
						: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: 'tabLongPress',
						target: route.key,
					});
				};

				return (
					<PlatformPressable
						key={route.key}
						href={buildHref(route.name, route.params)}
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarButtonTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						style={{ flex: 1 }}
						android_ripple={{ color: Colors.yellow, radius: 0 }} // Change ripple color and radius
					>
						<View style={styles.tabs}>
							{icons[route.name](
								isFocused
									? { size: 24, color: Colors.blue, focused: true }
									: { size: 24, color: Colors.white, focused: false }
							)}
							<Text
								style={[
									{
										color: isFocused ? Colors.dark : Colors.white,
										fontSize: 12,
										marginTop: 3,
									},
									isFocused && styles.textFocused,
								]}
							>
								{label}
							</Text>
						</View>
					</PlatformPressable>
				);
			})}
		</BlurView>
	);
}

export function BottomTabNavigation() {
	const Tab = createBottomTabNavigator();
	return (
		<Tab.Navigator
			tabBar={(props) => <BottomTabBar {...props} />}
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					backgroundColor: Colors.background2,
				},
			})}
		>
			<Tab.Screen name='Home' component={SCREENS.HomeScreen} />
			<Tab.Screen name='Leaderboard' component={SCREENS.LeaderboardScreen} />
			<Tab.Screen name='Bookmarks' component={SCREENS.BookmarksScreen} />
			<Tab.Screen name='Settings' component={SCREENS.SettingsScreen} />
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		bottom: 0,
		left: '3%',
		right: '3%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#385952',
		borderRadius: 25,
		marginBottom: 15,
		width: '94%',
		marginHorizontal: 'auto',
		overflow: 'hidden',
	},
	tabs: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 60,
		width: '100%',
		borderRadius: 25,
	},
	textFocused: {
		color: Colors.blue,
		fontWeight: 'bold',
	},
});
