import { StyleSheet, View } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import SCREENS from 'screen';
import Colors from 'constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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
		Games: (props) => (
			<Ionicons
				name={props.focused ? 'game-controller' : 'game-controller-outline'}
				{...props}
			/>
		),
		Leaderboard: (props) => (
			<Ionicons name={props.focused ? 'trophy' : 'trophy-outline'} {...props} />
		),

		Profile: (props) => (
			<FontAwesome5 name={props.focused ? 'user-alt' : 'user'} {...props} />
		),
	};

	return (
		<LinearGradient
			style={styles.wrapper}
			colors={[Colors.background2, Colors.background]}
		>
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
									? { size: 18, color: Colors.success, focused: true }
									: { size: 18, color: Colors.white, focused: false }
							)}
							<Text
								style={[
									{
										color: isFocused ? Colors.dark : Colors.white,
										fontSize: 10,
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
		</LinearGradient>
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
			<Tab.Screen
				name='Games'
				component={SCREENS.Gamelist}
				options={{
					headerShown: true,
					headerTitle: 'Game List',
					headerStyle: { backgroundColor: Colors.background3 },
					headerTitleStyle: { color: Colors.white },
					headerTintColor: Colors.white,
					headerBackButtonDisplayMode: 'minimal',
				}}
			/>
			<Tab.Screen name='Leaderboard' component={SCREENS.LeaderboardScreen} />
			<Tab.Screen
				name='Profile'
				component={SCREENS.ProfileScreen}
				options={{
					headerShown: false,
				}}
			/>
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		bottom: 0,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		width: '100%',
		marginHorizontal: 'auto',
		overflow: 'hidden',
	},
	tabs: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 60,
		width: '100%',
		borderRadius: 30,
	},
	textFocused: {
		color: Colors.success,
		fontWeight: 'bold',
	},
});
