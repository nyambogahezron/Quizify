import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { slides } from '../lib/data';

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
    navigation.navigate('MainTabs');
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
    Gesture.Fling().direction(Directions.LEFT).onEnd(onContinue),
    Gesture.Fling().direction(Directions.RIGHT).onEnd(onBack)
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#8B5CF6' />
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
              <Animated.View key={slide.id} style={[styles.slide, { opacity }]}>
                {/* skip btn */}
                <Animated.View style={styles.skipIcon}>
                  <AntDesign
                    name='rightcircleo'
                    size={30}
                    color='#fff'
                    onPress={() => onSkip()}
                  />
                </Animated.View>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.gradientContainer}
                >
                  <View style={styles.content}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>{slide.icon}</Text>
                    </View>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.description}>{slide.description}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </Animated.View>
      </GestureDetector>
      {/* footer  */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {activeIndex === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={onContinue}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name='arrow-forward' size={20} color='white' />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: '80%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 48,
  },
  skipIcon: {
    position: 'absolute',
    top: 15,
    right: 25,
    zIndex: 999,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: '#7C3AED',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#8B5CF6',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  getStartedButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
