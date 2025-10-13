import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session/providers/google';

type AuthFormProps = {
  title: string;
  subtitle: string;
  isSignUp?: boolean;
  onSubmit: (data: any) => Promise<void>;
  onSwitch: () => void;
  switchTextPart1: string;
  switchTextPart2: string;
  submitText: string;
};

export default function AuthForm({
  title,
  subtitle,
  isSignUp,
  onSubmit,
  onSwitch,
  switchTextPart1,
  switchTextPart2,
  submitText,
}: AuthFormProps) {
  WebBrowser.maybeCompleteAuthSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // const [request, response, promptAsync] = useAuthRequest({
  //   androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  //   iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  // });

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     if (authentication) {
  //       console.log('Google Access Token:', authentication.accessToken);
  //       // You can now use the accessToken to sign in the user or fetch profile info
  //     }
  //   }
  // }, [response]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = isSignUp ? { name, email, password } : { email, password };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        {isSignUp && (
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Enter full name" value={name} onChangeText={setName} />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#AEAEAE" />
          </TouchableOpacity>
        </View>

        {!isSignUp && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.gradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{submitText}</Text>}
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.signInWithText}>Sign in with</Text>

        <View style={styles.socialContainer}>            
            <TouchableOpacity
              style={styles.socialButton}
              // disabled={!request}
              // onPress={() => promptAsync()}
            >
                <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={styles.socialIcon} />
            </TouchableOpacity>            
        </View>

        <TouchableOpacity style={styles.switchContainer} onPress={onSwitch}>
          <Text style={styles.switchText}>{switchTextPart1} </Text>
          <Text style={[styles.switchText, styles.switchLink]}>{switchTextPart2}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 25,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordContainer: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: 20,
  },
  forgotPasswordText: {
      color: '#3b82f6',
      fontSize: 14,
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#60a5fa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
    fontWeight: 'bold',
  },
  signInWithText: {
      fontSize: 14,
      color: '#AEAEAE',
      marginVertical: 30,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#F7F7F7',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 15,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    marginTop: 'auto', // Pushes to the bottom
    paddingBottom: 10,
  },
  switchText: {
    color: '#666',
    fontSize: 16,
  },
  switchLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});