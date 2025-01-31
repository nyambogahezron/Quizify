import Colors from '@/constants/Colors';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const width = Dimensions.get('window').width;
interface UserAgreementSlideProps {
  getStarted: () => void;
}

export default function UserAgreementSlide({
  getStarted,
}: UserAgreementSlideProps) {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckboxToggle = () => {
    setIsChecked(!isChecked);
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📜</Text>
        </View>
        <Text style={styles.title}>USER AGREEMENT</Text>
        <Text style={styles.description}>
          By getting started, you agree to our
          <Text
            style={{ color: Colors.yellow, textDecorationLine: 'underline' }}
          >
            {' '}
            Terms of Service{' '}
          </Text>
          and{' '}
          <Text
            style={{ color: Colors.yellow, textDecorationLine: 'underline' }}
          >
            {' '}
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {/* agreement checkbox */}
      <View style={styles.checkboxContainer}>
        <Text style={{ color: Colors.white, fontSize: 18 }}>
          Agree to terms and conditions
        </Text>

        <TouchableOpacity
          style={[styles.checkbox, isChecked && styles.checkboxChecked]}
          onPress={handleCheckboxToggle}
        >
          {isChecked && <Text style={styles.checkboxIcon}>✔️</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.getStartedButton,
          !isChecked && {
            opacity: 0.5,
            borderColor: Colors.white,
            backgroundColor: Colors.grayLight,
          },
        ]}
        disabled={!isChecked}
        onPress={() => getStarted()}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: -60,
  },
  content: {
    position: 'relative',
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
    color: Colors.yellow,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Rb-bold',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  getStartedButton: {
    position: 'absolute',
    bottom: 20,
    width: width * 0.8,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.yellow,
  },
  getStartedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.yellow,
  },
  checkboxIcon: {
    color: Colors.yellow,
    fontSize: 10,
  },
});
