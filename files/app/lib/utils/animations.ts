import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';

// Fade in animation
export const fadeIn = (value: Animated.Value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    easing: Easing.ease,
  });
};

// Fade out animation
export const fadeOut = (value: Animated.Value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    easing: Easing.ease,
  });
};

// Scale animation
export const scale = (value: Animated.Value, toValue: number, duration = 300) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.elastic(1),
  });
};

// Slide in from bottom
export const slideInFromBottom = (value: Animated.Value, duration = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

// Slide out to bottom
export const slideOutToBottom = (value: Animated.Value, toValue: number, duration = 300) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.in(Easing.cubic),
  });
};

// Shake animation
export const shake = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
  ]);
};

// Pulse animation
export const pulse = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
  ]);
};

// Haptic feedback functions
export const triggerHapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};