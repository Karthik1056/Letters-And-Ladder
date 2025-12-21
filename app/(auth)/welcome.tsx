import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AuthBackground from '../../components/AuthBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthIndex() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'CustomFont': require('../../assets/fonts/OpenDyslexic-Regular.otf'),
    'CustomFont-Bold': require('../../assets/fonts/OpenDyslexic-Bold.otf'),
  });

  if (!fontsLoaded) {
    return (
      <AuthBackground withContentContainer={false}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </AuthBackground>
    );
  }

  return (
    <AuthBackground withContentContainer={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Letters & Ladders</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/sign-in')}>
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.gradient}>
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={[styles.buttonText, styles.signUpButtonText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'CustomFont-Bold',
    color: '#3b82f6',
    opacity: 0.9,
    marginTop: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 14,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'CustomFont-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  signUpButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#3b82f6',
  },
});