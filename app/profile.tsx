import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withSpring,
  interpolateColor,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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

// --- Reusable Animated Shape Component ---
const FloatingShape = ({
  style,
  color,
  duration = 10000,
  delay = 0,
}: {
  style?: object;
  color: string;
  duration?: number;
  delay?: number;
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]} />;
};

export default function ProfilePage() {
  const router = useRouter();
  const { logoutUser, user } = useAuth();
  const backgroundProgress = useSharedValue(0);
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

  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  const animatedCardStyle = useStaggeredAnimation(200);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'My Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <AnimatedLinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#eaf3fa', '#d9e8f5']}
        animatedProps={animatedGradientProps}
      />

      <FloatingShape style={styles.shape1} color="rgba(147, 197, 253, 0.3)" duration={12000} />
      <FloatingShape style={styles.shape2} color="rgba(165, 214, 255, 0.3)" duration={10000} delay={1000} />
      <FloatingShape style={styles.shape3} color="rgba(191, 219, 254, 0.3)" duration={14000} delay={500} />

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
              onPress={() => router.push('/edit-profile')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  // Header
  headerBackground: { flex: 1 },
  headerTitle: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 20,
  },
  backButton: {
    marginLeft: 16,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
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
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
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
    color: '#475569',
    fontWeight: '500',
  },
  signOutRow: {
    backgroundColor: '#fee2e2',
    marginTop: 20, // Add extra space before the sign out button
  },
  signOutLabel: {
    color: '#dc2626',
    fontWeight: '600',
  },
  // Shapes
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 200, height: 200, top: '10%', left: -80 },
  shape2: { width: 150, height: 150, bottom: '15%', right: -60 },
  shape3: { width: 100, height: 100, top: '60%', left: 20 },
});