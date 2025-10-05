import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthForm from '../components/AuthForm';
import AuthBackground from '../components/AuthBackground';
import AuthScreenWrapper from '../components/AuthScreenWrapper';

export default function SignUp() {
  const router = useRouter();

  const handleSignUp = async (data: any) => {
    const { name, email, password } = data;

    // Basic validation
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    // Simulate API call
    try {
      // Replace with your actual sign-up API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Alert.alert('Success', 'Account created successfully! Please log in.');
      router.replace('/sign-in');
    } catch (error) {
      // You can handle specific errors here, e.g., email already exists
      Alert.alert('Sign Up Failed', 'Could not create an account. Please try again.');
    }
  };

  return (
    <AuthBackground contentHeight="85%">
      <AuthScreenWrapper>
        <AuthForm
          title="Create Your Account"
          subtitle="We're here to help you reach the peaks of learning. Are you ready?"
          isSignUp={true}
          onSubmit={handleSignUp}
          onSwitch={() => router.replace('/sign-in')}
          switchTextPart1="Already have an account?"
          switchTextPart2="Log In"
          submitText="Get Started"
        />
      </AuthScreenWrapper>
    </AuthBackground>
  );
}