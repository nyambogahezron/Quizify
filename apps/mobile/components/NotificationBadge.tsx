import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../store/useThemeStore';
import { api } from '../services/api';

export const NotificationBadge: React.FC = () => {
  const { colors } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.primary,
        },
      ]}
    >
      <Text style={styles.text}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 