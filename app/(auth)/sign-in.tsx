import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; // ✅ import context
import AuthForm from '../../components/AuthForm';
import AuthBackground from '../../components/AuthBackground';
import AuthScreenWrapper from '../../components/AuthScreenWrapper';
import { login } from '../../Services/AuthService'; // still needed for manual login

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth(); // get context user if needed

  const handleSignIn = async (data: any) => {
    const { email, password } = data;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {

      const loggedInUser = await login(email, password);

      Alert.alert('Success', 'Signed in successfully!');
      router.replace('/'); 
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
        />
      </AuthScreenWrapper>
    </AuthBackground>
  );
}
