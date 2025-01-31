import { Dimensions, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeSlide() {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.content}>
        {/* Lottie Animation */}
        <LottieView
          source={require('@assets/QuizAnimation.json')}
          autoPlay
          loop
          speed={0.8}
          style={styles.animation}
        />

        <Animated.Text entering={FadeInDown.delay(200)} style={styles.title}>
          Welcome to Quizify
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(300)}
          style={styles.description}
        >
          🧠 Sharpen your mind, one question at a time!
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  animation: {
    width: width * 0.8,
    height: height * 0.3,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Rb-bold',
    color: Colors.yellow,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: 'Rb-Regular',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
    marginTop: 2,
  },
});
