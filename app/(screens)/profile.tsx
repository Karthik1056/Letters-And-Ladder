import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../../components/AnimatedBackground';

// --- Custom Hook for Staggered Animation ---
const useStaggeredAnimation = (delay: number) => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) })
    );
  }, []);

  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform: [{ scale: animationProgress.value }],
  }));
};

export default function ProfilePage() {
  const router = useRouter();
  const { logoutUser, user } = useAuth();
  const buttonScale = useSharedValue(1);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      // Replace the stack with the sign-in screen so the user can't go back.
      router.replace('/sign-in');
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };

  const animatedCardStyle = useStaggeredAnimation(200);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <AnimatedBackground>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.headerTitle}>My Profile</Text>,
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/MainPage')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={90} color="#3b82f6" />
            <Text style={styles.userName}>{user?.name ?? 'User Name'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? 'user@example.com'}</Text>
          </View>

          {/* Action List */}
          <View style={styles.actionList}>
            {/* Edit Name Row */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="person-outline" size={22} color="#475569" style={styles.actionIcon} />
                <Text style={styles.actionLabel}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={22} color="#9ca3af" />
            </TouchableOpacity>

            {/* Sign Out Row */}
            <TouchableOpacity
              style={[styles.actionRow, styles.signOutRow]}
              onPress={handleSignOut}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="log-out-outline" size={22} color="#dc2626" style={styles.actionIcon} />
                <Text style={[styles.actionLabel, styles.signOutLabel]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  // Header
  headerBackground: { flex: 1 },
  headerTitle: {
    fontFamily: 'CustomFont-Bold',
    color: '#fff',
    fontSize: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  backButton: {
    marginLeft: 16,
    marginTop: -4,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'CustomFont-Bold',
    color: '#1e293b',
    marginTop: 12,
    includeFontPadding: false,
  },
  userEmail: {
    fontFamily: 'CustomFont-Regular',
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    includeFontPadding: false,
  },
  actionList: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 17,
    fontFamily: 'CustomFont-Regular',
    color: '#475569',
    includeFontPadding: false,
  },
  signOutRow: {
    backgroundColor: '#fee2e2',
    marginTop: 20, // Add extra space before the sign out button
  },
  signOutLabel: {
    fontFamily: 'CustomFont-Bold',
    color: '#dc2626',
    includeFontPadding: false,
  },
});