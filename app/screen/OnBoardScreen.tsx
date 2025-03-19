import React from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { slides } from '../lib/data';
import OnBoard from 'components/onBoard';
import SlidesFooter from 'components/onBoard/SlidesFooter';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '.';
import Colors from 'constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnBoard'>;
};

export default function OnboardingScreen({ navigation }: Props) {
  const translateX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleGetStarted = () => {
    navigation.replace('MainTabs');
  };

  const endOnboarding = () => {
    setActiveIndex(0);
    navigation.navigate('Login');
  };

  const onContinue = () => {
    const isLastSlide = activeIndex === slides.length - 1;

    if (isLastSlide) {
      endOnboarding();
    } else {
      const newIndex = activeIndex + 1;
      translateX.value = withTiming(-newIndex * SCREEN_WIDTH, {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
      });
      setActiveIndex(newIndex);
    }
  };

  const onBack = () => {
    const isFirstSlide = activeIndex === 0;

    if (!isFirstSlide) {
      const newIndex = activeIndex - 1;
      translateX.value = withTiming(-newIndex * SCREEN_WIDTH, {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
      });
      setActiveIndex(newIndex);
    }
  };

  const onSkip = () => {
    endOnboarding();
  };

  const onSwipe = Gesture.Simultaneous(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        'worklet';
        runOnJS(onContinue)();
      }),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        'worklet';
        runOnJS(onBack)();
      })
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={Colors.background} />
      <LinearGradient
        colors={[Colors.background, Colors.background2]}
        style={styles.container}
      >
        <GestureDetector gesture={onSwipe}>
          <Animated.View style={[styles.slidesContainer, animatedStyle]}>
            {slides.map((slide, index) => {
              const opacity = interpolate(
                translateX.value,
                [
                  (index - 1) * -SCREEN_WIDTH,
                  index * -SCREEN_WIDTH,
                  (index + 1) * -SCREEN_WIDTH,
                ],
                [0, 1, 0],
                Extrapolation.CLAMP
              );

              return (
                <Animated.View
                  key={slide.id}
                  style={[styles.slide, { opacity }]}
                >
                  {/* skip btn */}
                  <Animated.View style={styles.skipIcon}>
                    <AntDesign
                      name='rightcircleo'
                      size={30}
                      color='#fff'
                      onPress={() => onSkip()}
                    />
                  </Animated.View>
                  <OnBoard slideKey={slide.key} />
                </Animated.View>
              );
            })}
          </Animated.View>
        </GestureDetector>
        {/* footer  */}
        <SlidesFooter slides={slides} activeIndex={activeIndex} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * slides.length,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  skipIcon: {
    position: 'absolute',
    top: 15,
    right: 25,
    zIndex: 999,
  },
});
