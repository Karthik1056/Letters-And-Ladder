import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthForm from '../components/AuthForm';
import AuthBackground from '../components/AuthBackground';
import AuthScreenWrapper from '../components/AuthScreenWrapper';

export default function SignIn() {
  const router = useRouter();

  const handleSignIn = async (data: any) => {
    const { email, password } = data;

    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    // Simulate API call
    try {
      // Replace with your actual sign-in API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Alert.alert('Success', 'Signed in successfully!');
      router.replace('/SelectionPage');
    } catch (error) {
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
    }
  };

  return (
    <AuthBackground>
      <AuthScreenWrapper>
        <AuthForm
          title="Welcome Back"
          subtitle="Ready to continue your learning journey? Your path is right here."
          onSubmit={handleSignIn}
          onSwitch={() => router.replace('/sign-up')}
          switchTextPart1="Don't have an account?"
          switchTextPart2="Sign Up"
          submitText="Log In"
        />
      </AuthScreenWrapper>
    </AuthBackground>
  );
}