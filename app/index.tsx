import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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
const useStaggeredAnimation = (delay: number, from: 'bottom' | 'top' | 'scale' = 'scale') => {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) }));
  }, []);

  return useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    transform:
      from === 'scale'
        ? [{ scale: animationProgress.value }]
        : [{ translateY: (1 - animationProgress.value) * (from === 'bottom' ? 20 : -20) }],
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

  return (
    <Animated.View
      style={[styles.shapeBase, style, { backgroundColor: color }, animatedStyle]}
    />
  );
};

// --- Mock Data ---
const mockProgressData = [
  { id: '1', subject: 'English', progress: 75, icon: 'book-outline' as const, color: '#3b82f6' },
  { id: '2', subject: 'ಕನ್ನಡ', progress: 40, icon: 'language-outline' as const, color: '#8b5cf6' },
  { id: '3', subject: 'EVS', progress: 90, icon: 'leaf-outline' as const, color: '#10b981' },
];

export default function Index() {
  const router = useRouter();
  const backgroundProgress = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    backgroundProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const animatedGradientProps = useAnimatedProps(() => {
    const color1 = interpolateColor(backgroundProgress.value, [0, 1], ['#eaf3fa', '#d9e8f5']);
    const color2 = interpolateColor(backgroundProgress.value, [0, 1], ['#d9e8f5', '#eaf3fa']);
    return { colors: [color1, color2] as [string, string] };
  });

  const titleStyle = useStaggeredAnimation(100, 'top');
  const buttonStyle = useStaggeredAnimation(600, 'bottom');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Letters And Ladders',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#fff',
          headerBackVisible: false,
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.Text style={[styles.title, titleStyle]}>My Progress</Animated.Text>

        {mockProgressData.map((item, index) => {
          const cardStyle = useStaggeredAnimation(200 + index * 100, 'bottom');
          return (
            <Animated.View key={item.id} style={[styles.progressCard, cardStyle]}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.subjectTitle}>{item.subject}</Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                </View>
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
        <TouchableOpacity onPress={() => router.push('/SelectionPage')} onPressIn={() => (buttonScale.value = withSpring(0.98))} onPressOut={() => (buttonScale.value = withSpring(1))} activeOpacity={1}>
          <Animated.View style={[styles.button, { transform: [{ scale: buttonScale.value }] }]}>
            <Text style={styles.buttonText}>Start New Lesson</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: { flex: 1 },
  headerTitle: { fontWeight: 'bold', color: '#fff', fontSize: 20 },
  profileButton: {
    marginRight: 16,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120, // Space for the floating button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569',
    marginLeft: 16,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  shapeBase: { position: 'absolute', borderRadius: 9999 },
  shape1: { width: 200, height: 200, top: '15%', left: -80 },
  shape2: { width: 150, height: 150, bottom: '10%', right: -60 },
  shape3: { width: 100, height: 100, top: '50%', left: 20 },
});
