import React from 'react';
import { Alert } from 'react-native';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext'; // import context
import AuthForm from '../../components/AuthForm';
import AuthBackground from '../../components/AuthBackground';
import AuthScreenWrapper from '../../components/AuthScreenWrapper';
import { login } from '../../Services/Auth/AuthService'; // still needed for manual login
import { useRouter } from 'expo-router';

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth(); // get context user if needed

  const handleForgotPassword = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address first.');
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, trimmedEmail);
      Alert.alert('Success', `Password reset email sent to ${trimmedEmail}. Check your inbox (and spam folder) for instructions to change your password.`);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email.');
    }
  };
  const handleSignIn = async ({ email, password }: any) => {

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {

      await login(email, password);

      Alert.alert('Success', 'Signed in successfully!');
      router.replace('/MainPage');
    } catch (error: any) {
      Alert.alert('Sign In Failed', 'Invalid email or password.');
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
          onForgotPassword={handleForgotPassword}
        />
      </AuthScreenWrapper>
    </AuthBackground>
  );
}
