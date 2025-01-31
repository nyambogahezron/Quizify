import Colors from '@/constants/Colors';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoSlide() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/icon.png')} style={styles.icon} />
        </View>
        <Text style={styles.title}>GET STARTED</Text>
        <Text style={styles.description}>
          Learn how to use Quizify and get the most out of it.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: Colors.grayLight,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  title: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: 'Rb-bold',
    color: Colors.yellow,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    color: Colors.white,
    fontFamily: 'Rb-regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
