import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnBoard'>;
};

const slides = [
  {
    id: 1,
    title: 'Welcome to QuizMaster',
    description:
      'Embark on a journey of knowledge and fun with our interactive quiz platform.',
    icon: '🎯',
  },
  {
    id: 2,
    title: 'Learn & Compete',
    description:
      'Challenge yourself with various quiz categories, track your progress, and compete with friends.',
    icon: '🏆',
  },
  {
    id: 3,
    title: 'User Agreement',
    description:
      'By continuing, you agree to our Terms of Service and Privacy Policy. We value your privacy and ensure your data is protected.',
    icon: '📜',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const translateX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rSlideStyles = slides.map((_, index) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    return useAnimatedStyle(() => {
      const scale = interpolate(
        -translateX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        -translateX.value,
        inputRange,
        [0.4, 1, 0.4],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });
  });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const newValue = -activeIndex * SCREEN_WIDTH + event.translationX;
      translateX.value = newValue;
    })
    .onEnd((event) => {
      const direction = event.velocityX > 0 ? -1 : 1;
      const shouldSwipe =
        Math.abs(event.velocityX) > 500 ||
        Math.abs(event.translationX) > SCREEN_WIDTH / 3;

      let newIndex = activeIndex;
      if (shouldSwipe) {
        newIndex = Math.max(
          0,
          Math.min(slides.length - 1, activeIndex + direction)
        );
      }

      translateX.value = withSpring(-newIndex * SCREEN_WIDTH, {
        velocity: event.velocityX,
        damping: 20,
      });
      setActiveIndex(newIndex);
    });

  const handleGetStarted = () => {
    // Navigate to main app
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.slidesContainer, rStyle]}>
          {slides.map((slide, index) => {
            return (
              <Animated.View
                key={slide.id}
                style={[styles.slide, rSlideStyles[index]]}
              >
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
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              const newIndex = activeIndex + 1;
              translateX.value = withSpring(-newIndex * SCREEN_WIDTH);
              setActiveIndex(newIndex);
            }}
          >
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
    backgroundColor: 'white',
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
    backgroundColor: '#7C3AED',
    width: 20,
  },
  nextButton: {
    backgroundColor: '#7C3AED',
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
