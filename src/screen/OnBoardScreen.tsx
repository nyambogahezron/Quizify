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
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { slides } from '../lib/data';
import { slidesProps } from '../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnBoard'>;
};

export default function OnboardingScreen({ navigation }: Props) {
  const translateX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [slidesData, setSlidesData] = React.useState<slidesProps>();

  React.useEffect(() => {
    setSlidesData(slides[activeIndex]);
  }, [activeIndex]);

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
      setActiveIndex(activeIndex + 1);
    }
  };

  const onBack = () => {
    const isFirstSlide = activeIndex === 0;

    if (!isFirstSlide) {
      setActiveIndex(activeIndex - 1);
    }
    endOnboarding();
  };

  const onSkip = () => {
    endOnboarding();
  };

  const onSwipe = Gesture.Simultaneous(
    Gesture.Fling().direction(Directions.LEFT).onEnd(onContinue),
    Gesture.Fling().direction(Directions.RIGHT).onEnd(onBack)
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#8B5CF6' />
      <GestureDetector gesture={onSwipe}>
        <Animated.View style={[styles.slidesContainer]}>
          {/* skip btn */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 15,
              right: 25,
              zIndex: 999,
            }}
          >
            <AntDesign
              name='rightcircleo'
              size={30}
              color='#fff'
              onPress={() => onSkip()}
            />
          </Animated.View>
          {slidesData && (
            <Animated.View key={slidesData.id} style={[styles.slide]}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.gradientContainer}
              >
                <View style={styles.content}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{slidesData.icon}</Text>
                  </View>
                  <Text style={styles.title}>{slidesData.title}</Text>
                  <Text style={styles.description}>
                    {slidesData.description}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
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
    position: 'relative',
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
    backgroundColor: '#8B5CF6',
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
