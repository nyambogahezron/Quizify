import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useThemeStore';

interface NotificationProps {
  title: string;
  message: string;
  type: 'level_up' | 'achievement' | 'daily_task' | 'system';
  isRead: boolean;
  onPress: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  type,
  isRead,
  onPress,
}) => {
  const { colors } = useTheme();

  const getIconName = () => {
    switch (type) {
      case 'level_up':
        return 'trophy';
      case 'achievement':
        return 'medal';
      case 'daily_task':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isRead ? colors.background : colors.primaryLight,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIconName()}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
      {!isRead && (
        <View
          style={[
            styles.unreadDot,
            { backgroundColor: colors.primary },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
}); 