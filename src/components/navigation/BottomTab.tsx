import { StyleSheet, View } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../screen/HomeScreen';
import LeaderboardScreen from '../../screen/LeaderboardScreen';
import BookmarksScreen from '../../screen/BookmarksScreen';
import SettingsScreen from '../../screen/SettingsScreen';

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const { colors } = useTheme();
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
    <View style={{ flexDirection: 'row' }}>
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
          >
            <View style={styles.container}>
              <View
                style={[
                  styles.wrapper,
                  {
                    backgroundColor: isFocused ? colors.primary : 'transparent',
                  },
                ]}
              />
              {icons[route.name](
                isFocused
                  ? { size: 24, color: colors.primary, focused: true }
                  : { size: 24, color: '#fff', focused: false }
              )}
              <Text
                style={{
                  color: isFocused ? colors.primary : '#fff',
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {label}
              </Text>
            </View>
          </PlatformPressable>
        );
      })}
    </View>
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
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Leaderboard' component={LeaderboardScreen} />
      <Tab.Screen name='Bookmarks' component={BookmarksScreen} />
      <Tab.Screen name='Settings' component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: '#444',
  },
  wrapper: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
});
